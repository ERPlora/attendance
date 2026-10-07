-- attendance.records.correct, statement 1 of 3: writes the TRAIL row (old values, new values,
-- reason) copied from the record as it is NOW, so it has to run before the UPDATE.
-- The guard is anchored HERE: 0 rows answer attendance.record_not_found and roll back the whole
-- command. It inserts nothing when:
--   * the record does not exist in this hub (or is deleted),
--   * a new time is not a real date (2026-13-45, 2026-02-30). The schema pattern only checks
--     the SHAPE, and casting an impossible date is a Postgres error, a 500. The CASE checks it
--     with pg_input_is_valid BEFORE any cast: a CASE evaluates its branches in order, an AND does
--     not promise to,
--   * the new clock-out is not after the new clock-in (the UI checks first and shows its local
--     string ui.records.invalidCorrection, this is the safety net),
--   * the correction would REOPEN the day (no clock-out) while the same person already has
--     another open day: the one-open-day index would otherwise turn it into a 500,
--   * the new times overlap ANOTHER working day of the same person (attendance#12): those minutes
--     would count twice in the record and the CSV. The new day runs to its clock-out, or to now
--     when it is reopened. The other day runs to its clock-out, to now when it is open, and is
--     only its clock-in instant when it is needs_review (its end is unknown, and stretching it to
--     now would block every later day of the person until a manager closes it). Touching is not
--     overlapping: a day may start at the very instant the previous one ended. Compared by
--     instant (erp_dt), never as text: the clock writes `+00:00` with nanoseconds, a correction
--     writes `Z`. The new times are cast inside the subquery only through a CASE that checks
--     pg_input_is_valid first: Postgres plans a subquery on its own and folds a constant
--     `'2026-02-30'::timestamptz` there even when the outer CASE already said FALSE (a 500).
INSERT INTO attendance_correction
  (id, hub_id, record_id,
   old_clock_in_at, old_clock_out_at, old_status,
   new_clock_in_at, new_clock_out_at, new_status,
   reason, is_deleted, created_by, updated_by, created_at, updated_at)
SELECT :new_id, :hub_id, r.id,
       r.clock_in_at, r.clock_out_at, r.status,
       CAST(:clock_in_at AS TEXT), CAST(:clock_out_at AS TEXT),
       CASE WHEN CAST(:clock_out_at AS TEXT) IS NULL THEN 'open' ELSE 'closed' END,
       CAST(:reason AS TEXT), 0, :current_user_id, :current_user_id,
       CAST(:now AS TEXT), CAST(:now AS TEXT)
FROM attendance_record r
WHERE r.hub_id = :hub_id
  AND r.id = CAST(:record_id AS TEXT)
  AND r.is_deleted = 0
  AND CASE
        WHEN NOT pg_input_is_valid(CAST(:clock_in_at AS TEXT), 'timestamptz') THEN FALSE
        WHEN CAST(:clock_out_at AS TEXT) IS NOT NULL
             AND NOT pg_input_is_valid(CAST(:clock_out_at AS TEXT), 'timestamptz') THEN FALSE
        WHEN CAST(:clock_out_at AS TEXT) IS NOT NULL
             AND erp_dt(CAST(:clock_out_at AS TEXT)) <= erp_dt(CAST(:clock_in_at AS TEXT)) THEN FALSE
        ELSE NOT EXISTS (
               SELECT 1
                 FROM attendance_record d
                WHERE d.hub_id = :hub_id
                  AND d.user_id = r.user_id
                  AND d.id <> r.id
                  AND d.is_deleted = 0
                  AND erp_dt(d.clock_in_at)
                      < erp_dt(CASE WHEN pg_input_is_valid(COALESCE(CAST(:clock_out_at AS TEXT),
                                                                    CAST(:now AS TEXT)), 'timestamptz')
                                    THEN COALESCE(CAST(:clock_out_at AS TEXT), CAST(:now AS TEXT)) END)
                  AND erp_dt(COALESCE(d.clock_out_at,
                                      CASE WHEN d.status = 'open' THEN CAST(:now AS TEXT)
                                           ELSE d.clock_in_at END))
                      > erp_dt(CASE WHEN pg_input_is_valid(CAST(:clock_in_at AS TEXT), 'timestamptz')
                                    THEN CAST(:clock_in_at AS TEXT) END))
      END
  AND (CAST(:clock_out_at AS TEXT) IS NOT NULL
       OR NOT EXISTS (
            SELECT 1
              FROM attendance_record o
             WHERE o.hub_id = :hub_id
               AND o.user_id = r.user_id
               AND o.id <> r.id
               AND o.status = 'open'
               AND o.is_deleted = 0))
