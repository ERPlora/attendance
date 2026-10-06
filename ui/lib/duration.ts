// Time arithmetic and formatting of the time clock. Durations are computed in the UI from the
// timestamps the queries return (UTC RFC 3339); dates and wall-clock times are always read in the
// BUSINESS time zone (`erplora().timezone`), never the browser's.

const ms = (iso: string): number => Date.parse(iso);

/** Whole minutes from `isoA` to `isoB`; never negative, and 0 when either is unreadable. */
export function minutesBetween(isoA: string, isoB: string): number {
  const diff = ms(isoB) - ms(isoA);
  if (!Number.isFinite(diff) || diff <= 0) return 0;
  return Math.floor(diff / 60_000);
}

const whole = (n: number): number => (Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);
const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Minutes as `h:mm` (`510` → `8:30`). Negative or non-finite input reads as zero. */
export function formatHm(minutes: number): string {
  const m = whole(minutes);
  return `${Math.floor(m / 60)}:${pad2(m % 60)}`;
}

/** Seconds as `h:mm:ss`, for the running clock of an open working day. */
export function formatHms(seconds: number): string {
  const s = whole(seconds);
  return `${Math.floor(s / 3600)}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
}

function safeZone(timezone: string): string {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return timezone;
  } catch {
    return 'UTC';
  }
}

/** Calendar day (`YYYY-MM-DD`) of an instant in `timezone`; an unknown zone degrades to UTC. */
export function localDateOf(iso: string, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: safeZone(timezone),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(ms(iso)));
  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Wall-clock `HH:mm` of an instant in `timezone`, or `''` for a missing/unreadable timestamp. */
export function formatTime(iso: string | null | undefined, timezone: string, locale: string): string {
  if (!iso || !Number.isFinite(ms(iso))) return '';
  return new Intl.DateTimeFormat(locale, {
    timeZone: safeZone(timezone),
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(ms(iso)));
}

/** A calendar day `YYYY-MM-DD` as a short, localized date (`6 Oct`), read as a plain date. */
export function formatLocalDate(localDate: string, locale: string): string {
  const [y, m, d] = localDate.split('-').map(Number);
  if (!y || !m || !d) return localDate;
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
