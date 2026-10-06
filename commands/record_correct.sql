-- attendance.records.correct, statement 2 of 3: applies the correction. Same conditions as the
-- trail INSERT, so the two can never disagree. Without a clock-out the day is open again,
-- with one it is closed (this is also how a manager closes a needs_review day).
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
