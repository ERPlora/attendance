-- attendance: initial schema (Postgres). Time clock / working-day record (art. 34.9 ET).
-- The ROW CONTRACT columns (hub_id, is_deleted/deleted_at, created_by/updated_by,
-- created_at/updated_at) are declared HERE and written by the module's own SQL: the runtime
-- supplies the binds (:hub_id, :current_user_id, :now), never the columns (module-toolkit#80).
-- WARNING: never put a semicolon inside a comment. Hubs pinned to tags split the file there
-- and reject the WHOLE module at install time (module-toolkit#70, hub#1027).

-- One row per working day (session model: Odoo, Square, Toast). Never deleted: the law asks
-- for four years of records, and a correction is a new row in attendance_correction.
CREATE TABLE IF NOT EXISTS attendance_record (
  id                TEXT PRIMARY KEY,
  hub_id            TEXT NOT NULL,
  user_id           TEXT NOT NULL,
  clock_in_at       TEXT NOT NULL,
  clock_out_at      TEXT,
  status            TEXT NOT NULL DEFAULT 'open',
  source            TEXT NOT NULL,
  in_lat            REAL,
  in_lng            REAL,
  in_accuracy_m     REAL,
  in_distance_m     REAL,
  in_within_radius  INTEGER,
  out_lat           REAL,
  out_lng           REAL,
  out_accuracy_m    REAL,
  out_distance_m    REAL,
  out_within_radius INTEGER,
  note              TEXT NOT NULL DEFAULT '',
  is_deleted        INTEGER NOT NULL DEFAULT 0,
  deleted_at        TEXT,
  created_by        TEXT,
  updated_by        TEXT,
  created_at        TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_attendance_record_user_status ON attendance_record(hub_id, user_id, status);
CREATE INDEX IF NOT EXISTS idx_attendance_record_clock_in ON attendance_record(hub_id, clock_in_at);
-- One OPEN working day per person. The NOT EXISTS guard of clock_in is the polite answer,
-- this index is what still holds when two taps race (clock_in uses ON CONFLICT DO NOTHING).
CREATE UNIQUE INDEX IF NOT EXISTS uq_attendance_record_one_open ON attendance_record(hub_id, user_id) WHERE status = 'open' AND is_deleted = 0;

-- Breaks of a working day. ended_at stays NULL while the break is running.
CREATE TABLE IF NOT EXISTS attendance_break (
  id          TEXT PRIMARY KEY,
  hub_id      TEXT NOT NULL,
  record_id   TEXT NOT NULL,
  started_at  TEXT NOT NULL,
  ended_at    TEXT,
  is_deleted  INTEGER NOT NULL DEFAULT 0,
  deleted_at  TEXT,
  created_by  TEXT,
  updated_by  TEXT,
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_attendance_break_record ON attendance_break(hub_id, record_id);
-- At most one RUNNING break per working day, for the same race reason as above.
CREATE UNIQUE INDEX IF NOT EXISTS uq_attendance_break_one_open ON attendance_break(hub_id, record_id) WHERE ended_at IS NULL AND is_deleted = 0;

-- Immutable trail of every correction a manager makes: old values, new values and the reason.
CREATE TABLE IF NOT EXISTS attendance_correction (
  id                TEXT PRIMARY KEY,
  hub_id            TEXT NOT NULL,
  record_id         TEXT NOT NULL,
  old_clock_in_at   TEXT,
  old_clock_out_at  TEXT,
  old_status        TEXT,
  new_clock_in_at   TEXT NOT NULL,
  new_clock_out_at  TEXT,
  new_status        TEXT NOT NULL,
  reason            TEXT NOT NULL,
  is_deleted        INTEGER NOT NULL DEFAULT 0,
  deleted_at        TEXT,
  created_by        TEXT,
  updated_by        TEXT,
  created_at        TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_attendance_correction_record ON attendance_correction(hub_id, record_id);

-- Settings singleton per hub. A hub without a row behaves with these DEFAULTS, and the
-- settings command creates the row on first save (_settings_ensure.sql).
CREATE TABLE IF NOT EXISTS attendance_settings (
  id                      TEXT PRIMARY KEY,
  hub_id                  TEXT NOT NULL,
  require_location        INTEGER NOT NULL DEFAULT 0,
  geofence_radius_m       INTEGER NOT NULL DEFAULT 100,
  workplace_lat           REAL,
  workplace_lng           REAL,
  auto_close_after_hours  INTEGER NOT NULL DEFAULT 12,
  is_deleted              INTEGER NOT NULL DEFAULT 0,
  deleted_at              TEXT,
  created_by              TEXT,
  updated_by              TEXT,
  created_at              TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_attendance_settings_hub ON attendance_settings(hub_id);
