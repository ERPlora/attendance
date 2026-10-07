-- attendance._auto_review_stale: run by the scheduled task auto_review_stale every 15 minutes,
-- WITHOUT a user (:current_user_id is empty, so updated_by is left as it was). Flags as
-- needs_review every OPEN working day older than the hub's auto_close_after_hours (12 when the
-- hub never saved its settings). It does not invent a clock-out: a manager closes the day with a
-- correction. Freeing the open slot is what lets the person clock in again the next day.
-- 0 rows is the normal case, so this command has no guard, and it EMITS NOTHING (attendance#13):
-- the runtime writes a command's events once per run, flagged or not, so a declared event went
-- out every 15 minutes with nothing flagged and no record id. A row gate is no way out either: it
-- rolls the run back and the scheduler retries it with an error every 5 minutes. The per-day
-- event comes back when the runtime can emit per affected row (hub#2612, attendance#15).
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
