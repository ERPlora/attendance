// CSV export of the records screen (spec §6): fixed header, one line per working day, the person
// by name, times in the business zone, worked time of an open day up to the export instant.
import { describe, expect, it } from 'vitest';
import { CSV_HEADER, csvFileName, toCsv } from './csv';

const NOW = Date.parse('2026-10-06T10:30:00Z');
const OPTS = { timezone: 'Europe/Madrid', now: NOW, breaks: [] };

const rows = [
  {
    id: 'rec-101',
    user_id: 'user-ana',
    clock_in_at: '2026-10-05T07:02:41Z',
    clock_out_at: '2026-10-05T15:05:03Z',
    status: 'closed',
    in_within_radius: 1,
    out_within_radius: 0,
    local_date: '2026-10-05',
    breaks_closed_minutes: 30,
  },
  {
    id: 'rec-104',
    user_id: 'user-gone',
    clock_in_at: '2026-10-06T08:00:00Z',
    clock_out_at: null,
    status: 'open',
    in_within_radius: null,
    out_within_radius: null,
    local_date: '2026-10-06',
    breaks_closed_minutes: 0,
  },
];

describe('toCsv', () => {
  it('starts with the header of the spec', () => {
    expect(CSV_HEADER).toBe(
      'date,user,clock_in,clock_out,break_minutes,worked_minutes,status,within_radius_in,within_radius_out',
    );
    expect(toCsv([], new Map(), OPTS)).toBe(`${CSV_HEADER}\r\n`);
  });

  it('writes one line per day: local date, name, local times, minutes, status and radius flags', () => {
    const users = new Map([['user-ana', 'Ana']]);
    const lines = toCsv(rows, users, OPTS).split('\r\n');
    expect(lines[1]).toBe('2026-10-05,Ana,2026-10-05 09:02,2026-10-05 17:05,30,452,closed,1,0');
    // Unknown person → the id; open day → empty clock-out, worked until the export instant.
    expect(lines[2]).toBe('2026-10-06,user-gone,2026-10-06 10:00,,0,150,open,,');
    expect(lines[3]).toBe('');
  });

  it('subtracts the running break of an open day', () => {
    const breaks = [{ id: 'b1', record_id: 'rec-104', started_at: '2026-10-06T10:00:00Z', ended_at: null }];
    const line = toCsv([rows[1]], new Map(), { ...OPTS, breaks }).split('\r\n')[1];
    expect(line).toBe('2026-10-06,user-gone,2026-10-06 10:00,,30,120,open,,');
  });

  it('a day flagged for review without clock-out leaves worked_minutes empty', () => {
    const line = toCsv([{ ...rows[1], status: 'needs_review' }], new Map(), OPTS).split('\r\n')[1];
    expect(line).toBe('2026-10-06,user-gone,2026-10-06 10:00,,0,,needs_review,,');
  });

  it('quotes commas and quotes, and neutralises spreadsheet formulas', () => {
    const users = new Map([
      ['user-ana', 'Pérez, Ana "La jefa"'],
      ['user-gone', '=HYPERLINK("x")'],
    ]);
    const lines = toCsv(rows, users, OPTS).split('\r\n');
    expect(lines[1].split(',2026-10-05 09:02')[0]).toBe('2026-10-05,"Pérez, Ana ""La jefa"""');
    expect(lines[2].split(',2026-10-06 10:00')[0]).toBe('2026-10-06,"\'=HYPERLINK(""x"")"');
  });
});

describe('csvFileName', () => {
  it('is attendance-YYYY-MM.csv', () => {
    expect(csvFileName('2026-10')).toBe('attendance-2026-10.csv');
  });
});
