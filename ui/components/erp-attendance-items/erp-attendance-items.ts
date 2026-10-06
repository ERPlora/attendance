import { LitElement, html, css, nothing } from 'lit';
import { state } from 'lit/decorators.js';
// 'define' through its light subpath (does not pull the ok-* barrel). 'ok-data-table' registers itself.
import { define } from '@erplora/outfitkit/define';
import '@erplora/outfitkit/ok-data-table';
import type { DataTableColumn } from '@erplora/outfitkit';
import { createListController } from '@erplora/module-sdk';
import type { ListController, ListClient, ListParams, ListPage } from '@erplora/module-sdk';
// The module's i18n catalogue (ADR-0055): esbuild inlines these JSON files into the bundle. Every
// visible string goes through `erplora().t(CATALOG, 'ui.key')` (active language, fallback en → key).
import esLocale from '../../../locales/es.json';
import enLocale from '../../../locales/en.json';

const CATALOG: Record<string, unknown> = { es: esLocale, en: enLocale };

// Web Component of the 'attendance' module (Lit). A mini-app: it never touches the database, it calls the
// SDK (erplora.query/queryPage/command/on). The client lives in globalThis.erplora (the Hub shell
// injects it; under 'erplora dev' a mock client backed by the fixtures does).

interface ErploraClientLike extends ListClient {
  query<T = unknown>(name: string, params?: Record<string, unknown>): Promise<T>;
  queryPage<R = unknown>(name: string, params: ListParams): Promise<ListPage<R>>;
  command<T = unknown>(name: string, payload?: Record<string, unknown>): Promise<T>;
  on(event: string, cb: (payload: unknown) => void): () => void;
  /** Module i18n (ADR-0055): active language + translation from the catalogue. */
  locale: string;
  t(catalog: Record<string, unknown>, key: string, params?: Record<string, unknown>): string;
}

interface Item {
  id: string;
  name: string;
  code: string;
  amount: number;
}

function erplora(): ErploraClientLike {
  const c = (globalThis as { erplora?: ErploraClientLike }).erplora;
  if (!c) throw new Error('erplora SDK not initialised by the shell');
  return c;
}

const t = (key: string): string => erplora().t(CATALOG, key);

export class ErpAttendanceItems extends LitElement {
  static styles = css`
    :host { display:flex; flex-direction:column; height:100%; min-height:0; font-family: system-ui, sans-serif; color: var(--ion-text-color, #1c1b18); }
    ok-data-table { flex:1 1 auto; min-height:0; }
    /* The create form lives in the table's side panel (narrow): the fields go STACKED. */
    .form { display:flex; flex-direction:column; gap:.7rem; }
    .form ion-button { align-self:flex-end; }
    .err { color:var(--ion-color-danger, #c5000f); font-weight:600; margin:0; }
  `;

  @state() private newName = '';
  @state() private newCode = '';
  @state() private saving = false;
  @state() private formError = '';

  private ctrl!: ListController<Item>;

  // A getter, not a field: the headers follow the active language on every render (ADR-0055).
  private get columns(): DataTableColumn[] {
    return [
      { key: 'name', header: t('ui.colName'), sortable: true, filterable: true, filterType: 'text' },
      { key: 'code', header: t('ui.colCode'), sortable: true, filterable: true, filterType: 'text' },
      {
        key: 'amount',
        header: t('ui.colAmount'),
        align: 'right',
        sortable: true,
        filterable: true,
        filterType: 'range',
        format: (r) => Number(r.amount).toFixed(2),
      },
    ];
  }

  private readonly onLocaleChange = (): void => this.requestUpdate();

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('erplora:locale-changed', this.onLocaleChange);
  }

  disconnectedCallback(): void {
    window.removeEventListener('erplora:locale-changed', this.onLocaleChange);
    super.disconnectedCallback();
  }

  async firstUpdated(): Promise<void> {
    this.ctrl = createListController<Item>(
      erplora(),
      'attendance.items.list',
      () => this.requestUpdate(),
      { pageSize: 50, sort: 'name', dir: 'asc' },
    );
    await this.ctrl.load();
  }

  private dataTable(): { close(): void } | null {
    return this.renderRoot.querySelector('ok-data-table') as { close(): void } | null;
  }

  private async create(ev: Event): Promise<void> {
    ev.preventDefault();
    if (!this.newName.trim()) return;
    this.saving = true;
    this.formError = '';
    try {
      await erplora().command('attendance.items.create', {
        name: this.newName.trim(),
        code: this.newCode.trim(),
        amount: 0,
      });
      this.newName = '';
      this.newCode = '';
      this.dataTable()?.close(); // the create panel closes itself once the row exists
      await this.ctrl.load();
    } catch (e) {
      // Never the server text on screen: it can carry driver internals («db: sqlx: …», pricing#29).
      // Map the stable error codes of your commands to their own keys when you add them.
      console.error('attendance.items.create failed', e);
      this.formError = t('ui.createFailed');
    } finally {
      this.saving = false;
    }
  }

  // The view title is painted by the shell's top bar (from locales → navigation): not repeated here.
  // The toolbar «+ Add» of ok-data-table opens the create panel; its form sends with «Save».
  render() {
    return html`
      <!-- ctrl.error is the raw server text (driver internals, pricing#29): show the catalogue message. -->
      ${this.ctrl?.error ? html`<p class="err" role="alert">${t('ui.loadFailed')}</p>` : nothing}
      <ok-data-table
        .serverSide=${true}
        .fill=${true}
        .addable=${true}
        .columns=${this.columns}
        .rows=${this.ctrl?.rows ?? []}
        .total=${this.ctrl?.total ?? 0}
        .page=${this.ctrl?.state.page ?? 0}
        .pageSize=${this.ctrl?.state.pageSize ?? 50}
        .sort=${this.ctrl?.state.sort}
        .sortDir=${this.ctrl?.state.dir ?? 'asc'}
        .searchable=${true}
        .searchPlaceholder=${t('ui.searchPlaceholder')}
        .emptyMessage=${this.ctrl?.loading ? t('ui.loading') : t('ui.empty')}
        @pageChange=${(e: CustomEvent<number>) => this.ctrl.setPage(e.detail)}
        @pageSizeChange=${(e: CustomEvent<number>) => this.ctrl.setPageSize(e.detail)}
        @sortChange=${(e: CustomEvent<{ sort: string; dir: 'asc' | 'desc' }>) =>
          this.ctrl.setSort(e.detail.sort, e.detail.dir)}
        @searchChange=${(e: CustomEvent<string>) => this.ctrl.setSearch(e.detail)}
        @filterChange=${(e: CustomEvent<{ col: string; value: unknown }>) =>
          this.ctrl.setFilter(e.detail.col, e.detail.value)}
      >
        <!-- Projected ALWAYS (even with the panel closed): otherwise «+» would open an empty panel. -->
        <form slot="create" class="form" @submit=${(e: Event) => this.create(e)}>
          <ion-input mode="md" fill="outline" label-placement="floating" label=${t('ui.colName')}
            .value=${this.newName}
            @ionInput=${(e: Event) => (this.newName = String((e.target as HTMLInputElement).value ?? ''))}></ion-input>
          <ion-input mode="md" fill="outline" label-placement="floating" label=${t('ui.colCode')}
            .value=${this.newCode}
            @ionInput=${(e: Event) => (this.newCode = String((e.target as HTMLInputElement).value ?? ''))}></ion-input>
          ${this.formError ? html`<p class="err" role="alert">${this.formError}</p>` : nothing}
          <ion-button type="submit" ?disabled=${this.saving || !this.newName.trim()}>${this.saving ? t('ui.saving') : t('ui.save')}</ion-button>
        </form>
      </ok-data-table>
    `;
  }
}

define('erp-attendance-items', ErpAttendanceItems);
