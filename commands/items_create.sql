-- attendance.items.create
-- El runtime inyecta los BINDS (:hub_id, :current_user_id, :now…) — nunca las COLUMNAS. Nombrarlas
-- es cosa del módulo: un INSERT que no escriba `hub_id` deja NULL una columna NOT NULL y falla en
-- TODOS los hubs (module-toolkit#80). PREPARA bien, así que `validate --pg` no lo vería: quien lo
-- comprueba es la puerta de tenancy de `erplora validate`.
INSERT INTO attendance_items (id, hub_id, name, code, amount, created_by, updated_by)
VALUES (:id, :hub_id, :name, :code, :amount, :current_user_id, :current_user_id);
