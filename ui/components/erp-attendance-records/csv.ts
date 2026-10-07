// CSV export of the working-day records (spec §6). Pure: the screen gathers every row of the
// filter and the running breaks, this turns them into text (RFC 4180, CRLF).
import { breakMinutes, workedMinutes } from './minutes';
import type { BreakRow, RecordTimes } from './minutes';
import { localDateTime } from './zone';

export const CSV_HEADER =
  'date,user,clock_in,clock_out,break_minutes,worked_minutes,status,within_radius_in,within_radius_out';

export interface CsvRecord extends RecordTimes {
  user_id: string;
  local_date: string;
  in_within_radius?: number | null;
  out_within_radius?: number | null;
}

export interface CsvOptions {
  /** Business IANA zone: the times are written as the business wall clock. */
  timezone: string;
  /** Export instant: an open day counts worked time until here. */
  now: number;
  /** Running breaks of the open days (closed ones come summed in each row). */
  breaks: readonly BreakRow[];
}

/** A cell, quoted when it needs it; text that a spreadsheet would run as a formula is defused. */
function cell(value: unknown): string {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) || s !== s.trim() ? `"${s.replace(/"/g, '""')}"` : s;
}

const flag = (v: number | null | undefined): string => (v === null || v === undefined ? '' : String(Number(v)));

/** The CSV text: header + one line per day, every line ended by CRLF. */
export function toCsv(rows: readonly CsvRecord[], users: ReadonlyMap<string, string>, opts: CsvOptions): string {
  const lines = [CSV_HEADER];
  for (const r of rows) {
    const worked = workedMinutes(r, opts.breaks, opts.now);
    lines.push(
      [
        cell(r.local_date),
        cell(users.get(r.user_id) || r.user_id),
        cell(localDateTime(r.clock_in_at, opts.timezone)),
        cell(r.clock_out_at ? localDateTime(r.clock_out_at, opts.timezone) : ''),
        cell(breakMinutes(r, opts.breaks, opts.now)),
        cell(worked === null ? '' : worked),
        cell(r.status),
        flag(r.in_within_radius),
        flag(r.out_within_radius),
      ].join(','),
    );
  }
  return `${lines.join('\r\n')}\r\n`;
}

/** `attendance-YYYY-MM.csv`. */
export function csvFileName(month: string): string {
  return `attendance-${month}.csv`;
}
