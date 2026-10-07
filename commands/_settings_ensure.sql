-- attendance.settings.update, statement 1 of 2: makes sure this hub HAS its settings row before
-- updating it (pattern of staff#13). A hub installed without a blueprint has no row, the UPDATE
-- would touch 0 rows and the screen would keep showing defaults that look exactly like saved
-- values. The settings columns are not listed on purpose: they take the table DEFAULT, the single
-- source of those values. ON CONFLICT (hub_id) makes it idempotent and race-proof.
INSERT INTO attendance_settings
  (id, hub_id, is_deleted, created_by, updated_by, created_at, updated_at)
VALUES
  (:new_id, :hub_id, 0, :current_user_id, :current_user_id, CAST(:now AS TEXT), CAST(:now AS TEXT))
ON CONFLICT (hub_id) DO NOTHING
