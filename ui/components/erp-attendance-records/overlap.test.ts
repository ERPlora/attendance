// attendance#12: a correction must not overlap another working day of the same person, or those
// minutes count twice in the record and the CSV. The server refuses it (its guard answers
// `attendance.record_not_found`); the screen checks first so the manager reads WHY. Same rule as
// the guard in `commands/record_correct_log.sql`.
import { describe, expect, it } from 'vitest';
import { overlapsOtherDay } from './overlap';

const NOW = Date.parse('2026-10-07T16:00:00Z');

const day = (id: string, user_id: string, clock_in_at: string, clock_out_at: string | null, status: string) => ({
  id,
  user_id,
  clock_in_at,
  clock_out_at,
  status,
});

// The PRE case of attendance#12: A 15:00:38 → 15:00:38.8 (runtime form), B needs_review 12:53.
const A = day('rec-a', 'u1', '2026-10-07T15:00:38.414864375+00:00', '2026-10-07T15:00:38.832254564+00:00', 'closed');
const B = day('rec-b', 'u1', '2026-10-07T12:53:56Z', null, 'needs_review');

describe('overlapsOtherDay (attendance#12)', () => {
  it('the PRE case: closing B at 15:30 runs over A of the same person', () => {
    expect(overlapsOtherDay([A, B], B, '2026-10-07T12:53:56.000Z', '2026-10-07T15:30:00.000Z', NOW)).toBe(true);
  });

  it('closing B before A starts is fine', () => {
    expect(overlapsOtherDay([A, B], B, '2026-10-07T12:53:56.000Z', '2026-10-07T14:00:00.000Z', NOW)).toBe(false);
  });

  it('touching is not overlapping: a day may start when the previous one ended', () => {
    const prev = day('rec-p', 'u1', '2026-10-07T08:00:00+00:00', '2026-10-07T09:00:00+00:00', 'closed');
    const next = day('rec-n', 'u1', '2026-10-07T10:00:00Z', '2026-10-07T11:00:00Z', 'closed');
    expect(overlapsOtherDay([prev, next], next, '2026-10-07T09:00:00.000Z', '2026-10-07T11:00:00.000Z', NOW)).toBe(false);
  });

  it('another person’s day never blocks, nor the corrected day itself', () => {
    const other = day('rec-o', 'u2', '2026-10-07T12:00:00Z', '2026-10-07T18:00:00Z', 'closed');
    expect(overlapsOtherDay([other, B], B, '2026-10-07T12:53:56.000Z', '2026-10-07T14:00:00.000Z', NOW)).toBe(false);
  });

  it('an OPEN day of the person runs up to now', () => {
    const open = day('rec-open', 'u1', '2026-10-07T15:10:00+00:00', null, 'open');
    expect(overlapsOtherDay([open, B], B, '2026-10-07T12:53:56.000Z', '2026-10-07T15:20:00.000Z', NOW)).toBe(true);
  });

  it('a needs_review day without clock-out is only its clock-in instant', () => {
    const later = day('rec-l', 'u1', '2026-10-07T13:30:00Z', '2026-10-07T14:00:00Z', 'closed');
    // B (needs_review, 12:53, no clock-out) is not stretched to now: moving `later` after it is fine…
    expect(overlapsOtherDay([B, later], later, '2026-10-07T13:00:00.000Z', '2026-10-07T14:00:00.000Z', NOW)).toBe(false);
    // …covering its clock-in is not.
    expect(overlapsOtherDay([B, later], later, '2026-10-07T12:00:00.000Z', '2026-10-07T14:00:00.000Z', NOW)).toBe(true);
  });

  it('reopening (no clock-out) runs the corrected day up to now, over a later day', () => {
    expect(overlapsOtherDay([A, B], B, '2026-10-07T12:53:56.000Z', null, NOW)).toBe(true);
  });
});
