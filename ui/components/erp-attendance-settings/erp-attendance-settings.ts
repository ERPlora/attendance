import { LitElement, html, css, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { define } from '@erplora/outfitkit/define';
// i18n catalogue of the module (ADR-0055/0199): English source + Spanish translation.
import esLocale from '../../../locales/es.json';
import enLocale from '../../../locales/en.json';
import { GeoError, getPosition } from '../../lib/geo';
import { errorMessage } from '../../lib/errors';
import {
  AUTO_CLOSE_MAX,
  AUTO_CLOSE_MIN,
  DEFAULT_SETTINGS,
  RADIUS_OPTIONS,
  settingsFrom,
  type Settings,
} from '../../lib/settings';

const CATALOG: Record<string, unknown> = { es: esLocale, en: enLocale };

// «Settings» tab of the `attendance` module, mounted by the shell through `settings.component`
// (spec §6). It exists instead of the shell's generic form for ONE reason: the «Use my current
// location» button, which reads the workplace coordinates from the device standing in it. Loads
// `attendance.settings.get` (no row → the schema defaults) and saves the FULL snapshot through
// `attendance.settings.update`.

interface ErploraClientLike {
  query<T = unknown>(name: string, params?: Record<string, unknown>): Promise<T>;
  command<T = unknown>(name: string, payload?: Record<string, unknown>): Promise<T>;
  t(catalog: Record<string, unknown>, key: string, params?: Record<string, unknown>): string;
  readonly locale?: string;
}

function erplora(): ErploraClientLike {
  const c = (globalThis as { erplora?: ErploraClientLike }).erplora;
  if (!c) throw new Error('erplora SDK not initialised by the shell');
  return c;
}

/** Decimals kept from a device position: 6 is ~0.1 m, far below any GPS accuracy. */
const COORD_DECIMALS = 6;

const GEO_KEYS: Record<string, string> = {
  denied: 'ui.settings.locationDenied',
  unavailable: 'ui.common.locationUnavailable',
  timeout: 'ui.common.locationTimeout',
  unsupported: 'ui.common.locationUnsupported',
};

type Notice = { kind: 'error' | 'success'; text: string } | null;

/** The text of an `ionInput`/`ionChange`, wherever Ionic put it. */
function valueOf(e: Event): string {
  const detail = (e as CustomEvent<{ value?: unknown } | null>).detail;
  const raw = detail && 'value' in detail ? detail.value : (e.target as { value?: unknown } | null)?.value;
  return raw === null || raw === undefined ? '' : String(raw);
}

const coordText = (n: number | null): string => (n === null ? '' : String(n));

export class ErpAttendanceSettings extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      color: var(--ion-text-color, #1c1b18);
      box-sizing: border-box;
    }
    .card {
      max-width: 720px;
      margin: 0 auto;
      background: var(--ion-card-background, var(--ion-background-color, #fff));
      border: 1px solid var(--ion-border-color, rgba(0, 0, 0, 0.12));
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    h2 {
      margin: 0;
      font-size: 1.25rem;
    }
    h3 {
      margin: 0 0 8px;
      font-size: 1rem;
    }
    .muted,
    .help {
      margin: 4px 0 0;
      color: var(--ion-color-medium, #6b6b6b);
      font-size: 0.9rem;
    }
    ion-toggle {
      width: 100%;
    }
    /* A long label wraps instead of being cut with an ellipsis on a phone. */
    ion-toggle::part(label) {
      white-space: normal;
      overflow: visible;
      text-overflow: clip;
      line-height: 1.35;
    }
    .pair {
      display: grid;
      gap: 12px;
      grid-template-columns: minmax(0, 1fr);
    }
    @media (min-width: 600px) {
      .pair {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      }
    }
    .locate {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 12px;
      margin-top: 8px;
    }
    .locate ion-button {
      margin: 0;
    }
    .warning {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin: 0;
      padding: 10px 12px;
      border-radius: 10px;
      /* The warning shade alone is too light to read on its own wash: darken it towards the text. */
      color: color-mix(in srgb, var(--ion-color-warning-shade, #e0ac08) 45%, var(--ion-text-color, #1c1b18));
      background: color-mix(in srgb, var(--ion-color-warning, #ffc409) 18%, transparent);
      border-left: 4px solid var(--ion-color-warning, #ffc409);
      font-weight: 600;
    }
    .warning ion-icon {
      flex: 0 0 auto;
      font-size: 20px;
    }
    .msg {
      margin: 0;
      padding: 10px 12px;
      border-radius: 10px;
      font-weight: 600;
    }
    .msg.error {
      color: var(--ion-color-danger, #c5000f);
      background: color-mix(in srgb, var(--ion-color-danger, #c5000f) 10%, transparent);
    }
    .msg.success {
      color: var(--ion-color-success-shade, #1f7a3a);
      background: color-mix(in srgb, var(--ion-color-success, #2dd36f) 12%, transparent);
    }
    .actions {
      display: flex;
      justify-content: flex-end;
    }
    .actions ion-button {
      margin: 0;
      min-width: 140px;
    }
    @media (max-width: 599px) {
      .actions ion-button {
        width: 100%;
      }
    }
    .big-icon {
      font-size: 40px;
    }
    .center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 48px 16px;
      text-align: center;
    }
  `;

  @state() private loading = true;
  @state() private loaded = false;
  @state() private loadError = '';
  @state() private requireLocation: 0 | 1 = DEFAULT_SETTINGS.require_location;
  @state() private radius = DEFAULT_SETTINGS.geofence_radius_m;
  @state() private latText = '';
  @state() private lngText = '';
  @state() private hoursText = String(DEFAULT_SETTINGS.auto_close_after_hours);
  @state() private accuracy: number | null = null;
  @state() private locating = false;
  @state() private saving = false;
  @state() private notice: Notice = null;

  private t(key: string, params?: Record<string, unknown>): string {
    return erplora().t(CATALOG, key, params);
  }

  private get locale(): string {
    return erplora().locale || 'es';
  }

  connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  private apply(s: Settings): void {
    this.requireLocation = s.require_location;
    this.radius = s.geofence_radius_m;
    this.latText = coordText(s.workplace_lat);
    this.lngText = coordText(s.workplace_lng);
    this.hoursText = String(s.auto_close_after_hours);
  }

  private async load(): Promise<void> {
    this.loading = true;
    this.loadError = '';
    try {
      this.apply(settingsFrom(await erplora().query<unknown[]>('attendance.settings.get')));
      this.loaded = true;
    } catch (e) {
      this.loadError = errorMessage(CATALOG, this.locale, e, this.t('ui.common.loadError'));
    } finally {
      this.loading = false;
    }
  }

  private get workplaceMissing(): boolean {
    return this.requireLocation === 1 && (!this.latText.trim() || !this.lngText.trim());
  }

  private async useMyLocation(): Promise<void> {
    if (this.locating) return;
    this.locating = true;
    this.notice = null;
    try {
      const pos = await getPosition();
      this.latText = String(Number(pos.lat.toFixed(COORD_DECIMALS)));
      this.lngText = String(Number(pos.lng.toFixed(COORD_DECIMALS)));
      this.accuracy = Math.round(pos.accuracy_m);
    } catch (e) {
      const code = e instanceof GeoError ? e.code : 'unavailable';
      this.notice = { kind: 'error', text: this.t(GEO_KEYS[code] ?? 'ui.common.locationUnavailable') };
    } finally {
      this.locating = false;
    }
  }

  /** The snapshot to send, or the key of the first thing wrong with the form. */
  private snapshot(): { ok: true; value: Settings } | { ok: false; key: string } {
    const lat = this.latText.trim();
    const lng = this.lngText.trim();
    if (!!lat !== !!lng) return { ok: false, key: 'ui.settings.coordinatesIncomplete' };
    const latN = lat ? Number(lat) : null;
    const lngN = lng ? Number(lng) : null;
    if (latN !== null && !(Number.isFinite(latN) && Math.abs(latN) <= 90)) {
      return { ok: false, key: 'ui.settings.invalidLatitude' };
    }
    if (lngN !== null && !(Number.isFinite(lngN) && Math.abs(lngN) <= 180)) {
      return { ok: false, key: 'ui.settings.invalidLongitude' };
    }
    const hours = Number(this.hoursText.trim());
    if (!this.hoursText.trim() || !Number.isInteger(hours) || hours < AUTO_CLOSE_MIN || hours > AUTO_CLOSE_MAX) {
      return { ok: false, key: 'ui.settings.invalidAutoClose' };
    }
    return {
      ok: true,
      value: {
        require_location: this.requireLocation,
        geofence_radius_m: this.radius,
        workplace_lat: latN,
        workplace_lng: lngN,
        auto_close_after_hours: hours,
      },
    };
  }

  private async save(): Promise<void> {
    if (this.saving) return;
    this.notice = null;
    const snap = this.snapshot();
    if (!snap.ok) {
      this.notice = { kind: 'error', text: this.t(snap.key) };
      return;
    }
    this.saving = true;
    try {
      await erplora().command('attendance.settings.update', { ...snap.value });
      this.notice = { kind: 'success', text: this.t('ui.settings.saved') };
    } catch (e) {
      this.notice = { kind: 'error', text: errorMessage(CATALOG, this.locale, e, this.t('ui.common.unexpectedError')) };
    } finally {
      this.saving = false;
    }
  }

  render() {
    if (!this.loaded && this.loading) {
      return html`<div class="center" data-testid="attendance-settings-loading">
        <ion-spinner name="crescent"></ion-spinner>
        <span class="muted">${this.t('ui.common.loading')}</span>
      </div>`;
    }
    if (this.loadError) {
      return html`<div class="center" role="alert" data-testid="attendance-settings-error">
        <ion-icon class="big-icon" name="cloud-offline-outline" aria-hidden="true"></ion-icon>
        <p>${this.loadError}</p>
        <ion-button data-testid="attendance-settings-retry" ?disabled=${this.loading} @click=${() => this.load()}>
          <ion-icon slot="start" name="refresh-outline"></ion-icon>${this.t('ui.common.retry')}
        </ion-button>
      </div>`;
    }
    return html`<section class="card">
      <header>
        <h2>${this.t('ui.settings.title')}</h2>
        <p class="muted">${this.t('ui.settings.intro')}</p>
      </header>

      <ion-toggle
        label-placement="start"
        justify="space-between"
        data-testid="attendance-settings-require-location"
        .checked=${this.requireLocation === 1}
        @ionChange=${(e: CustomEvent<{ checked: boolean }>) => (this.requireLocation = e.detail?.checked ? 1 : 0)}
        >${this.t('ui.settings.requireLocation')}</ion-toggle
      >

      <ion-select
        mode="md"
        fill="outline"
        interface="popover"
        label-placement="floating"
        label=${this.t('ui.settings.radius')}
        data-testid="attendance-settings-radius"
        .value=${String(this.radius)}
        @ionChange=${(e: Event) => {
          const n = Number(valueOf(e));
          if (RADIUS_OPTIONS.includes(n)) this.radius = n;
        }}
      >
        ${RADIUS_OPTIONS.map(
          (r) => html`<ion-select-option value=${String(r)}>${this.t('ui.settings.radiusOption', { radius: r })}</ion-select-option>`,
        )}
      </ion-select>

      <div>
        <h3>${this.t('ui.settings.workplace')}</h3>
        <div class="pair">
          <ion-input
            mode="md"
            fill="outline"
            type="number"
            inputmode="decimal"
            min="-90"
            max="90"
            step="any"
            label-placement="floating"
            label=${this.t('ui.settings.latitude')}
            data-testid="attendance-settings-lat"
            .value=${this.latText}
            @ionInput=${(e: Event) => (this.latText = valueOf(e))}
          ></ion-input>
          <ion-input
            mode="md"
            fill="outline"
            type="number"
            inputmode="decimal"
            min="-180"
            max="180"
            step="any"
            label-placement="floating"
            label=${this.t('ui.settings.longitude')}
            data-testid="attendance-settings-lng"
            .value=${this.lngText}
            @ionInput=${(e: Event) => (this.lngText = valueOf(e))}
          ></ion-input>
        </div>
        <div class="locate">
          <ion-button fill="outline" data-testid="attendance-use-my-location" ?disabled=${this.locating}
            @click=${() => this.useMyLocation()}>
            ${this.locating
              ? html`<ion-spinner slot="start" name="crescent"></ion-spinner>`
              : html`<ion-icon slot="start" name="locate-outline"></ion-icon>`}
            ${this.locating ? this.t('ui.settings.locating') : this.t('ui.settings.useMyLocation')}
          </ion-button>
          ${this.accuracy !== null
            ? html`<span class="help" data-testid="attendance-settings-accuracy">
                ${this.t('ui.settings.accuracy', { accuracy: this.accuracy })}
              </span>`
            : nothing}
        </div>
      </div>

      ${this.workplaceMissing
        ? html`<p class="warning" role="status" data-testid="attendance-settings-location-warning">
            <ion-icon name="warning-outline" aria-hidden="true"></ion-icon>${this.t('ui.settings.workplaceMissing')}
          </p>`
        : nothing}

      <div>
        <ion-input
          mode="md"
          fill="outline"
          type="number"
          inputmode="numeric"
          min=${String(AUTO_CLOSE_MIN)}
          max=${String(AUTO_CLOSE_MAX)}
          step="1"
          label-placement="floating"
          label=${this.t('ui.settings.autoClose')}
          data-testid="attendance-settings-auto-close"
          .value=${this.hoursText}
          @ionInput=${(e: Event) => (this.hoursText = valueOf(e))}
        ></ion-input>
        <p class="help">${this.t('ui.settings.autoCloseHelp')}</p>
      </div>

      ${this.notice
        ? html`<p
            class="msg ${this.notice.kind}"
            role=${this.notice.kind === 'error' ? 'alert' : 'status'}
            data-testid="attendance-settings-message"
          >${this.notice.text}</p>`
        : nothing}

      <div class="actions">
        <ion-button data-testid="attendance-settings-save" ?disabled=${this.saving} @click=${() => this.save()}>
          ${this.saving
            ? html`<ion-spinner slot="start" name="crescent"></ion-spinner>`
            : html`<ion-icon slot="start" name="save-outline"></ion-icon>`}
          ${this.saving ? this.t('ui.settings.saving') : this.t('ui.settings.save')}
        </ion-button>
      </div>
    </section>`;
  }
}

define('erp-attendance-settings', ErpAttendanceSettings);
