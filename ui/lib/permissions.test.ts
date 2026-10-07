// What the session may do, for SHOWING or HIDING UI only (the runtime re-checks every call). The
// shell's SDK answers it (`erplora.hasPermission`, which already grants admin/owner `*`); the
// session stored by the shell is the fallback for a hub whose SDK does not expose it.
import { describe, expect, it } from 'vitest';
import { sessionCan } from './permissions';

const sdk = (granted: string[]) => ({
  hasPermission: (p: string) => granted.includes('*') || granted.includes(p),
});

describe('sessionCan', () => {
  it('asks the SDK when it exposes hasPermission', () => {
    expect(sessionCan(sdk(['attendance.manage_settings']), {}, 'attendance.manage_settings')).toBe(true);
    expect(sessionCan(sdk(['attendance.clock']), {}, 'attendance.manage_settings')).toBe(false);
  });

  it('the SDK wins over a stale stored session that lists the permission', () => {
    const stale = { role: 'employee', permissions: ['attendance.view_all'] };
    expect(sessionCan(sdk(['attendance.clock']), stale, 'attendance.view_all')).toBe(false);
  });

  it('admin and owner hold every permission, whatever the SDK answers', () => {
    expect(sessionCan(sdk([]), { role: 'Admin' }, 'attendance.correct')).toBe(true);
    expect(sessionCan(sdk([]), { role: 'owner' }, 'attendance.correct')).toBe(true);
  });

  it('without hasPermission it falls back to the stored session (wildcard included)', () => {
    expect(sessionCan({}, { role: 'manager', permissions: ['attendance.correct'] }, 'attendance.correct')).toBe(true);
    expect(sessionCan({}, { role: 'employee', permissions: ['*'] }, 'attendance.correct')).toBe(true);
    expect(sessionCan({}, { role: 'employee', permissions: ['attendance.clock'] }, 'attendance.correct')).toBe(false);
    expect(sessionCan(undefined, {}, 'attendance.clock')).toBe(false);
  });

  it('a throwing SDK reads as «no», never as «yes»', () => {
    const broken = { hasPermission: () => { throw new Error('no session'); } };
    expect(sessionCan(broken, { role: 'employee', permissions: ['attendance.correct'] }, 'attendance.correct')).toBe(false);
  });
});
