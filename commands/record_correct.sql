-- attendance.records.correct, statement 2 of 3: applies the correction. SAME conditions as the
-- trail INSERT, and that is load-bearing, not tidy: the gate is checked after every statement
-- ran, so an UPDATE without the reopen condition would hit the one-open-day index and turn the
-- polite attendance.record_not_found into a 500. Without a clock-out the day is open again, with
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
  AND (CAST(:clock_out_at AS TEXT) IS NULL
       OR erp_dt(CAST(:clock_out_at AS TEXT)) > erp_dt(CAST(:clock_in_at AS TEXT)))
  AND (CAST(:clock_out_at AS TEXT) IS NOT NULL
       OR NOT EXISTS (
            SELECT 1
              FROM attendance_record o
             WHERE o.hub_id = :hub_id
               AND o.user_id = attendance_record.user_id
               AND o.id <> attendance_record.id
               AND o.status = 'open'
               AND o.is_deleted = 0))
