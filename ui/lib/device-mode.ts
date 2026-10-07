// Mode of THIS device: `shared` is the counter POS, `personal` somebody's own phone or laptop.
//
// A hub whose SDK exposes `erplora.deviceMode` (hub#2584) is the source: the shell already knows
// the mode, including in the installed app. Only when the SDK does not carry it (a hub older than
// that SDK) does the module ask the HTTP door (`GET /api/device/mode`, no session needed), which in
// the installed app answers `shared` (native device id, different runtime origin).
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

function fromSdk(): DeviceMode | null {
  try {
    const mode = (globalThis as { erplora?: { deviceMode?: unknown } }).erplora?.deviceMode;
    return mode === 'personal' || mode === 'shared' ? mode : null;
  } catch {
    return null;
  }
}

export async function readDeviceMode(fetchImpl: typeof fetch = globalThis.fetch): Promise<DeviceMode> {
  const sdkMode = fromSdk();
  if (sdkMode) return sdkMode;
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
