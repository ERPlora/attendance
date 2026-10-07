// Mode of THIS device as the hub answers it (`GET /api/device/mode`, no session needed):
// `shared` is the counter POS, `personal` somebody's own phone or laptop.
//
// It fails towards the STRICT mode, exactly like the shell (hub `apps/web/src/lib/device-mode.ts`):
// only an explicit `personal` from the hub moves it, and anything else (a network error, a non-2xx,
// a body that is not the envelope, a spelling outside the closed pair) reads as `shared`. It is
// never cached: a stored `personal` would be a switch sitting in devtools.

export type DeviceMode = 'shared' | 'personal';

const STRICT: DeviceMode = 'shared';

function deviceId(): string {
  try {
    return localStorage.getItem('erplora.device_id') ?? '';
  } catch {
    return '';
  }
}

export async function readDeviceMode(fetchImpl: typeof fetch = globalThis.fetch): Promise<DeviceMode> {
  try {
    if (typeof fetchImpl !== 'function') return STRICT;
    const res = await fetchImpl('/api/device/mode', { headers: { 'X-Device-Id': deviceId() } });
    if (!res.ok) return STRICT;
    const body = (await res.json()) as { ok?: unknown; data?: { mode?: unknown } } | null;
    return body?.ok === true && body.data?.mode === 'personal' ? 'personal' : STRICT;
  } catch {
    return STRICT;
  }
}
