-- attendance: esquema inicial (Postgres). Las columnas del CONTRATO DE FILA (hub_id,
-- is_deleted/deleted_at, created_by/updated_by, created_at/updated_at) se declaran AQUÍ y las
-- escribe el SQL del módulo: el runtime aporta los binds (:hub_id, :current_user_id…), no las
-- columnas — creer lo contrario es lo que dejaba el INSERT sin hub_id (module-toolkit#80).
-- OJO: ningun punto y coma dentro de un comentario. Los hubs pineados a tags parten el
-- fichero por ahi y rechazan el modulo ENTERO al instalar (module-toolkit#70, hub#1027).
CREATE TABLE IF NOT EXISTS attendance_items (
  id          TEXT PRIMARY KEY,
  hub_id      TEXT NOT NULL,
  name        TEXT NOT NULL,
  code        TEXT,
  amount      REAL NOT NULL DEFAULT 0,
  is_deleted  INTEGER NOT NULL DEFAULT 0,
  deleted_at  TEXT,
  created_by  TEXT,
  updated_by  TEXT,
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_attendance_items_name ON attendance_items(hub_id, name);
