// Worked time of a working day, computed in the screen (docs/concepts.md «Durations»).
//
// Closed breaks come summed by the server (`breaks_closed_minutes`, whole minutes); a running break
// has no end yet, so it is added here from the breaks query. Closed breaks in `breaks` are ignored
// on purpose: the server sum is the authority and counting them again would halve the day.

export interface RecordTimes {
  id: string;
  clock_in_at: string;
  clock_out_at?: string | null;
  status: string;
  breaks_closed_minutes?: number | null;
}

export interface BreakRow {
  id: string;
  record_id: string;
  started_at: string;
  ended_at?: string | null;
}

const MINUTE = 60_000;

/** End of the day for the arithmetic: the clock-out, or now while it is open. `null` otherwise. */
function dayEnd(record: RecordTimes, now: number): number | null {
  if (record.clock_out_at) return Date.parse(record.clock_out_at);
  return record.status === 'open' ? now : null;
}

/** Minutes of break of a day: the closed ones (server sum) plus the running one, until now. */
export function breakMinutes(record: RecordTimes, breaks: readonly BreakRow[], now: number): number {
  const closed = Number(record.breaks_closed_minutes ?? 0) || 0;
  const end = dayEnd(record, now) ?? now;
  let running = 0;
  for (const b of breaks) {
    if (b.record_id !== record.id || b.ended_at) continue;
    running += Math.max(0, Math.floor((end - Date.parse(b.started_at)) / MINUTE));
  }
  return closed + running;
}

/**
 * Worked minutes: (clock-out or now) − clock-in − breaks, never negative. `null` for a day flagged
 * for review without a clock-out: «until now» would count the days nobody worked, so it stays
 * blank until a manager corrects it.
 */
export function workedMinutes(record: RecordTimes, breaks: readonly BreakRow[], now: number): number | null {
  const end = dayEnd(record, now);
  if (end === null) return null;
  const gross = Math.floor((end - Date.parse(record.clock_in_at)) / MINUTE);
  return Math.max(0, gross - breakMinutes(record, breaks, now));
}

/** `452` → `7:32`. */
export function formatHm(minutes: number): string {
  const m = Math.max(0, Math.floor(minutes));
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
}

/**
 * Lower bound of the `started_at` filter that brings the running breaks of the open days in `rows`:
 * a break always starts after its day's clock-in, so the earliest open clock-in covers them all.
 * Chosen by INSTANT (stored values mix the runtime's `…+00:00` with nanoseconds and the `…Z` of a
 * correction), and written without suffix, floored to the second, so the server's text comparison
 * keeps every stored form of that second. `null` when no day is open.
 */
export function runningBreaksFrom(rows: readonly RecordTimes[]): string | null {
  let earliest = Infinity;
  for (const r of rows) {
    if (r.status !== 'open') continue;
    const ms = Date.parse(r.clock_in_at);
    if (Number.isFinite(ms) && ms < earliest) earliest = ms;
  }
  return Number.isFinite(earliest) ? new Date(earliest).toISOString().slice(0, 19) : null;
}
