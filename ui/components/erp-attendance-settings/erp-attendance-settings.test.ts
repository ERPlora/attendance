// The «Settings» tab of the time clock (spec §6, `settings.component`): require location on
// personal devices, the radius, the workplace coordinates (typed, or read with «Use my current
// location») and the review threshold. Saving sends the FULL snapshot to attendance.settings.update.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import enLocale from '../../../locales/en.json';

type Row = Record<string, unknown>;
type Dict = { [k: string]: unknown };

function en(key: string, params?: Record<string, unknown>): string {
  let cur: unknown = enLocale as Dict;
  for (const part of key.split('.')) cur = cur && typeof cur === 'object' ? (cur as Dict)[part] : undefined;
  let out = typeof cur === 'string' ? cur : key;
  for (const [k, v] of Object.entries(params ?? {})) out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  return out;
}

const SAVED: Row = {
  require_location: 1,
  geofence_radius_m: 100,
  workplace_lat: 40.416775,
  workplace_lng: -3.70379,
  auto_close_after_hours: 12,
};

let rows: Row[];
let failLoad: boolean;
let command: ReturnType<typeof vi.fn>;
let query: ReturnType<typeof vi.fn>;
let geoAnswer: { lat: number; lng: number; accuracy: number } | { error: number } | undefined;

function installGeolocation(): void {
  const geo = {
    getCurrentPosition: (
      ok: (p: { coords: { latitude: number; longitude: number; accuracy: number } }) => void,
      fail: (e: { code: number; message: string }) => void,
    ) => {
      if (!geoAnswer) return fail({ code: 2, message: 'no answer configured' });
      if ('error' in geoAnswer) fail({ code: geoAnswer.error, message: 'geo error' });
      else ok({ coords: { latitude: geoAnswer.lat, longitude: geoAnswer.lng, accuracy: geoAnswer.accuracy } });
    },
  };
  Object.defineProperty(globalThis.navigator, 'geolocation', { value: geo, configurable: true });
}

beforeEach(() => {
  rows = [];
  failLoad = false;
  geoAnswer = undefined;
  installGeolocation();
  query = vi.fn(async (name: string) => {
    if (failLoad) throw Object.assign(new Error('The hub did not answer.'), { code: 'server_unavailable' });
    if (name === 'attendance.settings.get') return rows;
    throw new Error(`unexpected query ${name}`);
  });
  command = vi.fn(async () => ({}));
  (globalThis as Record<string, unknown>).erplora = {
    query,
    command,
    on: () => () => {},
    locale: 'en',
    timezone: 'Europe/Madrid',
    t: (_catalog: unknown, key: string, params?: Record<string, unknown>) => en(key, params),
  };
});

afterEach(() => {
  document.body.innerHTML = '';
  Object.defineProperty(globalThis.navigator, 'geolocation', { value: undefined, configurable: true });
});

type Screen = HTMLElement & { shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };

async function settle(el: Screen): Promise<void> {
  for (let i = 0; i < 8; i++) {
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
  }
}

async function mount(): Promise<Screen> {
  await import('./erp-attendance-settings');
  const el = document.createElement('erp-attendance-settings') as Screen;
  document.body.appendChild(el);
  await settle(el);
  return el;
}

const byId = (el: Screen, id: string): (HTMLElement & Record<string, unknown>) | null =>
  el.shadowRoot.querySelector(`[data-testid="${id}"]`);

async function press(el: Screen, id: string): Promise<void> {
  const button = byId(el, id);
  expect(button, `${id} is not on screen`).not.toBeNull();
  button!.click();
  await settle(el);
}

/** What Ionic dispatches when a person types into an ion-input. */
async function type(el: Screen, id: string, value: string): Promise<void> {
  const input = byId(el, id)!;
  input.value = value;
  input.dispatchEvent(new CustomEvent('ionInput', { detail: { value } }));
  await settle(el);
}

async function choose(el: Screen, id: string, detail: Record<string, unknown>): Promise<void> {
  const control = byId(el, id)!;
  if ('checked' in detail) control.checked = detail.checked;
  if ('value' in detail) control.value = detail.value;
  control.dispatchEvent(new CustomEvent('ionChange', { detail }));
  await settle(el);
}

const message = (el: Screen): string => byId(el, 'attendance-settings-message')?.textContent?.trim() ?? '';

describe('erp-attendance-settings — load', () => {
  it('(a) with no settings row it shows the schema defaults', async () => {
    const el = await mount();
    expect(byId(el, 'attendance-settings-require-location')?.checked).toBe(false);
    expect(String(byId(el, 'attendance-settings-radius')?.value)).toBe('100');
    expect(byId(el, 'attendance-settings-lat')?.value).toBe('');
    expect(byId(el, 'attendance-settings-lng')?.value).toBe('');
    expect(String(byId(el, 'attendance-settings-auto-close')?.value)).toBe('12');
  });

  it('shows the saved row', async () => {
    rows = [SAVED];
    const el = await mount();
    expect(byId(el, 'attendance-settings-require-location')?.checked).toBe(true);
    expect(byId(el, 'attendance-settings-lat')?.value).toBe('40.416775');
    expect(byId(el, 'attendance-settings-lng')?.value).toBe('-3.70379');
  });

  it('offers the five radii of the schema', async () => {
    const el = await mount();
    const options = [...byId(el, 'attendance-settings-radius')!.querySelectorAll('ion-select-option')].map((o) =>
      o.getAttribute('value'),
    );
    expect(options).toEqual(['50', '100', '250', '500', '1000']);
  });

  it('a failed load shows the error and Retry loads again', async () => {
    failLoad = true;
    const el = await mount();
    expect(byId(el, 'attendance-settings-error')).not.toBeNull();
    expect(byId(el, 'attendance-settings-save')).toBeNull();
    failLoad = false;
    await press(el, 'attendance-settings-retry');
    expect(byId(el, 'attendance-settings-error')).toBeNull();
    expect(byId(el, 'attendance-settings-save')).not.toBeNull();
  });

  it('shows a spinner while loading', async () => {
    let release: () => void = () => {};
    query.mockImplementation(() => new Promise((r) => (release = () => r([]))));
    await import('./erp-attendance-settings');
    const el = document.createElement('erp-attendance-settings') as Screen;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(byId(el, 'attendance-settings-loading')).not.toBeNull();
    release();
  });
});

describe('erp-attendance-settings — save', () => {
  it('(b) Save sends the full snapshot, with what the person changed', async () => {
    rows = [SAVED];
    const el = await mount();
    await choose(el, 'attendance-settings-radius', { value: '250' });
    await type(el, 'attendance-settings-auto-close', '10');
    await press(el, 'attendance-settings-save');
    expect(command).toHaveBeenCalledWith('attendance.settings.update', {
      require_location: 1,
      geofence_radius_m: 250,
      workplace_lat: 40.416775,
      workplace_lng: -3.70379,
      auto_close_after_hours: 10,
    });
    expect(message(el)).toBe(en('ui.settings.saved'));
  });

  it('saving the defaults of a fresh hub sends null coordinates, never 0', async () => {
    const el = await mount();
    await press(el, 'attendance-settings-save');
    expect(command).toHaveBeenCalledWith('attendance.settings.update', {
      require_location: 0,
      geofence_radius_m: 100,
      workplace_lat: null,
      workplace_lng: null,
      auto_close_after_hours: 12,
    });
  });

  it('turning the toggle on is sent as require_location = 1', async () => {
    const el = await mount();
    await choose(el, 'attendance-settings-require-location', { checked: true });
    await press(el, 'attendance-settings-save');
    expect(command.mock.calls[0][1]).toMatchObject({ require_location: 1 });
  });

  it('a server refusal is told with the catalogue sentence', async () => {
    const el = await mount();
    command.mockRejectedValueOnce(
      Object.assign(new Error('attendance.settings_not_saved'), { code: 'attendance.settings_not_saved' }),
    );
    await press(el, 'attendance-settings-save');
    expect(message(el)).toBe((enLocale as { errors: Record<string, string> }).errors['attendance.settings_not_saved']);
  });

  it('a latitude outside -90..90 is refused before sending', async () => {
    const el = await mount();
    await type(el, 'attendance-settings-lat', '95');
    await type(el, 'attendance-settings-lng', '-3.7');
    await press(el, 'attendance-settings-save');
    expect(command).not.toHaveBeenCalled();
    expect(message(el)).toBe(en('ui.settings.invalidLatitude'));
  });

  it('a longitude outside -180..180 is refused before sending', async () => {
    const el = await mount();
    await type(el, 'attendance-settings-lat', '40');
    await type(el, 'attendance-settings-lng', '-181');
    await press(el, 'attendance-settings-save');
    expect(command).not.toHaveBeenCalled();
    expect(message(el)).toBe(en('ui.settings.invalidLongitude'));
  });

  it('only one coordinate filled in is refused before sending', async () => {
    const el = await mount();
    await type(el, 'attendance-settings-lat', '40.4');
    await press(el, 'attendance-settings-save');
    expect(command).not.toHaveBeenCalled();
    expect(message(el)).toBe(en('ui.settings.coordinatesIncomplete'));
  });

  it('review hours outside 1..24 or not whole are refused before sending', async () => {
    const el = await mount();
    await type(el, 'attendance-settings-auto-close', '30');
    await press(el, 'attendance-settings-save');
    await type(el, 'attendance-settings-auto-close', '2.5');
    await press(el, 'attendance-settings-save');
    expect(command).not.toHaveBeenCalled();
    expect(message(el)).toBe(en('ui.settings.invalidAutoClose'));
  });
});

describe('erp-attendance-settings — use my current location', () => {
  it('(c) fills latitude and longitude and shows the accuracy', async () => {
    geoAnswer = { lat: 40.41677512345, lng: -3.70379098765, accuracy: 12.4 };
    const el = await mount();
    await press(el, 'attendance-use-my-location');
    expect(byId(el, 'attendance-settings-lat')?.value).toBe('40.416775');
    expect(byId(el, 'attendance-settings-lng')?.value).toBe('-3.703791');
    expect(byId(el, 'attendance-settings-accuracy')?.textContent).toContain(en('ui.settings.accuracy', { accuracy: 12 }));
    await press(el, 'attendance-settings-save');
    expect(command.mock.calls[0][1]).toMatchObject({ workplace_lat: 40.416775, workplace_lng: -3.703791 });
  });

  it('a denied permission is told and the coordinates stay as they were', async () => {
    rows = [SAVED];
    geoAnswer = { error: 1 };
    const el = await mount();
    await press(el, 'attendance-use-my-location');
    expect(message(el)).toBe(en('ui.settings.locationDenied'));
    expect(byId(el, 'attendance-settings-lat')?.value).toBe('40.416775');
  });
});

describe('erp-attendance-settings — the missing-workplace warning', () => {
  it('(d) warns when location is required and there are no coordinates', async () => {
    rows = [{ ...SAVED, workplace_lat: null, workplace_lng: null }];
    const el = await mount();
    expect(byId(el, 'attendance-settings-location-warning')?.textContent).toContain(en('ui.settings.workplaceMissing'));
  });

  it('does not warn when the coordinates are set', async () => {
    rows = [SAVED];
    const el = await mount();
    expect(byId(el, 'attendance-settings-location-warning')).toBeNull();
  });

  it('does not warn while location is not required', async () => {
    const el = await mount();
    expect(byId(el, 'attendance-settings-location-warning')).toBeNull();
    await choose(el, 'attendance-settings-require-location', { checked: true });
    expect(byId(el, 'attendance-settings-location-warning')).not.toBeNull();
  });
});

describe('erp-attendance-settings — layout', () => {
  // The tab is hosted next to the shell's side menu / split pane: its breakpoints follow the width
  // the component actually gets, not the viewport's.
  it('switches its layout on its own width (container query), never on the viewport', async () => {
    await import('./erp-attendance-settings');
    const ctor = customElements.get('erp-attendance-settings') as unknown as { styles: { cssText: string } };
    const cssText = ctor.styles.cssText;
    expect(cssText).toMatch(/:host\s*{[^}]*container-type:\s*inline-size/);
    expect(cssText).toMatch(/@container\s*\(/);
    expect(cssText).not.toMatch(/@media/);
  });
});
