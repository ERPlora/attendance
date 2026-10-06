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
