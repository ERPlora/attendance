// The records screen of the time clock (spec §6 «erp-attendance-records»): own days or the whole
// team depending on the session, corrections with a mandatory reason and their trail, CSV export
// of every row of the filter.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const USERS = [
  { id: 'user-ana', name: 'Ana', role: 'employee', is_active: true },
  { id: 'user-luis', name: 'Luis', role: 'employee', is_active: true },
  { id: 'user-boss', name: 'Boss', role: 'manager', is_active: true },
];

const ROWS = [
  {
    id: 'rec-104', user_id: 'user-ana', clock_in_at: '2026-10-06T08:00:00Z', clock_out_at: null,
    status: 'open', source: 'shared', in_distance_m: null, in_within_radius: null,
    out_distance_m: null, out_within_radius: null, note: '', local_date: '2026-10-06',
    break_count: 0, breaks_closed_minutes: 0,
  },
  {
    id: 'rec-101', user_id: 'user-gone', clock_in_at: '2026-10-05T07:02:41Z',
    clock_out_at: '2026-10-05T15:05:03Z', status: 'closed', source: 'personal', in_distance_m: 18,
    in_within_radius: 1, out_distance_m: 612, out_within_radius: 0, note: '',
    local_date: '2026-10-05', break_count: 1, breaks_closed_minutes: 30,
  },
];

const CORRECTIONS = [
  {
    id: 'cor-1', record_id: 'rec-101', old_clock_in_at: '2026-10-05T07:20:00Z',
    old_clock_out_at: null, old_status: 'needs_review', new_clock_in_at: '2026-10-05T07:02:41Z',
    new_clock_out_at: '2026-10-05T15:05:03Z', new_status: 'closed',
    reason: 'Forgot to clock out, confirmed with the shift sheet', created_by: 'user-boss',
    created_at: '2026-10-06T07:40:18Z',
  },
];

type Params = { limit?: number; offset?: number; filters?: Record<string, unknown>; sort?: string; dir?: string };

let pages: { name: string; params: Params }[] = [];
let queries: string[] = [];
let commands: { name: string; payload: Record<string, unknown> }[] = [];
let notices: { type: string; message: string }[] = [];
let pageAnswer: (name: string, params: Params) => Promise<unknown>;
let commandAnswer: (name: string) => Promise<unknown>;

function session(role: string, permissions: string[]): void {
  localStorage.setItem(
    'erplora.session',
    JSON.stringify({ id: 'user-ana', name: 'Ana', role, permissions }),
  );
}

const EMPLOYEE = ['attendance.clock'];
const MANAGER = ['attendance.clock', 'attendance.view_all', 'attendance.correct', 'attendance.manage_settings'];

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-06T10:30:00Z'));
  pages = [];
  queries = [];
  commands = [];
  notices = [];
  pageAnswer = async (name) => {
    if (name === 'attendance.corrections.list') return { rows: CORRECTIONS, total: 1, limit: 200, offset: 0 };
    if (name.startsWith('attendance.breaks.')) return { rows: [], total: 0, limit: 500, offset: 0 };
    return { rows: ROWS, total: ROWS.length, limit: 50, offset: 0 };
  };
  commandAnswer = async () => ({});
  document.body.innerHTML = '';
  // Node's own (file-less) `localStorage` shadows happy-dom's: a Map-backed one stands in for it.
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  });
  (globalThis as Record<string, unknown>).erplora = {
    locale: 'en',
    timezone: 'Europe/Madrid',
    t: (_catalog: unknown, key: string) => key,
    query: async (name: string) => {
      queries.push(name);
      return name === 'hub.users.list' ? USERS : [];
    },
    queryPage: async (name: string, params: Params) => {
      pages.push({ name, params });
      return pageAnswer(name, params);
    },
    command: async (name: string, payload: Record<string, unknown>) => {
      commands.push({ name, payload });
      return commandAnswer(name);
    },
    notify: (n: { type: string; message: string }) => notices.push(n),
    on: () => () => {},
  };
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

type Wc = HTMLElement & { shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };

async function settle(el: Wc): Promise<void> {
  for (let i = 0; i < 6; i++) {
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
  }
  const table = el.shadowRoot.querySelector('ok-data-table') as Wc | null;
  if (table) await table.updateComplete;
}

async function mount(): Promise<Wc> {
  await import('./erp-attendance-records');
  const el = document.createElement('erp-attendance-records') as Wc;
  document.body.appendChild(el);
  await settle(el);
  return el;
}

/** Looks in the screen and inside the table (the row cells live in the table's shadow root). */
function find(el: Wc, testid: string): HTMLElement | null {
  const sel = `[data-testid="${testid}"]`;
  const own = el.shadowRoot.querySelector(sel) as HTMLElement | null;
  if (own) return own;
  const table = el.shadowRoot.querySelector('ok-data-table') as Wc | null;
  return (table?.shadowRoot?.querySelector(sel) as HTMLElement | null) ?? null;
}

function tableText(el: Wc): string {
  const table = el.shadowRoot.querySelector('ok-data-table') as Wc | null;
  return table?.shadowRoot?.textContent ?? '';
}

function type(el: Wc, testid: string, value: string): void {
  const input = find(el, testid) as HTMLElement & { value: string };
  expect(input, `${testid} is painted`).toBeTruthy();
  input.value = value;
  input.dispatchEvent(new CustomEvent('ionInput', { detail: { value }, bubbles: true, composed: true }));
}

function choose(el: Wc, testid: string, value: string): void {
  const select = find(el, testid) as HTMLElement & { value: string };
  expect(select, `${testid} is painted`).toBeTruthy();
  select.value = value;
  select.dispatchEvent(new CustomEvent('ionChange', { detail: { value }, bubbles: true, composed: true }));
}

const lastRecordsPage = () => [...pages].reverse().find((p) => p.name.startsWith('attendance.records.'));

describe('own days (employee without attendance.view_all)', () => {
  it('reads attendance.records.mine for the current business month and paints no person selector', async () => {
    session('employee', EMPLOYEE);
    const el = await mount();
    const names = pages.map((p) => p.name);
    expect(names).toContain('attendance.records.mine');
    expect(names).not.toContain('attendance.records.list');
    expect(lastRecordsPage()?.params.filters?.clock_in_at).toEqual({
      from: '2026-09-30T22:00:00',
      to: '2026-10-31T23:00:00',
    });
    expect(find(el, 'attendance-records-user')).toBeNull();
    expect(find(el, 'attendance-records-month')).toBeTruthy();
  });

  it('offers neither Correct nor History', async () => {
    session('employee', EMPLOYEE);
    const el = await mount();
    expect(find(el, 'attendance-correct-rec-101')).toBeNull();
    expect(find(el, 'attendance-history-rec-101')).toBeNull();
  });

  it('marks an open day as in progress with the minutes worked until now', async () => {
    session('employee', EMPLOYEE);
    const el = await mount();
    const text = tableText(el);
    expect(text).toContain('ui.records.inProgress');
    // 08:00Z → 10:30Z = 2:30 worked so far.
    expect(text).toContain('2:30');
    // The closed day: 482 min − 30 of break.
    expect(text).toContain('7:32');
  });

  it('a different month asks the server again with that month', async () => {
    session('employee', EMPLOYEE);
    const el = await mount();
    choose(el, 'attendance-records-month', '2026-09');
    await settle(el);
    expect(lastRecordsPage()?.params.filters?.clock_in_at).toEqual({
      from: '2026-08-31T22:00:00',
      to: '2026-09-30T22:00:00',
    });
  });
});

describe('the team (manager with attendance.view_all)', () => {
  it('reads attendance.records.list, fills the person selector from hub.users.list and resolves names', async () => {
    session('manager', MANAGER);
    const el = await mount();
    expect(pages.map((p) => p.name)).toContain('attendance.records.list');
    expect(queries).toContain('hub.users.list');
    const select = find(el, 'attendance-records-user');
    expect(select).toBeTruthy();
    const options = [...select!.querySelectorAll('ion-select-option')].map((o) => o.getAttribute('value') ?? (o as HTMLElement & { value: string }).value);
    expect(options).toEqual(expect.arrayContaining(['user-ana', 'user-luis', 'user-boss']));
    const text = tableText(el);
    expect(text).toContain('Ana');
    // A person the hub no longer lists is shown by id rather than hidden.
    expect(text).toContain('user-gone');
  });

  it('filters by the chosen person', async () => {
    session('manager', MANAGER);
    const el = await mount();
    choose(el, 'attendance-records-user', 'user-luis');
    await settle(el);
    expect(lastRecordsPage()?.params.filters?.user_id).toBe('user-luis');
  });

  it('admin and owner see the team without listing permissions', async () => {
    session('owner', []);
    await mount();
    expect(pages.map((p) => p.name)).toContain('attendance.records.list');
  });

  it('shows Correct only with attendance.correct, History with attendance.view_all', async () => {
    session('manager', MANAGER);
    let el = await mount();
    expect(find(el, 'attendance-correct-rec-101')).toBeTruthy();
    expect(find(el, 'attendance-history-rec-101')).toBeTruthy();

    document.body.innerHTML = '';
    session('manager', ['attendance.clock', 'attendance.view_all']);
    el = await mount();
    expect(find(el, 'attendance-correct-rec-101')).toBeNull();
    expect(find(el, 'attendance-history-rec-101')).toBeTruthy();
  });

  it('History lists the corrections of the day: who, before → after and the reason', async () => {
    session('manager', MANAGER);
    const el = await mount();
    find(el, 'attendance-history-rec-101')!.click();
    await settle(el);
    const call = [...pages].reverse().find((p) => p.name === 'attendance.corrections.list');
    expect(call?.params.filters).toEqual({ record_id: 'rec-101' });
    const history = find(el, 'attendance-history-list');
    expect(history?.textContent).toContain('Forgot to clock out, confirmed with the shift sheet');
    expect(history?.textContent).toContain('Boss');
  });
});

describe('correcting a working day', () => {
  async function openCorrection(): Promise<Wc> {
    session('manager', MANAGER);
    const el = await mount();
    find(el, 'attendance-correct-rec-101')!.click();
    await settle(el);
    return el;
  }

  it('prefills the business wall-clock times of the day', async () => {
    const el = await openCorrection();
    expect((find(el, 'attendance-correct-clock-in') as HTMLElement & { value: string }).value).toBe('2026-10-05T09:02');
    expect((find(el, 'attendance-correct-clock-out') as HTMLElement & { value: string }).value).toBe('2026-10-05T17:05');
  });

  it('a clock-out not after the clock-in is refused on screen and never sent', async () => {
    const el = await openCorrection();
    type(el, 'attendance-correct-clock-in', '2026-10-05T17:00');
    type(el, 'attendance-correct-clock-out', '2026-10-05T09:00');
    type(el, 'attendance-correct-reason', 'Typed the wrong way round');
    find(el, 'attendance-correct-save')!.click();
    await settle(el);
    expect(commands).toEqual([]);
    expect(find(el, 'attendance-correct-error')?.textContent).toContain('ui.records.invalidCorrection');
  });

  it('a missing reason is refused on screen and never sent', async () => {
    const el = await openCorrection();
    type(el, 'attendance-correct-reason', ' x ');
    find(el, 'attendance-correct-save')!.click();
    await settle(el);
    expect(commands).toEqual([]);
    expect(find(el, 'attendance-correct-error')?.textContent).toContain('ui.records.reasonRequired');
  });

  it('a valid correction sends attendance.records.correct in UTC with the reason, reloads and confirms', async () => {
    const el = await openCorrection();
    const before = pages.length;
    type(el, 'attendance-correct-clock-in', '2026-10-05T09:00');
    type(el, 'attendance-correct-clock-out', '2026-10-05T17:00');
    type(el, 'attendance-correct-reason', 'Forgot to clock out');
    find(el, 'attendance-correct-save')!.click();
    await settle(el);
    expect(commands).toEqual([
      {
        name: 'attendance.records.correct',
        payload: {
          record_id: 'rec-101',
          clock_in_at: '2026-10-05T07:00:00.000Z',
          clock_out_at: '2026-10-05T15:00:00.000Z',
          reason: 'Forgot to clock out',
        },
      },
    ]);
    expect(pages.slice(before).some((p) => p.name === 'attendance.records.list')).toBe(true);
    expect(notices).toContainEqual({ type: 'success', message: 'ui.records.corrected' });
    expect(find(el, 'attendance-correct-save')).toBeNull();
  });

  it('an empty clock-out reopens the day (clock_out_at null)', async () => {
    const el = await openCorrection();
    type(el, 'attendance-correct-clock-out', '');
    type(el, 'attendance-correct-reason', 'Still working, closed by mistake');
    find(el, 'attendance-correct-save')!.click();
    await settle(el);
    expect(commands[0]?.payload.clock_out_at).toBeNull();
  });

  it('a refusal of the server is shown with the catalogue text of its code', async () => {
    commandAnswer = async () => {
      throw Object.assign(new Error('raw'), { code: 'attendance.record_not_found' });
    };
    const el = await openCorrection();
    type(el, 'attendance-correct-reason', 'Forgot to clock out');
    find(el, 'attendance-correct-save')!.click();
    await settle(el);
    // The `errors` catalogue is keyed by the dotted code itself, so it is read directly, not via t().
    expect(find(el, 'attendance-correct-error')?.textContent).toContain('The working day could not be corrected');
  });
});

describe('CSV export', () => {
  let blobs: Blob[];
  let downloads: string[];

  beforeEach(() => {
    blobs = [];
    downloads = [];
    URL.createObjectURL = vi.fn((b: Blob) => {
      blobs.push(b);
      return 'blob:attendance';
    }) as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn() as unknown as typeof URL.revokeObjectURL;
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      downloads.push(this.download);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function csvText(): Promise<string> {
    expect(blobs.length).toBe(1);
    return (await blobs[0].text()).replace(/^﻿/, '');
  }

  it('exports EVERY page of the current filter, 500 at a time, with names and the file name of the month', async () => {
    session('manager', MANAGER);
    const third = { ...ROWS[1], id: 'rec-090', user_id: 'user-luis', local_date: '2026-10-02' };
    pageAnswer = async (name, params) => {
      if (name.startsWith('attendance.breaks.')) return { rows: [], total: 0, limit: 500, offset: 0 };
      if (params.limit === 500) {
        return params.offset === 0
          ? { rows: ROWS, total: 3, limit: 500, offset: 0 }
          : { rows: [third], total: 3, limit: 500, offset: 2 };
      }
      return { rows: ROWS, total: 3, limit: 50, offset: 0 };
    };
    const el = await mount();
    choose(el, 'attendance-records-user', 'user-luis');
    await settle(el);
    find(el, 'attendance-export-csv')!.click();
    await settle(el);
    const exportCalls = pages.filter((p) => p.name === 'attendance.records.list' && p.params.limit === 500);
    expect(exportCalls.map((p) => p.params.offset)).toEqual([0, 2]);
    expect(exportCalls[0].params.filters).toEqual({
      clock_in_at: { from: '2026-09-30T22:00:00', to: '2026-10-31T23:00:00' },
      user_id: 'user-luis',
    });
    const lines = (await csvText()).trim().split('\r\n');
    expect(lines[0]).toBe('date,user,clock_in,clock_out,break_minutes,worked_minutes,status,within_radius_in,within_radius_out');
    expect(lines).toHaveLength(4);
    expect(lines[1]).toBe('2026-10-06,Ana,2026-10-06 10:00,,0,150,open,,');
    expect(lines[3]).toContain('2026-10-02,Luis,');
    expect(downloads).toEqual(['attendance-2026-10.csv']);
  });

  it('an empty month still downloads the header and says there was nothing to export', async () => {
    session('employee', EMPLOYEE);
    pageAnswer = async () => ({ rows: [], total: 0, limit: 500, offset: 0 });
    const el = await mount();
    find(el, 'attendance-export-csv')!.click();
    await settle(el);
    expect(await csvText()).toBe('date,user,clock_in,clock_out,break_minutes,worked_minutes,status,within_radius_in,within_radius_out\r\n');
    expect(notices).toContainEqual({ type: 'info', message: 'ui.records.exportEmpty' });
  });

  it('in own mode the person column carries the session name', async () => {
    session('employee', EMPLOYEE);
    const el = await mount();
    find(el, 'attendance-export-csv')!.click();
    await settle(el);
    const lines = (await csvText()).trim().split('\r\n');
    expect(lines[1].split(',')[1]).toBe('Ana');
  });
});

describe('load failure', () => {
  it('shows the error with a Retry that loads again', async () => {
    session('employee', EMPLOYEE);
    pageAnswer = async (name) => {
      if (name.startsWith('attendance.records.')) throw new Error('The hub did not return the data.');
      return { rows: [], total: 0, limit: 500, offset: 0 };
    };
    const el = await mount();
    expect(find(el, 'attendance-records-error')?.textContent).toContain('The hub did not return the data.');
    pageAnswer = async () => ({ rows: ROWS, total: 2, limit: 50, offset: 0 });
    find(el, 'attendance-records-retry')!.click();
    await settle(el);
    expect(find(el, 'attendance-records-error')).toBeNull();
    expect(tableText(el)).toContain('7:32');
  });
});
