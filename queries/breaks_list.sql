-- attendance.breaks.list: every break of this hub (managers, attendance.view_all).
SELECT b.id,
       b.record_id,
       b.started_at,
       b.ended_at
FROM attendance_break b
WHERE b.hub_id = :hub_id
  AND b.is_deleted = 0
