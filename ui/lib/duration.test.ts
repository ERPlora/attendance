import { describe, expect, it } from 'vitest';
import { formatHm, formatHms, formatTime, localDateOf, minutesBetween } from './duration';

describe('minutesBetween', () => {
  it('counts whole minutes between two instants', () => {
    expect(minutesBetween('2026-10-06T07:00:00Z', '2026-10-06T15:30:00Z')).toBe(510);
  });

  it('drops the seconds that do not make a full minute', () => {
    expect(minutesBetween('2026-10-06T07:00:00Z', '2026-10-06T07:01:59Z')).toBe(1);
  });

  it('never answers a negative duration', () => {
    expect(minutesBetween('2026-10-06T08:00:00Z', '2026-10-06T07:00:00Z')).toBe(0);
  });

  it('answers 0 for an unreadable timestamp instead of NaN', () => {
    expect(minutesBetween('not a date', '2026-10-06T07:00:00Z')).toBe(0);
  });
});

describe('formatHm', () => {
  it('formats minutes as h:mm', () => {
    expect(formatHm(0)).toBe('0:00');
    expect(formatHm(5)).toBe('0:05');
    expect(formatHm(510)).toBe('8:30');
    expect(formatHm(1505)).toBe('25:05');
  });

  it('treats negative or non-finite input as zero', () => {
    expect(formatHm(-3)).toBe('0:00');
    expect(formatHm(Number.NaN)).toBe('0:00');
  });
});

describe('formatHms', () => {
  it('formats seconds as h:mm:ss for the running clock', () => {
    expect(formatHms(0)).toBe('0:00:00');
    expect(formatHms(3725)).toBe('1:02:05');
  });
});

describe('localDateOf', () => {
  it('reads the business calendar day in its time zone, not the UTC one', () => {
    // 23:30 UTC on the 5th is already the 6th in Madrid (UTC+2 in October).
    expect(localDateOf('2026-10-05T23:30:00Z', 'Europe/Madrid')).toBe('2026-10-06');
    expect(localDateOf('2026-10-05T23:30:00Z', 'UTC')).toBe('2026-10-05');
  });

  it('falls back to UTC for an unknown zone instead of throwing', () => {
    expect(localDateOf('2026-10-05T23:30:00Z', 'Not/AZone')).toBe('2026-10-05');
  });
});

describe('formatTime', () => {
  it('formats the wall-clock time of an instant in the business zone', () => {
    expect(formatTime('2026-10-06T06:58:12Z', 'Europe/Madrid', 'en-GB')).toBe('08:58');
  });

  it('answers an empty string for a missing timestamp', () => {
    expect(formatTime(null, 'Europe/Madrid', 'es')).toBe('');
  });
});
