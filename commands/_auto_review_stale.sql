-- attendance._auto_review_stale: run by the scheduled task auto_review_stale every 15 minutes,
-- WITHOUT a user (:current_user_id is empty, so updated_by is left as it was). Flags as
-- needs_review every OPEN working day older than the hub's auto_close_after_hours (12 when the
-- hub never saved its settings). It does not invent a clock-out: a manager closes the day with a
-- correction. Freeing the open slot is what lets the person clock in again the next day.
-- 0 rows is the normal case, so this command has no guard.
UPDATE attendance_record
SET status     = 'needs_review',
    updated_at = CAST(:now AS TEXT)
WHERE hub_id = :hub_id
  AND status = 'open'
  AND is_deleted = 0
  AND erp_dt(erp_dateadd(clock_in_at,
                         COALESCE((SELECT s.auto_close_after_hours
                                     FROM attendance_settings s
                                    WHERE s.hub_id = :hub_id AND s.is_deleted = 0), 12),
                         'hours')) < erp_dt(CAST(:now AS TEXT))
