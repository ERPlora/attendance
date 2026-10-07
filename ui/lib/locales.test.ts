// Every visible string of the three screens lives in `locales/en.json` (source) with its `es`
// translation (ADR-0055/0199). This guard holds the two halves together for the blocks the screens
// own (`ui.clock`, `ui.records`, `ui.settings`, `ui.common`): same keys in both languages, no empty
// text, every key a screen asks for actually exists, and no key is left behind that nobody uses.
//
// The records screen builds ONE family of keys at run time — `ui.records.status.${status}` — so
// those are checked against the closed set of statuses instead of being searched for literally.
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** The module root: two levels above this file (`ui/lib/`). */
const ROOT = join(__dirname, '..', '..');
if (!existsSync(join(ROOT, 'module.json'))) throw new Error(`module.json not found in ${ROOT}`);
const BLOCKS = ['clock', 'records', 'settings', 'common'] as const;
/** The `status` column of `attendance_record` (spec §1): the only run-time-built keys. */
const STATUSES = ['open', 'closed', 'needs_review'];
const DYNAMIC_STATUS = 'ui.records.status.';

type Dict = { [k: string]: string | Dict };
const load = (lang: string): Dict => JSON.parse(readFileSync(join(ROOT, 'locales', `${lang}.json`), 'utf8'));

function flatten(d: Dict, prefix: string, out: Map<string, string> = new Map()): Map<string, string> {
  for (const [k, v] of Object.entries(d)) {
    const key = `${prefix}.${k}`;
    if (typeof v === 'string') out.set(key, v);
    else flatten(v, key, out);
  }
  return out;
}

const en = load('en');
const es = load('es');
const keysOf = (d: Dict): Map<string, string> => {
  const out = new Map<string, string>();
  for (const b of BLOCKS) flatten(((d.ui as Dict)?.[b] as Dict) ?? {}, `ui.${b}`, out);
  return out;
};
const EN = keysOf(en);
const ES = keysOf(es);

function sources(dir: string, found: string[] = []): string[] {
  if (!existsSync(dir)) return found;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) sources(full, found);
    else if (full.endsWith('.ts') && !full.endsWith('.test.ts')) found.push(full);
  }
  return found;
}

const SCREENS = [
  ...sources(join(ROOT, 'ui', 'components', 'erp-attendance-clock')),
  ...sources(join(ROOT, 'ui', 'components', 'erp-attendance-records')),
  ...sources(join(ROOT, 'ui', 'components', 'erp-attendance-settings')),
  ...sources(join(ROOT, 'ui', 'lib')),
];
const TEXT = SCREENS.map((file) => readFileSync(file, 'utf8')).join('\n');

describe('locales — ui.clock, ui.records, ui.settings, ui.common', () => {
  it('carry the same keys in English and Spanish', () => {
    expect([...ES.keys()].sort()).toEqual([...EN.keys()].sort());
  });

  it('have no empty text in either language', () => {
    const empty = [...EN, ...ES].filter(([, v]) => !v.trim()).map(([k]) => k);
    expect(empty).toEqual([]);
  });

  it('cover every key the screens ask for', () => {
    const used = new Set<string>();
    for (const m of TEXT.matchAll(/'(ui\.(?:clock|records|settings|common)\.[A-Za-z0-9_.]+)'/g)) used.add(m[1]);
    const missing = [...used].filter((k) => !EN.has(k) || !ES.has(k)).sort();
    expect(missing).toEqual([]);
  });

  it('translate every status the records screen builds a key for', () => {
    expect(TEXT).toContain('`ui.records.status.${');
    const want = STATUSES.map((s) => `${DYNAMIC_STATUS}${s}`).sort();
    expect([...EN.keys()].filter((k) => k.startsWith(DYNAMIC_STATUS)).sort()).toEqual(want);
    expect([...ES.keys()].filter((k) => k.startsWith(DYNAMIC_STATUS)).sort()).toEqual(want);
  });

  // `ui.common` is shared, so only the blocks one screen owns are held to «no dead key».
  it('carry no ui.clock / ui.records / ui.settings key that no screen uses', () => {
    const dead = [...EN.keys()]
      .filter((k) => /^ui\.(clock|records|settings)\./.test(k))
      .filter((k) => !k.startsWith(DYNAMIC_STATUS))
      .filter((k) => !TEXT.includes(`'${k}'`))
      .sort();
    expect(dead).toEqual([]);
  });
});
