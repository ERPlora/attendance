-- attendance.clock_out: closes the caller's OPEN working day and records where it was closed
-- from (all location binds optional, NULL when location is not required). 0 rows (the guard
-- answers attendance.no_open_record) when the caller has no open working day.
UPDATE attendance_record
SET clock_out_at      = CAST(:now AS TEXT),
    status            = 'closed',
    out_lat           = :lat,
    out_lng           = :lng,
    out_accuracy_m    = :accuracy_m,
    out_distance_m    = :distance_m,
    out_within_radius = :within_radius,
    updated_by        = :current_user_id,
    updated_at        = CAST(:now AS TEXT)
WHERE hub_id = :hub_id
  AND user_id = :current_user_id
  AND status = 'open'
  AND is_deleted = 0
