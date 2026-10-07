-- attendance.records.correct, statement 2 of 3: applies the correction. SAME conditions as the
-- trail INSERT (valid dates and the no-overlap rule of attendance#12 included), and that is load-bearing, not tidy: the gate is checked
-- after every statement ran, so an UPDATE without them would cast an impossible date or hit the
-- one-open-day index and turn the polite attendance.record_not_found into a 500. Without a clock-out the day is open again, with
-- one it is closed (this is also how a manager closes a needs_review day).
UPDATE attendance_record
SET clock_in_at  = CAST(:clock_in_at AS TEXT),
    clock_out_at = CAST(:clock_out_at AS TEXT),
    status       = CASE WHEN CAST(:clock_out_at AS TEXT) IS NULL THEN 'open' ELSE 'closed' END,
    updated_by   = :current_user_id,
    updated_at   = CAST(:now AS TEXT)
WHERE hub_id = :hub_id
  AND id = CAST(:record_id AS TEXT)
  AND is_deleted = 0
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
                  AND d.user_id = attendance_record.user_id
                  AND d.id <> attendance_record.id
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
               AND o.user_id = attendance_record.user_id
               AND o.id <> attendance_record.id
               AND o.status = 'open'
               AND o.is_deleted = 0))
