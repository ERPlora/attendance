import { describe, expect, it } from 'vitest';
import { errorCode, errorMessage } from './errors';

const CATALOG = {
  en: { errors: { 'attendance.clock_in_rejected': 'Could not clock in.' } },
  es: { errors: { 'attendance.clock_in_rejected': 'No se ha podido fichar.' } },
};

function refusal(code: string, message = 'server sentence'): Error {
  return Object.assign(new Error(message), { code });
}

describe('errorCode', () => {
  it('reads the stable code the SDK puts on the error', () => {
    expect(errorCode(refusal('attendance.no_open_record'))).toBe('attendance.no_open_record');
  });

  it('reads a domain code carried as the bare message', () => {
    expect(errorCode(new Error('attendance.break_rejected'))).toBe('attendance.break_rejected');
  });

  it('answers null when there is no code', () => {
    expect(errorCode(new Error('Something broke'))).toBeNull();
    expect(errorCode('boom')).toBeNull();
  });
});

describe('errorMessage', () => {
  it('speaks a module code with the catalogue sentence of the active locale', () => {
    expect(errorMessage(CATALOG, 'es', refusal('attendance.clock_in_rejected'), 'fallback')).toBe(
      'No se ha podido fichar.',
    );
  });

  it('falls back to the English sentence for a locale the catalogue does not carry', () => {
    expect(errorMessage(CATALOG, 'fr', refusal('attendance.clock_in_rejected'), 'fallback')).toBe(
      'Could not clock in.',
    );
  });

  it('keeps the sentence that arrived for a code the module does not own', () => {
    expect(errorMessage(CATALOG, 'es', refusal('permission_denied', 'No tienes permiso.'), 'fallback')).toBe(
      'No tienes permiso.',
    );
  });

  it('uses the fallback when nothing readable arrived', () => {
    expect(errorMessage(CATALOG, 'es', refusal('weird.code', '  '), 'fallback')).toBe('fallback');
    expect(errorMessage(CATALOG, 'es', undefined, 'fallback')).toBe('fallback');
  });
});
