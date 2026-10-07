-- attendance.records.correct, statement 3 of 3: when the corrected day now has a clock-out, a
-- break still running in it (a forgotten clock-out, a needs_review day) is closed at that
-- clock-out, or at its own start if it began after it. Otherwise it would stay open forever:
-- break_end only reaches breaks of OPEN days. 0 rows is the normal case. An impossible
-- clock-out matches no row, so the cast in SET is never reached (the gate then rolls back).
UPDATE attendance_break
SET ended_at   = CASE
                   WHEN erp_dt(started_at) < erp_dt(CAST(:clock_out_at AS TEXT))
                   THEN CAST(:clock_out_at AS TEXT)
                   ELSE started_at
                 END,
    updated_by = :current_user_id,
    updated_at = CAST(:now AS TEXT)
WHERE hub_id = :hub_id
  AND record_id = CAST(:record_id AS TEXT)
  AND ended_at IS NULL
  AND is_deleted = 0
  AND CAST(:clock_out_at AS TEXT) IS NOT NULL
  AND pg_input_is_valid(CAST(:clock_out_at AS TEXT), 'timestamptz')
