// Turning a failed `erplora().command`/`query` into a sentence a person can act on.
//
// The SDK raises an error whose `code` is the stable refusal (`attendance.clock_in_rejected`). A
// code this module owns is spoken from `locales/<lang>.json → errors.<code>` (flat keys, ADR-0398);
// anything else keeps the sentence that arrived (the SDK already localizes platform failures), and
// an empty one falls back to the caller's generic text.

/** A module domain code: `<module>.<snake_case>` (ADR-0205). */
const DOMAIN_CODE = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;

export function errorCode(err: unknown): string | null {
  const code = (err as { code?: unknown } | null | undefined)?.code;
  if (typeof code === 'string' && code.trim()) return code.trim();
  const message = err instanceof Error ? err.message.trim() : '';
  return DOMAIN_CODE.test(message) ? message : null;
}

function catalogText(catalog: Record<string, unknown>, locale: string, code: string): string | null {
  for (const lang of [locale, locale.split('-')[0], 'en']) {
    const errors = (catalog[lang] as { errors?: Record<string, unknown> } | undefined)?.errors;
    const text = errors?.[code];
    if (typeof text === 'string' && text.trim()) return text;
  }
  return null;
}

export function errorMessage(
  catalog: Record<string, unknown>,
  locale: string,
  err: unknown,
  fallback: string,
): string {
  const code = errorCode(err);
  const own = code ? catalogText(catalog, locale, code) : null;
  if (own) return own;
  const arrived = err instanceof Error ? err.message.trim() : '';
  return arrived && arrived !== code ? arrived : fallback;
}
