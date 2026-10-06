import { LitElement, html, css, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { define } from '@erplora/outfitkit/define';
// i18n catalogue of the module (ADR-0055/0199): esbuild inlines these JSON into the bundle. English
// is the source, Spanish its translation; no visible string is hardcoded.
import esLocale from '../../../locales/es.json';
import enLocale from '../../../locales/en.json';
import { GeoError, getPosition, haversineMeters, withinRadius, type Position } from '../../lib/geo';
import {
  formatHm,
  formatHms,
  formatLocalDate,
  formatTime,
  localDateOf,
  minutesBetween,
} from '../../lib/duration';
import { readDeviceMode, type DeviceMode } from '../../lib/device-mode';
import { errorMessage } from '../../lib/errors';
import { DEFAULT_SETTINGS, settingsFrom, type Settings } from '../../lib/settings';

const CATALOG: Record<string, unknown> = { es: esLocale, en: enLocale };

// «Clock in» screen of the `attendance` module (spec §6). One button for the session user, breaks,
// a running clock, today's totals and the last days. When the hub requires location and THIS
// device is `personal`, the workplace radius is checked here BEFORE the command (the server is the
// safety net with a single generic refusal); clocking OUT never blocks.

interface ErploraClientLike {
  query<T = unknown>(name: string, params?: Record<string, unknown>): Promise<T>;
  queryAll<T = unknown>(name: string, params?: Record<string, unknown>): Promise<T[]>;
  queryPage<T = unknown>(name: string, params?: Record<string, unknown>): Promise<{ rows: T[]; total: number } | T[]>;
  command<T = unknown>(name: string, payload?: Record<string, unknown>): Promise<T>;
  t(catalog: Record<string, unknown>, key: string, params?: Record<string, unknown>): string;
  readonly locale?: string;
  readonly timezone?: string;
}

function erplora(): ErploraClientLike {
  const c = (globalThis as { erplora?: ErploraClientLike }).erplora;
  if (!c) throw new Error('erplora SDK not initialised by the shell');
  return c;
}

/** `attendance.records.mine_open` (0 or 1 row). */
interface OpenDay {
  id: string;
  clock_in_at: string;
  open_break_id: string | null;
  open_break_started_at: string | null;
}

/** `attendance.records.mine` row (the columns this screen reads). */
interface Day {
  id: string;
  clock_in_at: string;
  clock_out_at: string | null;
  status: string;
  local_date: string;
  breaks_closed_minutes: number | null;
}

/** `attendance.breaks.mine` row. */
interface Break {
  id: string;
  record_id: string;
  started_at: string;
  ended_at: string | null;
}

/** What `clock_in` / `clock_out` carry about the position. All null when it was not measured. */
interface Located {
  lat: number | null;
  lng: number | null;
  accuracy_m: number | null;
  distance_m: number | null;
  within_radius: 0 | 1 | null;
}

const NOT_LOCATED: Located = { lat: null, lng: null, accuracy_m: null, distance_m: null, within_radius: null };

/** How far back to ask for «today»: a business day in any zone (UTC−12…+14) started within 48 h. */
const TODAY_WINDOW_MS = 48 * 3600 * 1000;
const RECENT_DAYS = 10;

type Notice = { kind: 'error' | 'success' | 'info'; text: string } | null;
type Busy = '' | 'in' | 'out' | 'break';

const GEO_KEYS: Record<string, string> = {
  denied: 'ui.clock.locationDenied',
  unavailable: 'ui.common.locationUnavailable',
  timeout: 'ui.common.locationTimeout',
  unsupported: 'ui.common.locationUnsupported',
};

const STATUS: Record<string, { key: string; color: string }> = {
  open: { key: 'ui.common.statusOpen', color: 'success' },
  closed: { key: 'ui.common.statusClosed', color: 'medium' },
  needs_review: { key: 'ui.common.statusNeedsReview', color: 'warning' },
};

function sessionName(): string {
  try {
    const raw = globalThis.localStorage?.getItem('erplora.session');
    const name = raw ? (JSON.parse(raw) as { name?: unknown })?.name : '';
    return typeof name === 'string' ? name.trim() : '';
  } catch {
    return '';
  }
}

const rowsOf = <T>(page: { rows: T[] } | T[] | null | undefined): T[] =>
  Array.isArray(page) ? page : Array.isArray(page?.rows) ? page.rows : [];

export class ErpAttendanceClock extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      color: var(--ion-text-color, #1c1b18);
      box-sizing: border-box;
    }
    .layout {
      display: grid;
      gap: 16px;
      grid-template-columns: minmax(0, 1fr);
      max-width: 1100px;
      margin: 0 auto;
    }
    @media (min-width: 834px) {
      .layout {
        grid-template-columns: minmax(320px, 5fr) minmax(0, 6fr);
        align-items: start;
      }
    }
    .card {
      background: var(--ion-card-background, var(--ion-background-color, #fff));
      border: 1px solid var(--ion-border-color, rgba(0, 0, 0, 0.12));
      border-radius: 16px;
      padding: 20px;
    }
    .clock {
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }
    header h2 {
      margin: 0;
      font-size: 1.25rem;
    }
    header p,
    .muted {
      margin: 4px 0 0;
      color: var(--ion-color-medium, #6b6b6b);
      font-size: 0.95rem;
    }
    .status {
      margin: 8px 0 0;
      font-weight: 600;
      font-size: 1.05rem;
    }
    .timer {
      font-size: clamp(2.25rem, 9vw, 3.25rem);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      line-height: 1.1;
    }
    .actions {
      display: grid;
      gap: 10px;
    }
    .actions ion-button {
      margin: 0;
      min-height: 56px;
      font-size: 1.05rem;
    }
    .actions ion-button.primary {
      min-height: 72px;
      font-size: 1.2rem;
    }
    .note {
      display: flex;
      gap: 6px;
      align-items: center;
      justify-content: center;
      margin: 0;
      font-size: 0.9rem;
      color: var(--ion-color-medium, #6b6b6b);
    }
    .msg {
      margin: 0;
      padding: 10px 12px;
      border-radius: 10px;
      font-weight: 600;
      text-align: left;
    }
    .msg.error {
      color: var(--ion-color-danger, #c5000f);
      background: color-mix(in srgb, var(--ion-color-danger, #c5000f) 10%, transparent);
    }
    .msg.success {
      color: var(--ion-color-success-shade, #1f7a3a);
      background: color-mix(in srgb, var(--ion-color-success, #2dd36f) 12%, transparent);
    }
    .msg.info {
      color: var(--ion-color-medium-shade, #555);
      background: color-mix(in srgb, var(--ion-color-medium, #92949c) 12%, transparent);
    }
    .side {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    h3 {
      margin: 0 0 12px;
      font-size: 1.05rem;
    }
    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .stat {
      border-radius: 12px;
      padding: 12px;
      background: color-mix(in srgb, var(--ion-color-primary, #3880ff) 7%, transparent);
    }
    .stat .label {
      font-size: 0.85rem;
      color: var(--ion-color-medium, #6b6b6b);
    }
    .stat .value {
      font-size: 1.6rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    ion-list {
      padding: 0;
      background: transparent;
    }
    .day-end {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      font-variant-numeric: tabular-nums;
    }
    .center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 48px 16px;
      text-align: center;
    }
    .big-icon {
      font-size: 40px;
    }
    /* Tones by token: the color attribute never paints inside this shadow root (module-toolkit#273). */
    ion-button.tone-success {
      --background: var(--ion-color-success, #2dd36f);
      --background-activated: var(--ion-color-success-shade, #28ba62);
      --background-hover: var(--ion-color-success-tint, #42d77d);
      --color: var(--ion-color-success-contrast, #fff);
    }
    ion-button.tone-danger {
      --background: var(--ion-color-danger, #c5000f);
      --background-activated: var(--ion-color-danger-shade, #ad000d);
      --background-hover: var(--ion-color-danger-tint, #cb1a27);
      --color: var(--ion-color-danger-contrast, #fff);
    }
    ion-button.tone-primary {
      --background: var(--ion-color-primary, #3880ff);
      --background-activated: var(--ion-color-primary-shade, #3171e0);
      --background-hover: var(--ion-color-primary-tint, #4c8dff);
      --color: var(--ion-color-primary-contrast, #fff);
    }
    ion-badge {
      --padding-start: 8px;
      --padding-end: 8px;
    }
    ion-badge.tone-success {
      --background: color-mix(in srgb, var(--ion-color-success, #2dd36f) 18%, transparent);
      --color: var(--ion-color-success-shade, #1f7a3a);
    }
    ion-badge.tone-medium {
      --background: color-mix(in srgb, var(--ion-color-medium, #92949c) 18%, transparent);
      --color: var(--ion-color-medium-shade, #555);
    }
    ion-badge.tone-warning {
      --background: color-mix(in srgb, var(--ion-color-warning, #ffc409) 25%, transparent);
      --color: color-mix(in srgb, var(--ion-color-warning-shade, #e0ac08) 45%, var(--ion-text-color, #1c1b18));
    }
    .empty {
      margin: 0;
      padding: 16px 0;
      text-align: center;
      color: var(--ion-color-medium, #6b6b6b);
    }
  `;

  @state() private loading = true;
  @state() private loaded = false;
  @state() private loadError = '';
  @state() private settings: Settings = { ...DEFAULT_SETTINGS };
  @state() private mode: DeviceMode = 'shared';
  @state() private open: OpenDay | null = null;
  @state() private recent: Day[] = [];
  @state() private todayDays: Day[] = [];
  @state() private todayBreaks: Break[] = [];
  @state() private busy: Busy = '';
  @state() private notice: Notice = null;
  @state() private distance: number | null = null;
  @state() private now = Date.now();

  private ticker: ReturnType<typeof setInterval> | undefined;

  private t(key: string, params?: Record<string, unknown>): string {
    return erplora().t(CATALOG, key, params);
  }

  private get locale(): string {
    return erplora().locale || 'es';
  }

  private get timezone(): string {
    return erplora().timezone || 'UTC';
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.ticker = setInterval(() => (this.now = Date.now()), 1000);
    void this.load();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = undefined;
  }

  /** Everything the screen shows, in parallel. Only the FIRST load paints the spinner. */
  private async load(): Promise<void> {
    this.loading = true;
    this.loadError = '';
    const sdk = erplora();
    const since = new Date(Date.now() - TODAY_WINDOW_MS).toISOString();
    try {
      const [settingsRows, openRows, mode, recentPage, todayRows, breakRows] = await Promise.all([
        sdk.query<unknown[]>('attendance.settings.get'),
        sdk.query<OpenDay[]>('attendance.records.mine_open'),
        readDeviceMode(),
        sdk.queryPage<Day>('attendance.records.mine', {
          limit: RECENT_DAYS,
          offset: 0,
          sort: 'clock_in_at',
          dir: 'desc',
        }),
        sdk.queryAll<Day>('attendance.records.mine', {
          filters: { clock_in_at: { from: since } },
          sort: 'clock_in_at',
          dir: 'desc',
        }),
        sdk.queryAll<Break>('attendance.breaks.mine', { filters: { started_at: { from: since } } }),
      ]);
      this.settings = settingsFrom(settingsRows);
      this.open = (Array.isArray(openRows) ? openRows[0] : null) ?? null;
      this.mode = mode;
      this.recent = rowsOf(recentPage).slice(0, RECENT_DAYS);
      const today = localDateOf(new Date().toISOString(), this.timezone);
      this.todayDays = (todayRows ?? []).filter((d) => d.local_date === today);
      const ids = new Set(this.todayDays.map((d) => d.id));
      this.todayBreaks = (breakRows ?? []).filter((b) => ids.has(b.record_id));
      this.now = Date.now();
      this.loaded = true;
    } catch (e) {
      this.loadError = errorMessage(CATALOG, this.locale, e, this.t('ui.common.loadError'));
    } finally {
      this.loading = false;
    }
  }

  private get locationChecked(): boolean {
    return this.settings.require_location === 1 && this.mode === 'personal';
  }

  private get workplaceSet(): boolean {
    return this.settings.workplace_lat !== null && this.settings.workplace_lng !== null;
  }

  private geoText(e: unknown): string {
    const code = e instanceof GeoError ? e.code : 'unavailable';
    return this.t(GEO_KEYS[code] ?? 'ui.common.locationUnavailable');
  }

  /** The measured position against the workplace (distance null when the workplace is not set). */
  private measure(pos: Position): Located {
    const { workplace_lat: lat, workplace_lng: lng, geofence_radius_m: radius } = this.settings;
    if (lat === null || lng === null) {
      return { lat: pos.lat, lng: pos.lng, accuracy_m: pos.accuracy_m, distance_m: null, within_radius: null };
    }
    const distance = Math.round(haversineMeters({ lat, lng }, pos));
    return {
      lat: pos.lat,
      lng: pos.lng,
      accuracy_m: pos.accuracy_m,
      distance_m: distance,
      within_radius: withinRadius(distance, radius) ? 1 : 0,
    };
  }

  private async clockIn(): Promise<void> {
    if (this.busy) return;
    this.busy = 'in';
    this.notice = null;
    this.distance = null;
    try {
      let located: Located = NOT_LOCATED;
      if (this.locationChecked) {
        if (!this.workplaceSet) {
          this.notice = { kind: 'error', text: this.t('ui.clock.workplaceNotSet') };
          return;
        }
        this.notice = { kind: 'info', text: this.t('ui.clock.locating') };
        let pos: Position;
        try {
          pos = await getPosition();
        } catch (e) {
          this.notice = { kind: 'error', text: this.geoText(e) };
          return;
        }
        located = this.measure(pos);
        this.distance = located.distance_m;
        if (located.within_radius !== 1) {
          this.notice = {
            kind: 'error',
            text: this.t('ui.clock.outsideRadius', {
              distance: located.distance_m,
              radius: this.settings.geofence_radius_m,
            }),
          };
          return;
        }
      }
      await this.send(() => erplora().command('attendance.clock_in', { source: this.mode, ...located }), 'ui.clock.clockedIn');
    } finally {
      this.busy = '';
    }
  }

  /** Clocking out NEVER blocks: the position is recorded when it can be read, and that is all. */
  private async clockOut(): Promise<void> {
    if (this.busy) return;
    this.busy = 'out';
    this.notice = null;
    try {
      let located: Located = NOT_LOCATED;
      if (this.locationChecked) {
        this.notice = { kind: 'info', text: this.t('ui.clock.locating') };
        try {
          located = this.measure(await getPosition());
          this.distance = located.distance_m;
        } catch {
          located = NOT_LOCATED;
        }
      }
      await this.send(() => erplora().command('attendance.clock_out', { ...located }), 'ui.clock.clockedOut');
    } finally {
      this.busy = '';
    }
  }

  private async toggleBreak(): Promise<void> {
    if (this.busy || !this.open) return;
    this.busy = 'break';
    this.notice = null;
    try {
      if (this.open.open_break_id) {
        await this.send(() => erplora().command('attendance.break_end', {}), 'ui.clock.breakEnded');
      } else {
        await this.send(() => erplora().command('attendance.break_start', {}), 'ui.clock.breakStarted');
      }
    } finally {
      this.busy = '';
    }
  }

  /**
   * Run a command (a thunk, so each call site names its command literally — ADR-0127) and reload. A refusal is spoken in the module's words and ALSO reloads: the
   * typical refusal (`clock_in_rejected`, `no_open_record`…) means the screen was out of date —
   * the day was opened or closed from another device — and the reload shows the real state.
   */
  private async send(run: () => Promise<unknown>, doneKey: string): Promise<void> {
    try {
      await run();
      this.notice = {
        kind: 'success',
        text: this.t(doneKey, { time: formatTime(new Date().toISOString(), this.timezone, this.locale) }),
      };
    } catch (e) {
      this.notice = { kind: 'error', text: errorMessage(CATALOG, this.locale, e, this.t('ui.common.unexpectedError')) };
    }
    await this.load();
  }

  private breakMinutes(b: Break, nowIso: string): number {
    return minutesBetween(b.started_at, b.ended_at ?? nowIso);
  }

  /** Today's worked time (net of breaks) and breaks, live while a day or a break is running. */
  private todayTotals(): { worked: number; breaks: number } {
    const nowIso = new Date(this.now).toISOString();
    let worked = 0;
    let breaks = 0;
    for (const day of this.todayDays) {
      const end = day.clock_out_at ?? (day.status === 'open' ? nowIso : null);
      const own = this.todayBreaks
        .filter((b) => b.record_id === day.id)
        .reduce((sum, b) => sum + this.breakMinutes(b, nowIso), 0);
      breaks += own;
      if (end) worked += Math.max(0, minutesBetween(day.clock_in_at, end) - own);
    }
    return { worked, breaks };
  }

  private renderStatusBadge(status: string) {
    const s = STATUS[status] ?? STATUS.closed;
    return html`<ion-badge class=${classMap({ [`tone-${s.color}`]: true })}>${this.t(s.key)}</ion-badge>`;
  }

  private renderDay(day: Day) {
    const tz = this.timezone;
    const locale = this.locale;
    const inAt = formatTime(day.clock_in_at, tz, locale);
    // An open day is still running: its badge already says so, and it has no clock-out to show.
    const outAt = day.clock_out_at
      ? formatTime(day.clock_out_at, tz, locale)
      : day.status === 'open'
        ? '…'
        : this.t('ui.clock.noClockOut');
    const duration = day.clock_out_at
      ? formatHm(Math.max(0, minutesBetween(day.clock_in_at, day.clock_out_at) - Number(day.breaks_closed_minutes ?? 0)))
      : '';
    return html`<ion-item lines="full">
      <ion-label>
        <h3>${formatLocalDate(day.local_date, locale)}</h3>
        <p>${inAt} – ${outAt}</p>
      </ion-label>
      <div class="day-end" slot="end">
        ${duration ? html`<span>${duration}</span>` : nothing} ${this.renderStatusBadge(day.status)}
      </div>
    </ion-item>`;
  }

  private renderNotice() {
    if (!this.notice) return nothing;
    return html`<p
      class="msg ${this.notice.kind}"
      role=${this.notice.kind === 'error' ? 'alert' : 'status'}
      data-testid="attendance-clock-message"
    >${this.notice.text}</p>`;
  }

  private renderClock() {
    const tz = this.timezone;
    const locale = this.locale;
    const name = sessionName();
    const open = this.open;
    const onBreak = !!open?.open_break_id;
    const elapsed = open ? Math.max(0, Math.floor((this.now - Date.parse(open.clock_in_at)) / 1000)) : 0;
    const busy = this.busy !== '';
    return html`<section class="card clock">
      <header>
        <h2>${name ? this.t('ui.clock.greeting', { name }) : this.t('ui.clock.title')}</h2>
        <p>${this.t('ui.clock.now', { time: formatTime(new Date(this.now).toISOString(), tz, locale) })}</p>
      </header>
      ${open
        ? html`<p class="status">
              ${onBreak
                ? this.t('ui.clock.statusOnBreak', { time: formatTime(open.open_break_started_at, tz, locale) })
                : this.t('ui.clock.statusIn', { time: formatTime(open.clock_in_at, tz, locale) })}
            </p>
            <div>
              <div class="muted">${this.t('ui.clock.elapsed')}</div>
              <div class="timer" data-testid="attendance-clock-timer">${formatHms(elapsed)}</div>
            </div>
            <div class="actions">
              ${onBreak
                ? html`<ion-button expand="block" class="tone-primary" data-testid="attendance-break-end"
                    ?disabled=${busy} @click=${() => this.toggleBreak()}>
                    <ion-icon slot="start" name="play-outline"></ion-icon>${this.t('ui.clock.breakEnd')}
                  </ion-button>`
                : html`<ion-button expand="block" fill="outline" data-testid="attendance-break-start"
                    ?disabled=${busy} @click=${() => this.toggleBreak()}>
                    <ion-icon slot="start" name="cafe-outline"></ion-icon>${this.t('ui.clock.breakStart')}
                  </ion-button>`}
              <ion-button expand="block" class="primary tone-danger" data-testid="attendance-clock-out"
                ?disabled=${busy} @click=${() => this.clockOut()}>
                ${this.busy === 'out'
                  ? html`<ion-spinner slot="start" name="crescent"></ion-spinner>`
                  : html`<ion-icon slot="start" name="log-out-outline"></ion-icon>`}
                ${this.t('ui.clock.clockOut')}
              </ion-button>
            </div>`
        : html`<p class="status">${this.t('ui.clock.statusOut')}</p>
            <div class="actions">
              <ion-button expand="block" class="primary tone-success" data-testid="attendance-clock-in"
                ?disabled=${busy} @click=${() => this.clockIn()}>
                ${this.busy === 'in'
                  ? html`<ion-spinner slot="start" name="crescent"></ion-spinner>`
                  : html`<ion-icon slot="start" name="log-in-outline"></ion-icon>`}
                ${this.t('ui.clock.clockIn')}
              </ion-button>
            </div>`}
      ${this.locationChecked
        ? html`<p class="note">
            <ion-icon name="location-outline" aria-hidden="true"></ion-icon>${this.t('ui.clock.locationRequired')}
          </p>`
        : nothing}
      ${this.distance !== null
        ? html`<p class="note" data-testid="attendance-clock-distance">
            ${this.t('ui.clock.distance', { distance: this.distance })}
          </p>`
        : nothing}
      ${this.renderNotice()}
    </section>`;
  }

  private renderSide() {
    const { worked, breaks } = this.todayTotals();
    return html`<div class="side">
      <section class="card">
        <h3>${this.t('ui.clock.today')}</h3>
        <div class="stats">
          <div class="stat" data-testid="attendance-clock-today-worked">
            <div class="label">${this.t('ui.clock.workedToday')}</div>
            <div class="value">${formatHm(worked)}</div>
          </div>
          <div class="stat" data-testid="attendance-clock-today-breaks">
            <div class="label">${this.t('ui.clock.breaksToday')}</div>
            <div class="value">${formatHm(breaks)}</div>
          </div>
        </div>
      </section>
      <section class="card">
        <h3>${this.t('ui.clock.recent')}</h3>
        ${this.recent.length
          ? html`<ion-list data-testid="attendance-clock-recent">${this.recent.map((d) => this.renderDay(d))}</ion-list>`
          : html`<p class="empty" data-testid="attendance-clock-empty">${this.t('ui.clock.empty')}</p>`}
      </section>
    </div>`;
  }

  render() {
    if (!this.loaded && this.loading) {
      return html`<div class="center" data-testid="attendance-clock-loading">
        <ion-spinner name="crescent"></ion-spinner>
        <span class="muted">${this.t('ui.common.loading')}</span>
      </div>`;
    }
    if (this.loadError) {
      return html`<div class="center" role="alert" data-testid="attendance-clock-error">
        <ion-icon class="big-icon" name="cloud-offline-outline" aria-hidden="true"></ion-icon>
        <p>${this.loadError}</p>
        <ion-button data-testid="attendance-clock-retry" ?disabled=${this.loading} @click=${() => this.load()}>
          <ion-icon slot="start" name="refresh-outline"></ion-icon>${this.t('ui.common.retry')}
        </ion-button>
      </div>`;
    }
    return html`<div class="layout">${this.renderClock()} ${this.renderSide()}</div>`;
  }
}

define('erp-attendance-clock', ErpAttendanceClock);
