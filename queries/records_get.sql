-- attendance.records.get: one working day by :record_id, every column, scoped to this hub.
-- No screen calls it today (the correction dialog works from the row of the list): it is the read
-- for the API and the assistant, one day with every column, location included.
SELECT r.id,
       r.user_id,
       r.clock_in_at,
       r.clock_out_at,
       r.status,
       r.source,
       r.in_lat,
       r.in_lng,
       r.in_accuracy_m,
       r.in_distance_m,
       r.in_within_radius,
       r.out_lat,
       r.out_lng,
       r.out_accuracy_m,
       r.out_distance_m,
       r.out_within_radius,
       r.note,
       r.created_by,
       r.updated_by,
       r.created_at,
       r.updated_at
FROM attendance_record r
WHERE r.hub_id = :hub_id
  AND r.id = CAST(:record_id AS TEXT)
  AND r.is_deleted = 0
