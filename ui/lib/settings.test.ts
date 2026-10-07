import { describe, expect, it } from 'vitest';
import schema from '../../schemas/settings_update.json';
import { DEFAULT_SETTINGS, RADIUS_OPTIONS, settingsFrom } from './settings';

describe('DEFAULT_SETTINGS', () => {
  it('are the defaults the settings schema declares (one source of truth)', () => {
    const p = schema.properties;
    expect(DEFAULT_SETTINGS).toEqual({
      require_location: p.require_location.default,
      geofence_radius_m: p.geofence_radius_m.default,
      workplace_lat: p.workplace_lat.default,
      workplace_lng: p.workplace_lng.default,
      auto_close_after_hours: p.auto_close_after_hours.default,
    });
    expect(DEFAULT_SETTINGS).toEqual({
      require_location: 0,
      geofence_radius_m: 100,
      workplace_lat: null,
      workplace_lng: null,
      auto_close_after_hours: 12,
    });
  });

  it('offer exactly the radii the schema accepts', () => {
    expect(RADIUS_OPTIONS).toEqual([50, 100, 250, 500, 1000]);
  });
});

describe('settingsFrom', () => {
  it('answers the defaults when the hub has no settings row yet', () => {
    expect(settingsFrom([])).toEqual(DEFAULT_SETTINGS);
    expect(settingsFrom(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(settingsFrom(null)).toEqual(DEFAULT_SETTINGS);
  });

  it('reads the single row of attendance.settings.get', () => {
    expect(
      settingsFrom([
        { require_location: 1, geofence_radius_m: 250, workplace_lat: 40.4, workplace_lng: -3.7, auto_close_after_hours: 10 },
      ]),
    ).toEqual({ require_location: 1, geofence_radius_m: 250, workplace_lat: 40.4, workplace_lng: -3.7, auto_close_after_hours: 10 });
  });

  it('accepts numbers that arrive as strings (Postgres REAL/NUMERIC over JSON)', () => {
    expect(
      settingsFrom([
        { require_location: '1', geofence_radius_m: '500', workplace_lat: '40.5', workplace_lng: '-3.5', auto_close_after_hours: '8' },
      ]),
    ).toEqual({ require_location: 1, geofence_radius_m: 500, workplace_lat: 40.5, workplace_lng: -3.5, auto_close_after_hours: 8 });
  });

  it('keeps an unset coordinate as null, never as 0 (0,0 is a real place in the ocean)', () => {
    const s = settingsFrom([{ require_location: 1, geofence_radius_m: 100, workplace_lat: null, workplace_lng: '', auto_close_after_hours: 12 }]);
    expect(s.workplace_lat).toBeNull();
    expect(s.workplace_lng).toBeNull();
  });

  it('falls back to the default for a value outside the contract', () => {
    const s = settingsFrom([{ require_location: 7, geofence_radius_m: 120, workplace_lat: 95, workplace_lng: -200, auto_close_after_hours: 40 }]);
    expect(s).toEqual(DEFAULT_SETTINGS);
  });
});
