-- attendance.break_start: starts a break in the caller's OPEN working day. 0 rows (and the guard
-- answers attendance.break_rejected) when there is no open day or a break is already running.
-- ON CONFLICT on the one-running-break index turns a double tap into 0 rows, not a 500.
INSERT INTO attendance_break
  (id, hub_id, record_id, started_at, is_deleted, created_by, updated_by, created_at, updated_at)
SELECT :new_id, :hub_id, r.id, CAST(:now AS TEXT), 0,
       :current_user_id, :current_user_id, CAST(:now AS TEXT), CAST(:now AS TEXT)
FROM attendance_record r
WHERE r.hub_id = :hub_id
  AND r.user_id = :current_user_id
  AND r.status = 'open'
  AND r.is_deleted = 0
  AND NOT EXISTS (
        SELECT 1
          FROM attendance_break b
         WHERE b.hub_id = :hub_id
           AND b.record_id = r.id
           AND b.ended_at IS NULL
           AND b.is_deleted = 0)
ON CONFLICT (hub_id, record_id) WHERE ended_at IS NULL AND is_deleted = 0 DO NOTHING
