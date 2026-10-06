import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { define } from '@erplora/outfitkit/define';
import '@erplora/outfitkit/ok-data-table';
import type { DataTableColumn } from '@erplora/outfitkit';
import { createListController, dataTableLabels } from '@erplora/module-sdk';
import type { ListController, ListClient, ListParams, ListPage } from '@erplora/module-sdk';
import esLocale from '../../../locales/es.json';
import enLocale from '../../../locales/en.json';
import { breakMinutes, formatHm, runningBreaksFrom, workedMinutes } from './minutes';
import type { BreakRow } from './minutes';
import { csvFileName, toCsv } from './csv';
import type { CsvRecord } from './csv';
import { fromLocalInput, localDate, localDateTime, localTime, monthOf, monthRange, recentMonths, toLocalInput } from './zone';

// The «Records» screen of the time clock (spec §6): the working days of the caller, or of the whole
// team with `attendance.view_all`; corrections with a mandatory reason (`attendance.correct`) and
// their trail; CSV export of every row of the filter. Times are the BUSINESS wall clock
// (`erplora().timezone`), the same zone the queries use for `local_date`.

const CATALOG: Record<string, unknown> = { es: esLocale, en: enLocale };

interface Notice {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface ErploraClientLike extends ListClient {
  readonly locale: string;
  readonly timezone?: string;
  query<T = unknown>(name: string, params?: Record<string, unknown>): Promise<T>;
  queryPage<R = unknown>(name: string, params: ListParams): Promise<ListPage<R>>;
  command<T = unknown>(name: string, payload?: Record<string, unknown>): Promise<T>;
  t(catalog: Record<string, unknown>, key: string, params?: Record<string, unknown>): string;
  notify?(n: Notice): void;
  on?(event: string, cb: (payload: unknown) => void): () => void;
}

interface RecordRow extends CsvRecord {
  source: string;
  in_distance_m: number | null;
  out_distance_m: number | null;
  note: string;
  break_count: number;
}

interface HubUser {
  id: string;
  name: string;
  role?: string;
  is_active?: boolean | number;
}

interface CorrectionRow {
  id: string;
  record_id: string;
  old_clock_in_at: string | null;
  old_clock_out_at: string | null;
  old_status: string | null;
  new_clock_in_at: string;
  new_clock_out_at: string | null;
  new_status: string;
  reason: string;
  created_by: string | null;
  created_at: string;
}

interface CorrectionDraft {
  row: RecordRow;
  clockIn: string;
  clockOut: string;
  reason: string;
  error: string;
  saving: boolean;
}

interface HistoryView {
  row: RecordRow;
  loading: boolean;
  error: string;
  items: CorrectionRow[];
}

interface SessionLike {
  id?: string;
  name?: string;
  role?: string;
  permissions?: unknown;
}

function erplora(): ErploraClientLike {
  const c = (globalThis as { erplora?: ErploraClientLike }).erplora;
  if (!c) throw new Error('erplora SDK is not initialised by the shell');
  return c;
}

function readSession(): SessionLike {
  try {
    return (JSON.parse(localStorage.getItem('erplora.session') ?? 'null') as SessionLike) ?? {};
  } catch {
    return {};
  }
}

/** UI-only permission check (the runtime re-checks every call): admin/owner hold every permission. */
function sessionCan(session: SessionLike, permission: string): boolean {
  const role = String(session.role ?? '').toLowerCase();
  if (role === 'admin' || role === 'owner') return true;
  const perms = Array.isArray(session.permissions) ? (session.permissions as unknown[]) : [];
  return perms.includes('*') || perms.includes(permission);
}

/** `hub.users.list` answers an array; a list envelope is accepted too. */
function usersOf(result: unknown): HubUser[] {
  const rows = Array.isArray(result) ? result : (result as { rows?: unknown })?.rows;
  return Array.isArray(rows) ? (rows as HubUser[]).filter((u) => u && u.id) : [];
}

const EXPORT_PAGE = 500;
const TICK_MS = 60_000;
const MONTHS_OFFERED = 24;
const STATUSES = ['open', 'closed', 'needs_review'] as const;
const STATUS_COLOR: Record<string, string> = { open: 'primary', closed: 'medium', needs_review: 'warning' };
const LIVE_EVENTS = [
  'attendance.clocked_in',
  'attendance.clocked_out',
  'attendance.break.started',
  'attendance.break.ended',
  'attendance.record.corrected',
  'attendance.record.needs_review',
];

export class ErpAttendanceRecords extends LitElement {
  static styles = css`
    :host { display: block; color: var(--ion-text-color, #1c1b18); }
    header { display: flex; align-items: center; gap: .5rem; margin-bottom: .75rem; }
    h2 { margin: 0; font-size: 1.15rem; flex: 1; }
    .filters { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; margin-bottom: .75rem; }
    .filters ion-select { flex: 1 1 12rem; max-width: 20rem; }
    .note { margin: .25rem 0 .75rem; color: var(--ion-color-warning-shade, #b26b00); font-size: .9rem; }
    .err { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; margin: .25rem 0 .75rem;
      color: var(--ion-color-danger, #c5000f); font-weight: 600; }
    .actions { display: flex; gap: .25rem; }
    .radius { display: inline-flex; gap: .25rem; font-size: 1.1rem; }
  `;

  @state() private month = '';
  @state() private status = '';
  @state() private userId = '';
  @state() private users: HubUser[] = [];
  @state() private usersFailed = false;
  @state() private runningBreaks: BreakRow[] = [];
  @state() private breaksFailed = false;
  @state() private now = Date.now();
  @state() private exporting = false;
  @state() private exportError = '';
  @state() private correcting: CorrectionDraft | null = null;
  @state() private history: HistoryView | null = null;

  private ctrl!: ListController<RecordRow>;
  private session: SessionLike = {};
  private team = false;
  private canCorrect = false;
  private lastRows: RecordRow[] | null = null;
  private tick?: ReturnType<typeof setInterval>;
  private unsubscribe: Array<() => void> = [];

  private t(key: string, params?: Record<string, unknown>): string {
    return erplora().t(CATALOG, key, params);
  }

  private get timezone(): string {
    return erplora().timezone || 'UTC';
  }

  private get recordsQuery(): string {
    return this.team ? 'attendance.records.list' : 'attendance.records.mine';
  }

  private get breaksQuery(): string {
    return this.team ? 'attendance.breaks.list' : 'attendance.breaks.mine';
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (!this.ctrl) this.init();
    this.tick = setInterval(() => (this.now = Date.now()), TICK_MS);
    const sdk = erplora();
    if (typeof sdk.on === 'function') {
      this.unsubscribe = LIVE_EVENTS.map((ev) => sdk.on!(ev, () => void this.ctrl.load()));
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.tick) clearInterval(this.tick);
    this.unsubscribe.forEach((off) => off());
    this.unsubscribe = [];
  }

  private init(): void {
    this.session = readSession();
    this.team = sessionCan(this.session, 'attendance.view_all');
    this.canCorrect = sessionCan(this.session, 'attendance.correct');
    this.month = monthOf(Date.now(), this.timezone);
    this.ctrl = createListController<RecordRow>(erplora(), this.recordsQuery, () => this.onListChange(), {
      pageSize: 50,
      sort: 'clock_in_at',
      dir: 'desc',
      filters: { clock_in_at: monthRange(this.month, this.timezone) },
    });
    void this.ctrl.load();
    if (this.team) void this.loadUsers();
  }

  private onListChange(): void {
    this.requestUpdate();
    if (this.ctrl && !this.ctrl.loading && this.ctrl.rows !== this.lastRows) {
      this.lastRows = this.ctrl.rows;
      void this.refreshRunningBreaks(this.ctrl.rows);
    }
  }

  private async loadUsers(): Promise<void> {
    try {
      this.users = usersOf(await erplora().query('hub.users.list'));
      this.usersFailed = false;
    } catch {
      this.users = [];
      this.usersFailed = true;
    }
  }

  /** The running breaks of the open days in `rows`, in one query (see `runningBreaksFrom`). */
  private async fetchRunningBreaks(rows: readonly RecordRow[]): Promise<BreakRow[]> {
    const from = runningBreaksFrom(rows);
    if (from === null) return [];
    const ids = new Set(rows.filter((r) => r.status === 'open').map((r) => r.id));
    const page = await erplora().queryPage<BreakRow>(this.breaksQuery, {
      limit: EXPORT_PAGE,
      offset: 0,
      filters: { started_at: { from } },
    });
    return (page?.rows ?? []).filter((b) => ids.has(b.record_id) && !b.ended_at);
  }

  private async refreshRunningBreaks(rows: readonly RecordRow[]): Promise<void> {
    try {
      this.runningBreaks = await this.fetchRunningBreaks(rows);
      this.breaksFailed = false;
    } catch {
      this.runningBreaks = [];
      this.breaksFailed = true;
    }
  }

  private nameOf(userId: string): string {
    if (!this.team && userId === this.session.id && this.session.name) return this.session.name;
    return this.users.find((u) => u.id === userId)?.name?.trim() || userId;
  }

  private shortDate(day: string): string {
    const [y, m, d] = day.split('-').map(Number);
    return new Intl.DateTimeFormat(erplora().locale, {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(y, m - 1, d)));
  }

  private monthLabel(month: string): string {
    const [y, m] = month.split('-').map(Number);
    const label = new Intl.DateTimeFormat(erplora().locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
      new Date(Date.UTC(y, m - 1, 1)),
    );
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  /** `HH:MM`, with the day when it is not the day of the clock-in (a night shift). */
  private timeOf(iso: string | null | undefined, day: string): string {
    if (!iso) return '—';
    const tz = this.timezone;
    const d = localDate(iso, tz);
    return d === day ? localTime(iso, tz) : `${localTime(iso, tz)} (${this.shortDate(d)})`;
  }

  private statusLabel(status: string | null | undefined): string {
    return status ? this.t(`ui.records.status.${status}`) : '—';
  }

  private badge(label: string, color: string): TemplateResult {
    // Inline vars: the `.ion-color-*` classes do not reach inside the table's shadow root.
    return html`<ion-badge
      style="--background: var(--ion-color-${color}); --color: var(--ion-color-${color}-contrast)"
      >${label}</ion-badge
    >`;
  }

  private radiusIcon(value: number | null | undefined, inside: string, outside: string): TemplateResult | typeof nothing {
    if (value === null || value === undefined) return nothing;
    const ok = Number(value) === 1;
    const label = ok ? inside : outside;
    return html`<ion-icon
      name=${ok ? 'checkmark-circle-outline' : 'alert-circle-outline'}
      style="color: var(--ion-color-${ok ? 'success' : 'danger'})"
      title=${label}
      aria-label=${label}
      role="img"
    ></ion-icon>`;
  }

  private get columns(): DataTableColumn[] {
    const row = (r: Record<string, unknown>) => r as unknown as RecordRow;
    const cols: DataTableColumn[] = [
      { key: 'local_date', header: this.t('ui.records.colDate'), format: (r) => this.shortDate(row(r).local_date) },
    ];
    if (this.team) {
      cols.push({ key: 'user_id', header: this.t('ui.records.colUser'), format: (r) => this.nameOf(row(r).user_id) });
    }
    cols.push(
      {
        key: 'clock_in_at',
        header: this.t('ui.records.colIn'),
        sortable: true,
        format: (r) => this.timeOf(row(r).clock_in_at, row(r).local_date),
      },
      {
        key: 'clock_out_at',
        header: this.t('ui.records.colOut'),
        sortable: true,
        format: (r) => this.timeOf(row(r).clock_out_at, row(r).local_date),
      },
      {
        key: 'break_minutes',
        header: this.t('ui.records.colBreaks'),
        align: 'right',
        format: (r) => String(breakMinutes(row(r), this.runningBreaks, this.now)),
      },
      {
        key: 'worked_minutes',
        header: this.t('ui.records.colWorked'),
        align: 'right',
        render: (r) => {
          const worked = workedMinutes(row(r), this.runningBreaks, this.now);
          if (worked === null) return '—';
          return row(r).status === 'open'
            ? html`${formatHm(worked)} ${this.badge(this.t('ui.records.inProgress'), 'primary')}`
            : formatHm(worked);
        },
      },
      {
        key: 'status',
        header: this.t('ui.records.colStatus'),
        sortable: true,
        render: (r) => this.badge(this.statusLabel(row(r).status), STATUS_COLOR[row(r).status] ?? 'medium'),
      },
      {
        key: 'within_radius',
        header: this.t('ui.records.colRadius'),
        render: (r) => {
          const rec = row(r);
          if (rec.in_within_radius == null && rec.out_within_radius == null) {
            return html`<span title=${this.t('ui.records.noLocation')}>—</span>`;
          }
          return html`<span class="radius"
            >${this.radiusIcon(rec.in_within_radius, this.t('ui.records.radiusInInside'), this.t('ui.records.radiusInOutside'))}${this.radiusIcon(
              rec.out_within_radius,
              this.t('ui.records.radiusOutInside'),
              this.t('ui.records.radiusOutOutside'),
            )}</span
          >`;
        },
      },
    );
    if (this.team) {
      cols.push({
        key: 'actions',
        header: this.t('ui.records.colActions'),
        pinned: 'end',
        render: (r) => this.rowActions(row(r)),
      });
    }
    return cols;
  }

  private rowActions(r: RecordRow): TemplateResult {
    return html`<span class="actions">
      ${this.canCorrect
        ? html`<ion-button
            size="small"
            fill="clear"
            data-testid=${`attendance-correct-${r.id}`}
            title=${this.t('ui.records.correct')}
            @click=${() => this.openCorrection(r)}
          >
            <ion-icon slot="start" name="create-outline" aria-hidden="true"></ion-icon>${this.t('ui.records.correct')}
          </ion-button>`
        : nothing}
      <ion-button
        size="small"
        fill="clear"
        data-testid=${`attendance-history-${r.id}`}
        title=${this.t('ui.records.history')}
        @click=${() => void this.openHistory(r)}
      >
        <ion-icon slot="start" name="time-outline" aria-hidden="true"></ion-icon>${this.t('ui.records.history')}
      </ion-button>
    </span>`;
  }

  // ── Filters ───────────────────────────────────────────────────────────────────────────────────

  private setMonth(month: string): void {
    if (!month || month === this.month) return;
    this.month = month;
    this.ctrl.setFilter('clock_in_at', monthRange(month, this.timezone));
  }

  private setUser(userId: string): void {
    this.userId = userId ?? '';
    this.ctrl.setFilter('user_id', this.userId);
  }

  private setStatus(status: string): void {
    this.status = status ?? '';
    this.ctrl.setFilter('status', this.status);
  }

  // ── Correction ────────────────────────────────────────────────────────────────────────────────

  private openCorrection(r: RecordRow): void {
    const tz = this.timezone;
    this.correcting = {
      row: r,
      clockIn: toLocalInput(r.clock_in_at, tz),
      clockOut: r.clock_out_at ? toLocalInput(r.clock_out_at, tz) : '',
      reason: '',
      error: '',
      saving: false,
    };
  }

  private patchCorrection(patch: Partial<CorrectionDraft>): void {
    if (this.correcting) this.correcting = { ...this.correcting, ...patch };
  }

  /** The catalogue text of a refusal code, or the SDK's own (already translated) message. */
  private refusal(e: unknown, fallbackKey: string): string {
    const code = (e as { code?: unknown })?.code;
    // Only the module's own codes have a catalogue text; the rest (permission, platform) arrive
    // already translated by the SDK in `message`. Read directly: the codes carry dots
    // (`attendance.record_not_found`), which `t()` would walk as nested keys.
    if (typeof code === 'string') {
      const locale = String(erplora().locale ?? 'en').toLowerCase();
      const dict = (CATALOG[locale] ?? CATALOG[locale.split('-')[0]] ?? CATALOG.en) as { errors?: Record<string, unknown> };
      const text = dict.errors?.[code] ?? (CATALOG.en as { errors?: Record<string, unknown> }).errors?.[code];
      if (typeof text === 'string' && text) return text;
    }
    const message = e instanceof Error ? e.message.trim() : '';
    return message || this.t(fallbackKey);
  }

  private async saveCorrection(): Promise<void> {
    const draft = this.correcting;
    if (!draft || draft.saving) return;
    const tz = this.timezone;
    const clockIn = fromLocalInput(draft.clockIn, tz);
    if (!clockIn) return this.patchCorrection({ error: this.t('ui.records.invalidClockIn') });
    const hasOut = draft.clockOut.trim() !== '';
    const clockOut = hasOut ? fromLocalInput(draft.clockOut, tz) : null;
    if (hasOut && (!clockOut || Date.parse(clockOut) <= Date.parse(clockIn))) {
      return this.patchCorrection({ error: this.t('ui.records.invalidCorrection') });
    }
    const reason = draft.reason.trim();
    if (reason.length < 3) return this.patchCorrection({ error: this.t('ui.records.reasonRequired') });

    this.patchCorrection({ saving: true, error: '' });
    try {
      await erplora().command('attendance.records.correct', {
        record_id: draft.row.id,
        clock_in_at: clockIn,
        clock_out_at: clockOut,
        reason,
      });
      this.correcting = null;
      erplora().notify?.({ type: 'success', message: this.t('ui.records.corrected') });
      await this.ctrl.load();
    } catch (e) {
      this.patchCorrection({ saving: false, error: this.refusal(e, 'ui.records.saveFailed') });
    }
  }

  private renderCorrection(): TemplateResult {
    const c = this.correcting;
    return html`<ion-modal .isOpen=${!!c} @ionModalDidDismiss=${() => (this.correcting = null)}>
      ${c
        ? html`<ion-header>
              <ion-toolbar>
                <ion-title>${this.t('ui.records.correctTitle')}</ion-title>
                <ion-buttons slot="end">
                  <ion-button fill="clear" data-testid="attendance-correct-cancel" @click=${() => (this.correcting = null)}>
                    ${this.t('ui.records.cancel')}
                  </ion-button>
                </ion-buttons>
              </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
              <p>
                <strong>${this.team ? this.nameOf(c.row.user_id) : ''}</strong>
                ${this.team ? ' · ' : ''}${this.shortDate(c.row.local_date)} · ${this.statusLabel(c.row.status)}
              </p>
              <ion-input
                mode="md"
                fill="outline"
                type="datetime-local"
                label-placement="floating"
                class="ion-margin-bottom"
                label=${this.t('ui.records.fieldClockIn')}
                data-testid="attendance-correct-clock-in"
                .value=${c.clockIn}
                @ionInput=${(e: Event) => this.patchCorrection({ clockIn: String((e.target as HTMLInputElement).value ?? '') })}
              ></ion-input>
              <ion-input
                mode="md"
                fill="outline"
                type="datetime-local"
                label-placement="floating"
                class="ion-margin-bottom"
                clear-input
                label=${this.t('ui.records.fieldClockOut')}
                data-testid="attendance-correct-clock-out"
                .value=${c.clockOut}
                @ionInput=${(e: Event) => this.patchCorrection({ clockOut: String((e.target as HTMLInputElement).value ?? '') })}
              ></ion-input>
              <ion-textarea
                mode="md"
                fill="outline"
                label-placement="floating"
                auto-grow
                counter
                maxlength="500"
                class="ion-margin-bottom"
                label=${this.t('ui.records.fieldReason')}
                helper-text=${this.t('ui.records.reasonHelper')}
                data-testid="attendance-correct-reason"
                .value=${c.reason}
                @ionInput=${(e: Event) => this.patchCorrection({ reason: String((e.target as HTMLTextAreaElement).value ?? '') })}
              ></ion-textarea>
              ${c.error
                ? html`<ion-text color="danger"><p data-testid="attendance-correct-error" role="alert">${c.error}</p></ion-text>`
                : nothing}
              <ion-button
                expand="block"
                data-testid="attendance-correct-save"
                ?disabled=${c.saving}
                @click=${() => void this.saveCorrection()}
              >
                ${c.saving ? this.t('ui.records.saving') : this.t('ui.records.save')}
              </ion-button>
            </ion-content>`
        : nothing}
    </ion-modal>`;
  }

  // ── History ───────────────────────────────────────────────────────────────────────────────────

  private async openHistory(r: RecordRow): Promise<void> {
    this.history = { row: r, loading: true, error: '', items: [] };
    try {
      const page = await erplora().queryPage<CorrectionRow>('attendance.corrections.list', {
        limit: 200,
        offset: 0,
        sort: 'created_at',
        dir: 'desc',
        filters: { record_id: r.id },
      });
      if (this.history?.row.id !== r.id) return;
      this.history = { ...this.history, loading: false, items: page?.rows ?? [] };
    } catch (e) {
      if (this.history?.row.id !== r.id) return;
      this.history = { ...this.history, loading: false, error: this.refusal(e, 'ui.records.historyFailed') };
    }
  }

  private span(inAt: string | null, outAt: string | null): string {
    const tz = this.timezone;
    const a = inAt ? localDateTime(inAt, tz) : '—';
    const b = outAt ? localDateTime(outAt, tz) : '—';
    return `${a} → ${b}`;
  }

  private renderHistory(): TemplateResult {
    const h = this.history;
    return html`<ion-modal .isOpen=${!!h} @ionModalDidDismiss=${() => (this.history = null)}>
      ${h
        ? html`<ion-header>
              <ion-toolbar>
                <ion-title>${this.t('ui.records.historyTitle')}</ion-title>
                <ion-buttons slot="end">
                  <ion-button fill="clear" data-testid="attendance-history-close" @click=${() => (this.history = null)}>
                    ${this.t('ui.records.close')}
                  </ion-button>
                </ion-buttons>
              </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
              <p>
                <strong>${this.nameOf(h.row.user_id)}</strong> · ${this.shortDate(h.row.local_date)}
              </p>
              ${h.loading
                ? html`<p><ion-spinner name="dots"></ion-spinner> ${this.t('ui.records.historyLoading')}</p>`
                : h.error
                  ? html`<ion-text color="danger"><p data-testid="attendance-history-error" role="alert">${h.error}</p></ion-text>`
                  : h.items.length === 0
                    ? html`<p data-testid="attendance-history-empty">${this.t('ui.records.historyEmpty')}</p>`
                    : html`<ion-list data-testid="attendance-history-list" lines="full">
                        ${h.items.map(
                          (c) => html`<ion-item>
                            <ion-label class="ion-text-wrap">
                              <h3>${this.nameOf(c.created_by ?? '')} · ${localDateTime(c.created_at, this.timezone)}</h3>
                              <p>
                                ${this.t('ui.records.historyBefore')}: ${this.span(c.old_clock_in_at, c.old_clock_out_at)}
                                (${this.statusLabel(c.old_status)})
                              </p>
                              <p>
                                ${this.t('ui.records.historyAfter')}: ${this.span(c.new_clock_in_at, c.new_clock_out_at)}
                                (${this.statusLabel(c.new_status)})
                              </p>
                              <p>${this.t('ui.records.historyReason')}: ${c.reason}</p>
                            </ion-label>
                          </ion-item>`,
                        )}
                      </ion-list>`}
            </ion-content>`
        : nothing}
    </ion-modal>`;
  }

  // ── CSV ───────────────────────────────────────────────────────────────────────────────────────

  /** Every row of the current filter (not just the visible page), `EXPORT_PAGE` at a time. */
  private async fetchAllRows(): Promise<RecordRow[]> {
    const all: RecordRow[] = [];
    let total = Infinity;
    while (all.length < total) {
      const page = await erplora().queryPage<RecordRow>(this.recordsQuery, {
        limit: EXPORT_PAGE,
        offset: all.length,
        sort: this.ctrl.state.sort,
        dir: this.ctrl.state.dir,
        filters: { ...this.ctrl.state.filters },
      });
      const rows = page?.rows ?? [];
      total = Number(page?.total ?? rows.length);
      if (rows.length === 0) break;
      all.push(...rows);
    }
    return all;
  }

  private csvNames(): Map<string, string> {
    const names = new Map(this.users.map((u): [string, string] => [u.id, String(u.name ?? '').trim()]));
    if (this.session.id && this.session.name && !names.has(this.session.id)) names.set(this.session.id, this.session.name);
    return names;
  }

  private async exportCsv(): Promise<void> {
    if (this.exporting) return;
    this.exporting = true;
    this.exportError = '';
    try {
      const rows = await this.fetchAllRows();
      const breaks = await this.fetchRunningBreaks(rows);
      const csv = toCsv(rows, this.csvNames(), { timezone: this.timezone, now: Date.now(), breaks });
      // The BOM makes spreadsheet apps read the accents of the names as UTF-8.
      const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = csvFileName(this.month);
      a.hidden = true;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      if (rows.length === 0) erplora().notify?.({ type: 'info', message: this.t('ui.records.exportEmpty') });
    } catch (e) {
      this.exportError = this.refusal(e, 'ui.records.exportFailed');
      erplora().notify?.({ type: 'error', message: this.exportError });
    } finally {
      this.exporting = false;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────────────────────

  private renderFilters(): TemplateResult {
    const months = recentMonths(monthOf(Date.now(), this.timezone), MONTHS_OFFERED);
    if (!months.includes(this.month)) months.push(this.month);
    const users = [...this.users].sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return html`<div class="filters">
      ${this.team
        ? html`<ion-select
            mode="md"
            fill="outline"
            label-placement="floating"
            label=${this.t('ui.records.filterUser')}
            data-testid="attendance-records-user"
            .value=${this.userId}
            @ionChange=${(e: CustomEvent<{ value: string }>) => this.setUser(e.detail.value)}
          >
            <ion-select-option value="">${this.t('ui.records.allUsers')}</ion-select-option>
            ${users.map((u) => html`<ion-select-option value=${u.id}>${u.name || u.id}</ion-select-option>`)}
          </ion-select>`
        : nothing}
      <ion-select
        mode="md"
        fill="outline"
        label-placement="floating"
        label=${this.t('ui.records.filterMonth')}
        data-testid="attendance-records-month"
        .value=${this.month}
        @ionChange=${(e: CustomEvent<{ value: string }>) => this.setMonth(e.detail.value)}
      >
        ${months.map((m) => html`<ion-select-option value=${m}>${this.monthLabel(m)}</ion-select-option>`)}
      </ion-select>
      <ion-select
        mode="md"
        fill="outline"
        label-placement="floating"
        label=${this.t('ui.records.filterStatus')}
        data-testid="attendance-records-status"
        .value=${this.status}
        @ionChange=${(e: CustomEvent<{ value: string }>) => this.setStatus(e.detail.value)}
      >
        <ion-select-option value="">${this.t('ui.records.allStatuses')}</ion-select-option>
        ${STATUSES.map((s) => html`<ion-select-option value=${s}>${this.statusLabel(s)}</ion-select-option>`)}
      </ion-select>
      <ion-button
        fill="outline"
        data-testid="attendance-export-csv"
        ?disabled=${this.exporting}
        @click=${() => void this.exportCsv()}
      >
        <ion-icon slot="start" name="download-outline" aria-hidden="true"></ion-icon>
        ${this.exporting ? this.t('ui.records.exporting') : this.t('ui.records.exportCsv')}
      </ion-button>
    </div>`;
  }

  render() {
    const ctrl = this.ctrl;
    const narrow = typeof window !== 'undefined' && window.innerWidth <= 834;
    return html`
      <header><h2>${this.t('ui.records.title')}</h2></header>
      ${this.renderFilters()}
      ${this.exportError
        ? html`<p class="err" data-testid="attendance-export-error" role="alert">${this.exportError}</p>`
        : nothing}
      ${this.usersFailed ? html`<p class="note" data-testid="attendance-records-users-note">${this.t('ui.records.usersUnavailable')}</p>` : nothing}
      ${this.breaksFailed ? html`<p class="note" data-testid="attendance-records-breaks-note">${this.t('ui.records.breaksUnavailable')}</p>` : nothing}
      ${ctrl?.error
        ? html`<div class="err" role="alert">
            <span data-testid="attendance-records-error">${ctrl.error || this.t('ui.records.loadFailed')}</span>
            <ion-button size="small" fill="outline" color="danger" data-testid="attendance-records-retry" @click=${() => void ctrl.load()}>
              <ion-icon slot="start" name="refresh-outline" aria-hidden="true"></ion-icon>${this.t('ui.records.retry')}
            </ion-button>
          </div>`
        : nothing}
      <ok-data-table
        testid="attendance-records-table"
        .serverSide=${true}
        .views=${true}
        .defaultView=${narrow ? 'cards' : 'table'}
        .cardTitle=${(r: Record<string, unknown>) => {
          const rec = r as unknown as RecordRow;
          const day = this.shortDate(rec.local_date);
          return this.team ? `${day} · ${this.nameOf(rec.user_id)}` : day;
        }}
        .labels=${dataTableLabels(erplora().locale)}
        .columns=${this.columns}
        .rows=${ctrl?.rows ?? []}
        .total=${ctrl?.total ?? 0}
        .page=${ctrl?.state.page ?? 0}
        .pageSize=${ctrl?.state.pageSize ?? 50}
        .pageSizeOptions=${[]}
        .sort=${ctrl?.state.sort}
        .sortDir=${ctrl?.state.dir ?? 'desc'}
        .emptyMessage=${ctrl?.loading ? this.t('ui.records.loading') : this.t('ui.records.empty')}
        @pageChange=${(e: CustomEvent<number>) => ctrl.setPage(e.detail)}
        @sortChange=${(e: CustomEvent<{ sort: string; dir: 'asc' | 'desc' }>) => ctrl.setSort(e.detail.sort, e.detail.dir)}
      ></ok-data-table>
      ${this.renderCorrection()} ${this.renderHistory()}
    `;
  }
}

define('erp-attendance-records', ErpAttendanceRecords);
