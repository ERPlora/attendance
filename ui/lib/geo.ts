// Geolocation helpers of the time clock: pure distance maths plus ONE wrapper around
// `navigator.geolocation`, so both screens (clock and settings) read a position the same way and
// get the same typed failures.

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Position extends LatLng {
  accuracy_m: number;
}

/** Why a position could not be read. Closed set: each one has its own sentence in the UI. */
export type GeoErrorCode = 'denied' | 'unavailable' | 'timeout' | 'unsupported';

export class GeoError extends Error {
  readonly code: GeoErrorCode;

  constructor(code: GeoErrorCode, message?: string) {
    super(message || code);
    this.name = 'GeoError';
    this.code = code;
  }
}

/** Mean Earth radius (IUGG), metres. */
const EARTH_RADIUS_M = 6_371_008.8;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/** Great-circle distance between two points, in metres (Haversine). */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Is `distance` inside the allowed `radius`? The edge counts as inside; a non-number never does. */
export function withinRadius(distance: number, radius: number): boolean {
  return Number.isFinite(distance) && distance <= radius;
}

/** How long the browser may take to fix a position (spec §6: 15 s, high accuracy). */
export const POSITION_TIMEOUT_MS = 15_000;

/**
 * Extra time on top of {@link POSITION_TIMEOUT_MS} before giving up on a browser that never calls
 * back at all (a permission prompt left open, a WebView without the location permission declared).
 * Without it the button would stay busy forever.
 */
const NO_ANSWER_GRACE_MS = 15_000;

const BROWSER_CODES: Record<number, GeoErrorCode> = { 1: 'denied', 2: 'unavailable', 3: 'timeout' };

/** The device position, or a {@link GeoError} saying why not. */
export function getPosition(): Promise<Position> {
  const geo = (globalThis.navigator as Navigator | undefined)?.geolocation;
  if (!geo || typeof geo.getCurrentPosition !== 'function') {
    return Promise.reject(new GeoError('unsupported'));
  }
  return new Promise<Position>((resolve, reject) => {
    let settled = false;
    const guard = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new GeoError('timeout'));
    }, POSITION_TIMEOUT_MS + NO_ANSWER_GRACE_MS);
    const finish = (fn: () => void): void => {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      fn();
    };
    try {
      geo.getCurrentPosition(
        (p) =>
          finish(() =>
            resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy_m: p.coords.accuracy }),
          ),
        (e) => finish(() => reject(new GeoError(BROWSER_CODES[e?.code] ?? 'unavailable', e?.message))),
        { enableHighAccuracy: true, timeout: POSITION_TIMEOUT_MS, maximumAge: 0 },
      );
    } catch (e) {
      finish(() => reject(new GeoError('unavailable', e instanceof Error ? e.message : undefined)));
    }
  });
}
