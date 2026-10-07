// attendance#12: does a corrected working day overlap ANOTHER day of the same person? Same rule
// as the server guard (`commands/record_correct_log.sql`), which has the last word; this copy only
// lets the screen say why before sending.
//
//   * the corrected day runs from its new clock-in to its new clock-out, or to now when reopened;
//   * another day runs to its clock-out, to now while it is open, and is only its clock-in instant
//     when it is needs_review (its end is unknown);
//   * touching is not overlapping: a day may start at the very instant the previous one ended.
//
// Instants are compared as numbers, never as text: the clock writes `…+00:00` with nanoseconds and
// a correction writes `…Z`.

export interface DaySpan {
  id: string;
  user_id: string;
  clock_in_at: string;
  clock_out_at: string | null;
  status: string;
}

function endOf(d: DaySpan, now: number): number {
  if (d.clock_out_at) return Date.parse(d.clock_out_at);
  return d.status === 'open' ? now : Date.parse(d.clock_in_at);
}

/** True when `[clockIn, clockOut ?? now]` overlaps another day of `corrected.user_id` in `days`. */
export function overlapsOtherDay(
  days: readonly DaySpan[],
  corrected: Pick<DaySpan, 'id' | 'user_id'>,
  clockIn: string,
  clockOut: string | null,
  now: number,
): boolean {
  const start = Date.parse(clockIn);
  const end = clockOut ? Date.parse(clockOut) : now;
  return days.some(
    (d) =>
      d.user_id === corrected.user_id &&
      d.id !== corrected.id &&
      Date.parse(d.clock_in_at) < end &&
      endOf(d, now) > start,
  );
}
