-- attendance.settings.update, statement 2 of 2: writes the FULL snapshot the screen sends.
-- workplace_lat / workplace_lng NULL means "not set" and is a legitimate value to save.
-- The guard is anchored here: 0 rows answer attendance.settings_not_saved.
UPDATE attendance_settings
SET require_location       = :require_location,
    geofence_radius_m      = :geofence_radius_m,
    workplace_lat          = :workplace_lat,
    workplace_lng          = :workplace_lng,
    auto_close_after_hours = :auto_close_after_hours,
    updated_by             = :current_user_id,
    updated_at             = CAST(:now AS TEXT)
WHERE hub_id = :hub_id
  AND is_deleted = 0
