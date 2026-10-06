// The «Clock in» screen (spec §6): one button for the session user, breaks, and the workplace
// radius checked BEFORE the command when the hub requires location on a personal device. Clocking
// out never blocks (decision closed after the QA flow review, 2026-10-06).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import enLocale from '../../../locales/en.json';
import { haversineMeters } from '../../lib/geo';

type Row = Record<string, unknown>;
type Dict = { [k: string]: unknown };

/** The real English text of a key, with `{param}` spliced like the SDK's `t()`. */
function en(key: string, params?: Record<string, unknown>): string {
  let cur: unknown = enLocale as Dict;
  for (const part of key.split('.')) cur = cur && typeof cur === 'object' ? (cur as Dict)[part] : undefined;
  let out = typeof cur === 'string' ? cur : key;
  for (const [k, v] of Object.entries(params ?? {})) out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  return out;
}

const WORKPLACE = { lat: 40.416775, lng: -3.70379 };

const SETTINGS_LOCATION: Row = {
  require_location: 1,
  geofence_radius_m: 100,
  workplace_lat: WORKPLACE.lat,
  workplace_lng: WORKPLACE.lng,
  auto_close_after_hours: 12,
};

const OPEN: Row = {
  id: 'rec-1',
  clock_in_at: '2026-10-06T07:00:00Z',
  source: 'shared',
  in_distance_m: null,
  in_within_radius: null,
  open_break_id: null,
  open_break_started_at: null,
};

interface World {
  settings: Row[];
  open: Row[];
  mine: Row[];
  breaks: Row[];
  mode: 'shared' | 'personal';
  failLoad: boolean;
}

let world: World;
let command: ReturnType<typeof vi.fn>;
let query: ReturnType<typeof vi.fn>;

function memoryStorage(seed: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(seed));
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

type GeoAnswer = { lat: number; lng: number; accuracy: number } | { error: number };
let geoCalls = 0;

function withGeolocation(answer: GeoAnswer | undefined): void {
  geoCalls = 0;
  const geo = answer
    ? {
        getCurrentPosition: (
          ok: (p: { coords: { latitude: number; longitude: number; accuracy: number } }) => void,
          fail: (e: { code: number; message: string }) => void,
        ) => {
          geoCalls++;
          if ('error' in answer) fail({ code: answer.error, message: 'geo error' });
          else ok({ coords: { latitude: answer.lat, longitude: answer.lng, accuracy: answer.accuracy } });
        },
      }
    : undefined;
  Object.defineProperty(globalThis.navigator, 'geolocation', { value: geo, configurable: true });
}

function installSdk(): void {
  query = vi.fn(async (name: string) => {
    if (world.failLoad) throw Object.assign(new Error('The hub did not answer.'), { code: 'server_unavailable' });
    if (name === 'attendance.settings.get') return world.settings;
    if (name === 'attendance.records.mine_open') return world.open;
    throw new Error(`unexpected query ${name}`);
  });
  command = vi.fn(async () => ({}));
  (globalThis as Record<string, unknown>).erplora = {
    query,
    queryAll: vi.fn(async (name: string) => {
      if (world.failLoad) throw new Error('The hub did not answer.');
      if (name === 'attendance.records.mine') return world.mine;
      if (name === 'attendance.breaks.mine') return world.breaks;
      throw new Error(`unexpected list ${name}`);
    }),
    queryPage: vi.fn(async (name: string, params: { limit?: number }) => {
      if (world.failLoad) throw new Error('The hub did not answer.');
      if (name !== 'attendance.records.mine') throw new Error(`unexpected page ${name}`);
      const rows = world.mine.slice(0, params?.limit ?? 50);
      return { rows, total: world.mine.length, limit: params?.limit ?? 50, offset: 0 };
    }),
    command,
    on: () => () => {},
    locale: 'en',
    timezone: 'Europe/Madrid',
    t: (_catalog: unknown, key: string, params?: Record<string, unknown>) => en(key, params),
  };
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({ ok: true, data: { mode: world.mode } }), { status: 200 })),
  );
}

beforeEach(() => {
  world = { settings: [], open: [], mine: [], breaks: [], mode: 'shared', failLoad: false };
  vi.stubGlobal(
    'localStorage',
    memoryStorage({
      'erplora.session': JSON.stringify({ id: 'user-ana', name: 'Ana', role: 'employee', permissions: [] }),
      'erplora.device_id': 'dev-1',
    }),
  );
  withGeolocation(undefined);
  installSdk();
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

type Screen = HTMLElement & { shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };

async function settle(el: Screen): Promise<void> {
  for (let i = 0; i < 8; i++) {
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
  }
}

async function mount(): Promise<Screen> {
  await import('./erp-attendance-clock');
  const el = document.createElement('erp-attendance-clock') as Screen;
  document.body.appendChild(el);
  await settle(el);
  return el;
}

const byId = (el: Screen, id: string): HTMLElement | null =>
  el.shadowRoot.querySelector(`[data-testid="${id}"]`);

async function press(el: Screen, id: string): Promise<void> {
  const button = byId(el, id);
  expect(button, `${id} is not on screen`).not.toBeNull();
  button!.click();
  await settle(el);
}

const message = (el: Screen): string => byId(el, 'attendance-clock-message')?.textContent?.trim() ?? '';

describe('erp-attendance-clock — buttons follow the state of the working day', () => {
  it('(a) with no open working day it offers Clock in, and nothing else', async () => {
    const el = await mount();
    expect(byId(el, 'attendance-clock-in')).not.toBeNull();
    expect(byId(el, 'attendance-clock-out')).toBeNull();
    expect(byId(el, 'attendance-break-start')).toBeNull();
    expect(byId(el, 'attendance-break-end')).toBeNull();
  });

  it('(b) with an open working day it offers Clock out and Start break', async () => {
    world.open = [OPEN];
    const el = await mount();
    expect(byId(el, 'attendance-clock-in')).toBeNull();
    expect(byId(el, 'attendance-clock-out')).not.toBeNull();
    expect(byId(el, 'attendance-break-start')).not.toBeNull();
    expect(byId(el, 'attendance-break-end')).toBeNull();
    expect(byId(el, 'attendance-clock-timer')).not.toBeNull();
  });

  it('(c) with a running break it offers End break instead of Start break', async () => {
    world.open = [{ ...OPEN, open_break_id: 'brk-1', open_break_started_at: '2026-10-06T10:00:00Z' }];
    const el = await mount();
    expect(byId(el, 'attendance-break-end')).not.toBeNull();
    expect(byId(el, 'attendance-break-start')).toBeNull();
    expect(byId(el, 'attendance-clock-out')).not.toBeNull();
  });

  it('greets the session user by name', async () => {
    const el = await mount();
    expect(el.shadowRoot.textContent).toContain(en('ui.clock.greeting', { name: 'Ana' }));
  });
});

describe('erp-attendance-clock — the workplace radius on a personal device', () => {
  it('(d) location denied: no command, and the denied message', async () => {
    world.settings = [SETTINGS_LOCATION];
    world.mode = 'personal';
    withGeolocation({ error: 1 });
    const el = await mount();
    await press(el, 'attendance-clock-in');
    expect(geoCalls).toBe(1);
    expect(command).not.toHaveBeenCalled();
    expect(message(el)).toBe(en('ui.clock.locationDenied'));
  });

  it('(e) 2 km away with a 100 m radius: no command, and the outside-radius message', async () => {
    world.settings = [SETTINGS_LOCATION];
    world.mode = 'personal';
    const far = { lat: WORKPLACE.lat + 0.018, lng: WORKPLACE.lng };
    withGeolocation({ ...far, accuracy: 10 });
    const el = await mount();
    await press(el, 'attendance-clock-in');
    expect(command).not.toHaveBeenCalled();
    const distance = Math.round(haversineMeters(WORKPLACE, far));
    expect(distance).toBeGreaterThan(1900);
    expect(message(el)).toBe(en('ui.clock.outsideRadius', { distance, radius: 100 }));
  });

  it('(f) shared device with location required: clocks in as shared without asking a position', async () => {
    world.settings = [SETTINGS_LOCATION];
    world.mode = 'shared';
    withGeolocation({ ...WORKPLACE, accuracy: 5 });
    const el = await mount();
    await press(el, 'attendance-clock-in');
    expect(geoCalls).toBe(0);
    expect(command).toHaveBeenCalledWith('attendance.clock_in', {
      source: 'shared',
      lat: null,
      lng: null,
      accuracy_m: null,
      distance_m: null,
      within_radius: null,
    });
  });

  it('inside the radius on a personal device: sends the position, the distance and within_radius = 1', async () => {
    world.settings = [SETTINGS_LOCATION];
    world.mode = 'personal';
    const near = { lat: WORKPLACE.lat + 0.0003, lng: WORKPLACE.lng };
    withGeolocation({ ...near, accuracy: 8 });
    const el = await mount();
    await press(el, 'attendance-clock-in');
    const distance = Math.round(haversineMeters(WORKPLACE, near));
    expect(command).toHaveBeenCalledWith('attendance.clock_in', {
      source: 'personal',
      lat: near.lat,
      lng: near.lng,
      accuracy_m: 8,
      distance_m: distance,
      within_radius: 1,
    });
  });

  it('workplace not set: a personal device cannot clock in and is told why', async () => {
    world.settings = [{ ...SETTINGS_LOCATION, workplace_lat: null, workplace_lng: null }];
    world.mode = 'personal';
    withGeolocation({ ...WORKPLACE, accuracy: 5 });
    const el = await mount();
    await press(el, 'attendance-clock-in');
    expect(command).not.toHaveBeenCalled();
    expect(message(el)).toBe(en('ui.clock.workplaceNotSet'));
  });

  it('a freshly installed hub (no settings row) clocks in with the defaults: no location asked', async () => {
    world.settings = [];
    world.mode = 'personal';
    withGeolocation({ ...WORKPLACE, accuracy: 5 });
    const el = await mount();
    await press(el, 'attendance-clock-in');
    expect(geoCalls).toBe(0);
    expect(command).toHaveBeenCalledWith('attendance.clock_in', {
      source: 'personal',
      lat: null,
      lng: null,
      accuracy_m: null,
      distance_m: null,
      within_radius: null,
    });
  });
});

describe('erp-attendance-clock — clocking out never blocks', () => {
  it('location denied on clock-out still clocks out, with no coordinates', async () => {
    world.settings = [SETTINGS_LOCATION];
    world.mode = 'personal';
    world.open = [OPEN];
    withGeolocation({ error: 1 });
    const el = await mount();
    await press(el, 'attendance-clock-out');
    expect(command).toHaveBeenCalledWith('attendance.clock_out', {
      lat: null,
      lng: null,
      accuracy_m: null,
      distance_m: null,
      within_radius: null,
    });
  });

  it('outside the radius on clock-out still clocks out, recording within_radius = 0', async () => {
    world.settings = [SETTINGS_LOCATION];
    world.mode = 'personal';
    world.open = [OPEN];
    const far = { lat: WORKPLACE.lat + 0.018, lng: WORKPLACE.lng };
    withGeolocation({ ...far, accuracy: 10 });
    const el = await mount();
    await press(el, 'attendance-clock-out');
    expect(command).toHaveBeenCalledWith('attendance.clock_out', {
      lat: far.lat,
      lng: far.lng,
      accuracy_m: 10,
      distance_m: Math.round(haversineMeters(WORKPLACE, far)),
      within_radius: 0,
    });
  });

  it('a shared device clocks out without asking a position', async () => {
    world.settings = [SETTINGS_LOCATION];
    world.open = [OPEN];
    withGeolocation({ ...WORKPLACE, accuracy: 5 });
    const el = await mount();
    await press(el, 'attendance-clock-out');
    expect(geoCalls).toBe(0);
    expect(command).toHaveBeenCalledWith('attendance.clock_out', {
      lat: null,
      lng: null,
      accuracy_m: null,
      distance_m: null,
      within_radius: null,
    });
  });
});

describe('erp-attendance-clock — commands and server refusals', () => {
  it('(g) a clock_in_rejected refusal shows the catalogue sentence and reloads the open day', async () => {
    const el = await mount();
    const before = query.mock.calls.filter(([n]) => n === 'attendance.records.mine_open').length;
    command.mockRejectedValueOnce(
      Object.assign(new Error('attendance.clock_in_rejected'), { code: 'attendance.clock_in_rejected' }),
    );
    world.open = [OPEN];
    await press(el, 'attendance-clock-in');
    expect(message(el)).toBe((enLocale as { errors: Record<string, string> }).errors['attendance.clock_in_rejected']);
    const after = query.mock.calls.filter(([n]) => n === 'attendance.records.mine_open').length;
    expect(after).toBeGreaterThan(before);
    // The reload found the day that was already open: the screen now offers Clock out.
    expect(byId(el, 'attendance-clock-out')).not.toBeNull();
  });

  it('Start break sends the command and the screen then offers End break', async () => {
    world.open = [OPEN];
    const el = await mount();
    command.mockImplementationOnce(async () => {
      world.open = [{ ...OPEN, open_break_id: 'brk-9', open_break_started_at: '2026-10-06T10:00:00Z' }];
      return {};
    });
    await press(el, 'attendance-break-start');
    expect(command).toHaveBeenCalledWith('attendance.break_start', {});
    expect(byId(el, 'attendance-break-end')).not.toBeNull();
  });

  it('End break sends the command', async () => {
    world.open = [{ ...OPEN, open_break_id: 'brk-1', open_break_started_at: '2026-10-06T10:00:00Z' }];
    const el = await mount();
    await press(el, 'attendance-break-end');
    expect(command).toHaveBeenCalledWith('attendance.break_end', {});
  });

  it('a refusal the module does not own keeps the sentence that arrived', async () => {
    const el = await mount();
    command.mockRejectedValueOnce(Object.assign(new Error('You do not have permission.'), { code: 'permission_denied' }));
    await press(el, 'attendance-clock-in');
    expect(message(el)).toBe('You do not have permission.');
  });
});

describe('erp-attendance-clock — loading, error and empty states', () => {
  it('a failed load shows the error and a Retry that loads again', async () => {
    world.failLoad = true;
    const el = await mount();
    expect(byId(el, 'attendance-clock-error')).not.toBeNull();
    expect(byId(el, 'attendance-clock-in')).toBeNull();
    world.failLoad = false;
    await press(el, 'attendance-clock-retry');
    expect(byId(el, 'attendance-clock-error')).toBeNull();
    expect(byId(el, 'attendance-clock-in')).not.toBeNull();
  });

  it('shows a spinner while the first load is in flight', async () => {
    let release: () => void = () => {};
    query.mockImplementation(() => new Promise((r) => (release = () => r([]))));
    await import('./erp-attendance-clock');
    const el = document.createElement('erp-attendance-clock') as Screen;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(byId(el, 'attendance-clock-loading')).not.toBeNull();
    release();
  });

  it('with no history it says there are no records yet', async () => {
    const el = await mount();
    expect(byId(el, 'attendance-clock-empty')?.textContent).toContain(en('ui.clock.empty'));
  });
});

describe('erp-attendance-clock — today and recent days', () => {
  it('sums today: worked time minus breaks, and the breaks themselves', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-06T10:00:00Z'));
    world.open = [{ ...OPEN, id: 'rec-2', clock_in_at: '2026-10-06T08:00:00Z' }];
    world.mine = [
      // Today in Madrid: closed 06:00–07:00 UTC (60 min) and the open one since 08:00 (120 min).
      { id: 'rec-2', user_id: 'user-ana', clock_in_at: '2026-10-06T08:00:00Z', clock_out_at: null, status: 'open', local_date: '2026-10-06', break_count: 1, breaks_closed_minutes: 0 },
      { id: 'rec-1', user_id: 'user-ana', clock_in_at: '2026-10-06T06:00:00Z', clock_out_at: '2026-10-06T07:00:00Z', status: 'closed', local_date: '2026-10-06', break_count: 1, breaks_closed_minutes: 15 },
      // Yesterday: must not count.
      { id: 'rec-0', user_id: 'user-ana', clock_in_at: '2026-10-05T06:00:00Z', clock_out_at: '2026-10-05T14:00:00Z', status: 'closed', local_date: '2026-10-05', break_count: 0, breaks_closed_minutes: 0 },
    ];
    world.breaks = [
      { id: 'b1', record_id: 'rec-1', started_at: '2026-10-06T06:30:00Z', ended_at: '2026-10-06T06:45:00Z' },
      // Running break of the open day: 09:40 → now (10:00) = 20 min.
      { id: 'b2', record_id: 'rec-2', started_at: '2026-10-06T09:40:00Z', ended_at: null },
      { id: 'b0', record_id: 'rec-0', started_at: '2026-10-05T10:00:00Z', ended_at: '2026-10-05T11:00:00Z' },
    ];
    const el = await mount();
    // Worked: (60 − 15) + (120 − 20) = 145 min = 2:25. Breaks: 15 + 20 = 35 min = 0:35.
    expect(byId(el, 'attendance-clock-today-worked')?.textContent).toContain('2:25');
    expect(byId(el, 'attendance-clock-today-breaks')?.textContent).toContain('0:35');
  });

  it('lists the recent days with a warning badge for the ones that need review', async () => {
    world.mine = [
      { id: 'rec-7', user_id: 'user-ana', clock_in_at: '2026-10-02T06:55:30Z', clock_out_at: null, status: 'needs_review', local_date: '2026-10-02', break_count: 0, breaks_closed_minutes: 0 },
      { id: 'rec-6', user_id: 'user-ana', clock_in_at: '2026-10-01T07:00:00Z', clock_out_at: '2026-10-01T15:30:00Z', status: 'closed', local_date: '2026-10-01', break_count: 1, breaks_closed_minutes: 30 },
    ];
    const el = await mount();
    const list = byId(el, 'attendance-clock-recent');
    expect(list).not.toBeNull();
    // Tone by class: `color=` never paints inside the component's shadow root (module-toolkit#273).
    const review = list!.querySelector('ion-badge.tone-warning');
    expect(review?.textContent).toContain(en('ui.common.statusNeedsReview'));
    // 07:00–15:30 is 510 min minus a 30-minute break: 8:00 worked.
    expect(list!.textContent).toContain('8:00');
    expect(list!.textContent).toContain('09:00');
    expect(list!.textContent).toContain('17:30');
  });

  it('an open day says «in progress» once (the badge), and shows no clock-out yet', async () => {
    world.mine = [
      { id: 'rec-8', user_id: 'user-ana', clock_in_at: '2026-10-06T06:58:12Z', clock_out_at: null, status: 'open', local_date: '2026-10-06', break_count: 0, breaks_closed_minutes: 0 },
    ];
    const el = await mount();
    const text = byId(el, 'attendance-clock-recent')!.textContent ?? '';
    expect(text.split(en('ui.common.statusOpen')).length - 1).toBe(1);
    expect(text).not.toContain(en('ui.clock.noClockOut'));
  });

  it('asks only for the last 10 days for the recent list', async () => {
    await mount();
    const sdk = (globalThis as unknown as { erplora: { queryPage: ReturnType<typeof vi.fn> } }).erplora;
    expect(sdk.queryPage).toHaveBeenCalledWith(
      'attendance.records.mine',
      expect.objectContaining({ limit: 10, sort: 'clock_in_at', dir: 'desc' }),
    );
  });
});
