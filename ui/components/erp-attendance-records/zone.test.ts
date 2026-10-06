// Business time zone helpers of the records screen (spec §6, «Decisiones cerradas»): the month
// filter is the business calendar month, read in `erplora().timezone`, never the device's nor UTC.
import { describe, expect, it } from 'vitest';
import {
  fromLocalInput,
  localDate,
  localDateTime,
  localTime,
  monthOf,
  monthRange,
  recentMonths,
  toLocalInput,
} from './zone';

describe('monthRange', () => {
  it('turns a Madrid month into its UTC edges, across the October DST change', () => {
    // 1 Oct 00:00 CEST (+2) = 30 Sep 22:00 UTC · 1 Nov 00:00 CET (+1) = 31 Oct 23:00 UTC.
    expect(monthRange('2026-10', 'Europe/Madrid')).toEqual({
      from: '2026-09-30T22:00:00',
      to: '2026-10-31T23:00:00',
    });
  });

  it('is the plain calendar month in UTC', () => {
    expect(monthRange('2026-12', 'UTC')).toEqual({
      from: '2026-12-01T00:00:00',
      to: '2027-01-01T00:00:00',
    });
  });

  it('leaves the edges without a zone suffix so the text comparison keeps every stored instant', () => {
    // Stored instants look like `2026-10-31T22:59:59.5+00:00`: a bound with `Z` or millis would
    // compare its suffix character against the stored one and drop rows at the boundary second.
    const { from, to } = monthRange('2026-10', 'Europe/Madrid');
    expect('2026-09-30T22:00:00.000001+00:00' >= from).toBe(true);
    expect('2026-10-31T22:59:59.999+00:00' <= to).toBe(true);
    expect('2026-10-31T23:00:00.001+00:00' <= to).toBe(false);
    expect('2026-10-31T23:00:00Z' <= to).toBe(false);
  });
});

describe('monthOf / recentMonths', () => {
  it('a clock-in late on 30 Sep UTC already belongs to October in Madrid', () => {
    expect(monthOf(Date.parse('2026-09-30T22:30:00Z'), 'Europe/Madrid')).toBe('2026-10');
    expect(monthOf(Date.parse('2026-09-30T22:30:00Z'), 'UTC')).toBe('2026-09');
  });

  it('lists the most recent months first, crossing the year', () => {
    expect(recentMonths('2026-02', 4)).toEqual(['2026-02', '2026-01', '2025-12', '2025-11']);
  });
});

describe('local date and time of an instant', () => {
  it('reads the business calendar day, not the UTC one', () => {
    expect(localDate('2026-10-05T23:12:44Z', 'Europe/Madrid')).toBe('2026-10-06');
    expect(localTime('2026-10-05T23:12:44Z', 'Europe/Madrid')).toBe('01:12');
    expect(localDateTime('2026-10-05T07:02:41.123456+00:00', 'Europe/Madrid')).toBe('2026-10-05 09:02');
  });
});

describe('datetime-local inputs in the business zone', () => {
  it('prefills the input with the business wall-clock time', () => {
    expect(toLocalInput('2026-10-05T07:02:41Z', 'Europe/Madrid')).toBe('2026-10-05T09:02');
  });

  it('reads what the manager typed as business wall-clock time and returns UTC', () => {
    expect(fromLocalInput('2026-10-05T09:00', 'Europe/Madrid')).toBe('2026-10-05T07:00:00.000Z');
    // After the DST change Madrid is +1.
    expect(fromLocalInput('2026-11-02T09:00', 'Europe/Madrid')).toBe('2026-11-02T08:00:00.000Z');
    expect(fromLocalInput('2026-11-02T09:00', 'UTC')).toBe('2026-11-02T09:00:00.000Z');
  });

  it('refuses what is not a date and time', () => {
    expect(fromLocalInput('', 'Europe/Madrid')).toBeNull();
    expect(fromLocalInput('tomorrow', 'Europe/Madrid')).toBeNull();
  });
});
