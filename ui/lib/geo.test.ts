import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPosition, haversineMeters, withinRadius, GeoError } from './geo';

// Puerta del Sol (km 0) and the Cibeles fountain, Madrid. The walk along Alcalá is about 1 km; the
// straight line between the two is ~943 m (dLat 0.00258° ≈ 287 m north, dLng 0.0106° ≈ 898 m east
// at this latitude), so the check is 943 m ±5 % rather than a round kilometre.
const SOL = { lat: 40.416775, lng: -3.70379 };
const CIBELES = { lat: 40.419356, lng: -3.693186 };

describe('haversineMeters', () => {
  it('measures Sol to Cibeles as about one kilometre (943 m ±5 %)', () => {
    const d = haversineMeters(SOL, CIBELES);
    expect(d).toBeGreaterThan(943 * 0.95);
    expect(d).toBeLessThan(943 * 1.05);
  });

  it('measures one degree of latitude as ~111.2 km (independent reference)', () => {
    expect(haversineMeters({ lat: 40, lng: -3 }, { lat: 41, lng: -3 })).toBeCloseTo(111_195, -1);
  });

  it('is symmetric', () => {
    expect(haversineMeters(SOL, CIBELES)).toBeCloseTo(haversineMeters(CIBELES, SOL), 6);
  });

  it('is 0 for the same point', () => {
    expect(haversineMeters(SOL, SOL)).toBe(0);
  });
});

describe('withinRadius', () => {
  it('accepts a distance below the radius', () => {
    expect(withinRadius(99.9, 100)).toBe(true);
  });

  it('accepts a distance exactly on the radius (the edge is inside)', () => {
    expect(withinRadius(100, 100)).toBe(true);
  });

  it('rejects a distance beyond the radius', () => {
    expect(withinRadius(100.1, 100)).toBe(false);
  });

  it('rejects a distance that is not a finite number', () => {
    expect(withinRadius(Number.NaN, 100)).toBe(false);
    expect(withinRadius(Number.POSITIVE_INFINITY, 100)).toBe(false);
  });
});

type Geo = {
  getCurrentPosition: (
    ok: (p: { coords: { latitude: number; longitude: number; accuracy: number } }) => void,
    fail: (e: { code: number; message: string }) => void,
    opts?: PositionOptions,
  ) => void;
};

function withGeolocation(geo: Geo | undefined): void {
  Object.defineProperty(globalThis.navigator, 'geolocation', { value: geo, configurable: true });
}

afterEach(() => {
  withGeolocation(undefined);
  vi.useRealTimers();
});

describe('getPosition', () => {
  it('resolves lat, lng and accuracy and asks for high accuracy with a 15 s timeout', async () => {
    let asked: PositionOptions | undefined;
    withGeolocation({
      getCurrentPosition: (ok, _fail, opts) => {
        asked = opts;
        ok({ coords: { latitude: 40.1, longitude: -3.2, accuracy: 12.5 } });
      },
    });
    await expect(getPosition()).resolves.toEqual({ lat: 40.1, lng: -3.2, accuracy_m: 12.5 });
    expect(asked).toMatchObject({ enableHighAccuracy: true, timeout: 15000 });
  });

  it('rejects with `denied` when the person refuses the permission', async () => {
    withGeolocation({ getCurrentPosition: (_ok, fail) => fail({ code: 1, message: 'User denied' }) });
    const err = await getPosition().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(GeoError);
    expect((err as GeoError).code).toBe('denied');
  });

  it('rejects with `unavailable` when the device cannot fix a position', async () => {
    withGeolocation({ getCurrentPosition: (_ok, fail) => fail({ code: 2, message: 'No fix' }) });
    await expect(getPosition()).rejects.toMatchObject({ code: 'unavailable' });
  });

  it('rejects with `timeout` when the browser gives up', async () => {
    withGeolocation({ getCurrentPosition: (_ok, fail) => fail({ code: 3, message: 'Timeout' }) });
    await expect(getPosition()).rejects.toMatchObject({ code: 'timeout' });
  });

  it('rejects with `unsupported` when there is no geolocation API', async () => {
    withGeolocation(undefined);
    await expect(getPosition()).rejects.toMatchObject({ code: 'unsupported' });
  });

  it('rejects with `timeout` when the browser never answers at all (a callback that never fires)', async () => {
    vi.useFakeTimers();
    withGeolocation({ getCurrentPosition: () => undefined });
    const pending = getPosition().catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(await pending).toMatchObject({ code: 'timeout' });
  });
});
