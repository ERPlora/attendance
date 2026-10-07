// The time clock settings as both screens read them. The defaults are NOT repeated here: they are
// the ones `schemas/settings_update.json` declares (the same values the table uses as DEFAULT), so
// a hub with no settings row yet behaves exactly as the schema says.
import schema from '../../schemas/settings_update.json';

export interface Settings {
  require_location: 0 | 1;
  geofence_radius_m: number;
  workplace_lat: number | null;
  workplace_lng: number | null;
  auto_close_after_hours: number;
}

const P = schema.properties;

export const RADIUS_OPTIONS: readonly number[] = P.geofence_radius_m.enum;

export const AUTO_CLOSE_MIN = P.auto_close_after_hours.minimum;
export const AUTO_CLOSE_MAX = P.auto_close_after_hours.maximum;

export const DEFAULT_SETTINGS: Readonly<Settings> = Object.freeze({
  require_location: P.require_location.default as 0 | 1,
  geofence_radius_m: P.geofence_radius_m.default,
  workplace_lat: P.workplace_lat.default as number | null,
  workplace_lng: P.workplace_lng.default as number | null,
  auto_close_after_hours: P.auto_close_after_hours.default,
});

function num(v: unknown): number | null {
  if (v === null || v === undefined || (typeof v === 'string' && !v.trim())) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function coordinate(v: unknown, limit: number): number | null {
  const n = num(v);
  return n !== null && Math.abs(n) <= limit ? n : null;
}

/** The row of `attendance.settings.get` (0 or 1 rows) as {@link Settings}; no row → defaults. */
export function settingsFrom(rows: unknown): Settings {
  const row = (Array.isArray(rows) ? rows[0] : null) as Record<string, unknown> | null | undefined;
  if (!row || typeof row !== 'object') return { ...DEFAULT_SETTINGS };
  const flag = num(row.require_location);
  const radius = num(row.geofence_radius_m);
  const hours = num(row.auto_close_after_hours);
  return {
    require_location: flag === 1 ? 1 : flag === 0 ? 0 : DEFAULT_SETTINGS.require_location,
    geofence_radius_m: radius !== null && RADIUS_OPTIONS.includes(radius) ? radius : DEFAULT_SETTINGS.geofence_radius_m,
    workplace_lat: coordinate(row.workplace_lat, P.workplace_lat.maximum),
    workplace_lng: coordinate(row.workplace_lng, P.workplace_lng.maximum),
    auto_close_after_hours:
      hours !== null && Number.isInteger(hours) && hours >= AUTO_CLOSE_MIN && hours <= AUTO_CLOSE_MAX
        ? hours
        : DEFAULT_SETTINGS.auto_close_after_hours,
  };
}
