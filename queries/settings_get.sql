-- attendance.settings.get: the settings singleton of this hub, 0 or 1 row.
-- No row means a freshly installed hub: every screen falls back to the schema defaults, which are
-- the same values the table declares as DEFAULT.
SELECT require_location, geofence_radius_m, workplace_lat, workplace_lng, auto_close_after_hours
FROM attendance_settings
WHERE hub_id = :hub_id AND is_deleted = 0
