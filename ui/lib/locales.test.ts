// Every visible string of the clock and settings screens lives in `locales/en.json` (source) with
// its `es` translation (ADR-0055/0199). This guard holds the two halves together for the blocks
// these screens own (`ui.clock`, `ui.settings`, `ui.common`): same keys in both languages, no empty
// text, and every key a screen asks for actually exists.
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** The module root: two levels above this file (`ui/lib/`). */
const ROOT = join(__dirname, '..', '..');
if (!existsSync(join(ROOT, 'module.json'))) throw new Error(`module.json not found in ${ROOT}`);
const BLOCKS = ['clock', 'settings', 'common'] as const;

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

describe('locales — ui.clock, ui.settings, ui.common', () => {
  it('carry the same keys in English and Spanish', () => {
    expect([...ES.keys()].sort()).toEqual([...EN.keys()].sort());
  });

  it('have no empty text in either language', () => {
    const empty = [...EN, ...ES].filter(([, v]) => !v.trim()).map(([k]) => k);
    expect(empty).toEqual([]);
  });

  it('cover every key the clock and settings screens ask for', () => {
    const screens = [
      ...sources(join(ROOT, 'ui', 'components', 'erp-attendance-clock')),
      ...sources(join(ROOT, 'ui', 'components', 'erp-attendance-settings')),
      ...sources(join(ROOT, 'ui', 'lib')),
    ];
    const used = new Set<string>();
    for (const file of screens) {
      for (const m of readFileSync(file, 'utf8').matchAll(/'(ui\.(?:clock|settings|common)\.[A-Za-z0-9_.]+)'/g)) {
        used.add(m[1]);
      }
    }
    const missing = [...used].filter((k) => !EN.has(k) || !ES.has(k)).sort();
    expect(missing).toEqual([]);
  });

  // `ui.common` is shared with the records screen, so only the two blocks these screens own alone
  // are held to «no dead key».
  it('carry no ui.clock / ui.settings key that no screen uses', () => {
    const text = [
      ...sources(join(ROOT, 'ui', 'components', 'erp-attendance-clock')),
      ...sources(join(ROOT, 'ui', 'components', 'erp-attendance-settings')),
      ...sources(join(ROOT, 'ui', 'lib')),
    ]
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    const dead = [...EN.keys()]
      .filter((k) => /^ui\.(clock|settings)\./.test(k))
      .filter((k) => !text.includes(`'${k}'`))
      .sort();
    expect(dead).toEqual([]);
  });
});
