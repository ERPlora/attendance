-- attendance.breaks.mine: the CALLER's breaks (the JOIN keeps only breaks of working days that
-- belong to :current_user_id). The clock screen sums today's breaks from here, the running one
-- included, because breaks_closed_minutes only counts the closed ones.
SELECT b.id,
       b.record_id,
       b.started_at,
       b.ended_at
FROM attendance_break b
JOIN attendance_record r
  ON r.id = b.record_id AND r.hub_id = :hub_id AND r.is_deleted = 0
WHERE b.hub_id = :hub_id
  AND r.user_id = :current_user_id
  AND b.is_deleted = 0
