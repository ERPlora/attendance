// Worked time of a working day (spec §6): clock-out (or now, while open) minus clock-in minus
// breaks. Closed breaks come summed by the server (`breaks_closed_minutes`); the running break is
// added live from the breaks query.
import { describe, expect, it } from 'vitest';
import { breakMinutes, formatHm, workedMinutes } from './minutes';

const closed = {
  id: 'rec-101',
  clock_in_at: '2026-10-05T07:02:41Z',
  clock_out_at: '2026-10-05T15:05:03Z',
  status: 'closed',
  breaks_closed_minutes: 30,
};

const open = {
  id: 'rec-104',
  clock_in_at: '2026-10-06T08:00:00Z',
  clock_out_at: null,
  status: 'open',
  breaks_closed_minutes: 0,
};

const NOW = Date.parse('2026-10-06T10:30:00Z');

describe('workedMinutes', () => {
  it('a closed day is (out − in) − closed breaks, in whole minutes', () => {
    // 8 h 2 min 22 s = 482 whole minutes, minus 30 of break.
    expect(workedMinutes(closed, [], NOW)).toBe(452);
  });

  it('an open day counts until now', () => {
    expect(workedMinutes(open, [], NOW)).toBe(150);
  });

  it('the running break of the day is not worked time', () => {
    const breaks = [{ id: 'b1', record_id: 'rec-104', started_at: '2026-10-06T10:00:00Z', ended_at: null }];
    expect(workedMinutes(open, breaks, NOW)).toBe(120);
  });

  it('ignores breaks of other days and does not count closed breaks twice', () => {
    const breaks = [
      { id: 'b2', record_id: 'rec-999', started_at: '2026-10-06T09:00:00Z', ended_at: null },
      { id: 'b3', record_id: 'rec-101', started_at: '2026-10-05T11:00:00Z', ended_at: '2026-10-05T11:30:00Z' },
    ];
    expect(workedMinutes(closed, breaks, NOW)).toBe(452);
    expect(workedMinutes(open, breaks, NOW)).toBe(150);
  });

  it('a day flagged for review without a clock-out has no worked time until a manager corrects it', () => {
    expect(workedMinutes({ ...open, status: 'needs_review' }, [], NOW)).toBeNull();
  });

  it('never goes below zero', () => {
    expect(workedMinutes({ ...closed, breaks_closed_minutes: 9999 }, [], NOW)).toBe(0);
  });
});

describe('breakMinutes', () => {
  it('adds the running break, until now, to the closed ones', () => {
    const breaks = [{ id: 'b1', record_id: 'rec-104', started_at: '2026-10-06T10:00:00Z', ended_at: null }];
    expect(breakMinutes({ ...open, breaks_closed_minutes: 15 }, breaks, NOW)).toBe(45);
  });

  it('a break left running in a closed day stops at the clock-out', () => {
    const breaks = [{ id: 'b1', record_id: 'rec-101', started_at: '2026-10-05T14:50:00Z', ended_at: null }];
    expect(breakMinutes(closed, breaks, NOW)).toBe(30 + 15);
  });

  it('reads a missing sum as zero', () => {
    expect(breakMinutes({ ...open, breaks_closed_minutes: null }, [], NOW)).toBe(0);
  });
});

describe('formatHm', () => {
  it('prints hours and two-digit minutes', () => {
    expect(formatHm(452)).toBe('7:32');
    expect(formatHm(0)).toBe('0:00');
    expect(formatHm(605)).toBe('10:05');
  });
});
