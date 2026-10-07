import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readDeviceMode } from './device-mode';

// A Map-backed Storage: the test runner's global `localStorage` is not reliably the DOM one.
function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k: string) => data.get(k) ?? null,
    key: (i: number) => [...data.keys()][i] ?? null,
    removeItem: (k: string) => void data.delete(k),
    setItem: (k: string, v: string) => void data.set(k, String(v)),
  };
}

beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()));

function answer(status: number, body: unknown): typeof fetch {
  return vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
}

afterEach(() => vi.unstubAllGlobals());

describe('readDeviceMode', () => {
  it('answers `personal` only when the hub says so explicitly', async () => {
    expect(await readDeviceMode(answer(200, { ok: true, data: { mode: 'personal' } }))).toBe('personal');
  });

  it('answers `shared` when the hub says shared', async () => {
    expect(await readDeviceMode(answer(200, { ok: true, data: { mode: 'shared' } }))).toBe('shared');
  });

  it('presents the device id stored by the shell in X-Device-Id', async () => {
    localStorage.setItem('erplora.device_id', 'dev-123');
    const f = answer(200, { ok: true, data: { mode: 'shared' } });
    await readDeviceMode(f);
    expect(f).toHaveBeenCalledWith('/api/device/mode', { headers: { 'X-Device-Id': 'dev-123' } });
  });

  it('sends an empty X-Device-Id when the shell stored none', async () => {
    const f = answer(200, { ok: true, data: { mode: 'shared' } });
    await readDeviceMode(f);
    expect(f).toHaveBeenCalledWith('/api/device/mode', { headers: { 'X-Device-Id': '' } });
  });

  it('fails towards `shared` when the request throws', async () => {
    const f = vi.fn(async () => {
      throw new TypeError('network down');
    }) as unknown as typeof fetch;
    expect(await readDeviceMode(f)).toBe('shared');
  });

  it('fails towards `shared` on a non-2xx answer, even if the body says personal', async () => {
    expect(await readDeviceMode(answer(500, { ok: true, data: { mode: 'personal' } }))).toBe('shared');
  });

  it('fails towards `shared` when the envelope is not ok', async () => {
    expect(await readDeviceMode(answer(200, { ok: false, data: { mode: 'personal' } }))).toBe('shared');
  });

  it('fails towards `shared` for a value outside shared|personal (no case folding)', async () => {
    expect(await readDeviceMode(answer(200, { ok: true, data: { mode: 'Personal' } }))).toBe('shared');
    expect(await readDeviceMode(answer(200, { ok: true, data: { mode: 'kiosk' } }))).toBe('shared');
  });

  it('fails towards `shared` when the body is not JSON', async () => {
    const f = vi.fn(async () => new Response('<html>502</html>', { status: 200 })) as unknown as typeof fetch;
    expect(await readDeviceMode(f)).toBe('shared');
  });
});

describe('readDeviceMode with an SDK that exposes the device mode (hub#2584)', () => {
  function failingFetch(): typeof fetch {
    return vi.fn(async () => {
      throw new TypeError('network down');
    }) as unknown as typeof fetch;
  }

  it('answers `personal` from the SDK without any network call', async () => {
    vi.stubGlobal('erplora', { deviceMode: 'personal' });
    const f = answer(200, { ok: true, data: { mode: 'shared' } });
    expect(await readDeviceMode(f)).toBe('personal');
    expect(f).not.toHaveBeenCalled();
  });

  it('answers `shared` from the SDK without any network call', async () => {
    vi.stubGlobal('erplora', { deviceMode: 'shared' });
    const f = answer(200, { ok: true, data: { mode: 'personal' } });
    expect(await readDeviceMode(f)).toBe('shared');
    expect(f).not.toHaveBeenCalled();
  });

  it('falls back to the HTTP door when the SDK has no deviceMode (older hub)', async () => {
    vi.stubGlobal('erplora', { locale: 'es' });
    const f = answer(200, { ok: true, data: { mode: 'personal' } });
    expect(await readDeviceMode(f)).toBe('personal');
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('falls back to the HTTP door for a value outside shared|personal, and fails towards `shared`', async () => {
    vi.stubGlobal('erplora', { deviceMode: 'Personal' });
    const f = failingFetch();
    expect(await readDeviceMode(f)).toBe('shared');
    expect(f).toHaveBeenCalledTimes(1);
  });
});
