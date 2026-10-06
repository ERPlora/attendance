// Business time zone helpers of the records screen. Every date the manager sees or types is the
// wall-clock time of the BUSINESS (`erplora().timezone`, the IANA zone the runtime also hands the
// SQL as `:timezone`), never the device's: a manager checking the shop from abroad must see the
// same day the employee clocked in.

interface Parts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timezone: string): Intl.DateTimeFormat {
  let f = formatters.get(timezone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatters.set(timezone, f);
  }
  return f;
}

/** The wall-clock parts of an instant in `timezone`. */
function partsAt(ms: number, timezone: string): Parts {
  const out: Record<string, number> = {};
  for (const p of formatter(timezone).formatToParts(new Date(ms))) {
    if (p.type !== 'literal') out[p.type] = Number(p.value);
  }
  return {
    year: out.year,
    month: out.month,
    day: out.day,
    hour: out.hour === 24 ? 0 : out.hour,
    minute: out.minute,
    second: out.second,
  };
}

/** Offset of `timezone` from UTC at the instant `ms`, in milliseconds. */
function offsetAt(ms: number, timezone: string): number {
  const p = partsAt(ms, timezone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(ms / 1000) * 1000;
}

/** The instant whose wall-clock time in `timezone` is the given one. */
function wallToInstant(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezone: string,
): number {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const first = guess - offsetAt(guess, timezone);
  // Across a DST change the offset at the result can differ from the one at the guess.
  const second = guess - offsetAt(first, timezone);
  return second;
}

const pad = (n: number, width = 2): string => String(n).padStart(width, '0');

/** UTC `YYYY-MM-DDTHH:MM:SS`, deliberately WITHOUT a zone suffix (see {@link monthRange}). */
function utcBound(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(
    d.getUTCMinutes(),
  )}:${pad(d.getUTCSeconds())}`;
}

/**
 * The UTC edges of a business month (`YYYY-MM`) for the `clock_in_at` range filter.
 *
 * The list engine compares the TEXT column with `>= from` and `<= to`, and stored instants carry a
 * suffix (`…:59.5+00:00`, `…Z`). A bound without suffix sorts BEFORE any stored instant of the same
 * second, so `from` keeps the first second of the month and `to` (the first second of the NEXT
 * month) keeps the last one while dropping everything at or after the next month's start.
 */
export function monthRange(month: string, timezone: string): { from: string; to: string } {
  const [y, m] = month.split('-').map(Number);
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  return {
    from: utcBound(wallToInstant(y, m, 1, 0, 0, timezone)),
    to: utcBound(wallToInstant(nextY, nextM, 1, 0, 0, timezone)),
  };
}

/** The business month (`YYYY-MM`) of an instant. */
export function monthOf(ms: number, timezone: string): string {
  const p = partsAt(ms, timezone);
  return `${p.year}-${pad(p.month)}`;
}

/** `count` months ending at `month`, most recent first. */
export function recentMonths(month: string, count: number): string[] {
  const [y, m] = month.split('-').map(Number);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const total = y * 12 + (m - 1) - i;
    out.push(`${Math.floor(total / 12)}-${pad((total % 12) + 1)}`);
  }
  return out;
}

/** Business calendar day `YYYY-MM-DD` of an RFC 3339 instant. */
export function localDate(iso: string, timezone: string): string {
  const p = partsAt(Date.parse(iso), timezone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Business wall-clock time `HH:MM` of an RFC 3339 instant. */
export function localTime(iso: string, timezone: string): string {
  const p = partsAt(Date.parse(iso), timezone);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

/** Business `YYYY-MM-DD HH:MM` of an RFC 3339 instant (the CSV form). */
export function localDateTime(iso: string, timezone: string): string {
  return `${localDate(iso, timezone)} ${localTime(iso, timezone)}`;
}

/** The value of an `<input type="datetime-local">` showing an instant in the business zone. */
export function toLocalInput(iso: string, timezone: string): string {
  return `${localDate(iso, timezone)}T${localTime(iso, timezone)}`;
}

const LOCAL_INPUT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/;

/** What was typed in a `datetime-local` input, read as business time → RFC 3339 UTC, or `null`. */
export function fromLocalInput(value: string, timezone: string): string | null {
  const m = LOCAL_INPUT.exec(String(value ?? '').trim());
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  const ms = wallToInstant(y, mo, d, h, mi, timezone);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}
