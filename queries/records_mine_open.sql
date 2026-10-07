-- attendance.records.mine_open: the caller's OPEN working day, 0 or 1 row (the partial unique
-- index allows no more). Carries the running break, if any, so the clock screen knows whether to
-- offer "Start break" or "End break" without a second round trip.
SELECT r.id,
       r.clock_in_at,
       r.source,
       r.in_distance_m,
       r.in_within_radius,
       (SELECT b.id
          FROM attendance_break b
         WHERE b.hub_id = :hub_id AND b.record_id = r.id
           AND b.ended_at IS NULL AND b.is_deleted = 0) AS open_break_id,
       (SELECT b.started_at
          FROM attendance_break b
         WHERE b.hub_id = :hub_id AND b.record_id = r.id
           AND b.ended_at IS NULL AND b.is_deleted = 0) AS open_break_started_at
FROM attendance_record r
WHERE r.hub_id = :hub_id
  AND r.user_id = :current_user_id
  AND r.status = 'open'
  AND r.is_deleted = 0
