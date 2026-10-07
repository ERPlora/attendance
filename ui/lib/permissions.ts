// What the session may do — for SHOWING or HIDING UI only. The runtime re-checks every query and
// command, so a wrong answer here hides a button or shows one the server will refuse; it never
// opens a door.
//
// The source is the shell's SDK, `erplora.hasPermission` (hub `packages/module-sdk`): it reads the
// permissions of the live session and already answers `*` for admin/owner. The session the shell
// stores in `localStorage['erplora.session']` is only the fallback for an SDK without it, and the
// admin/owner rule is kept on top of both so the two paths can never disagree about an admin.

export interface SessionLike {
  id?: string;
  name?: string;
  role?: unknown;
  permissions?: unknown;
}

export interface PermissionSource {
  hasPermission?: (permission: string) => boolean;
}

export function readSession(): SessionLike {
  try {
    return (JSON.parse(localStorage.getItem('erplora.session') ?? 'null') as SessionLike) ?? {};
  } catch {
    return {};
  }
}

const isAdminRole = (session: SessionLike): boolean => {
  const role = String(session.role ?? '').toLowerCase();
  return role === 'admin' || role === 'owner';
};

export function sessionCan(
  sdk: PermissionSource | undefined,
  session: SessionLike,
  permission: string,
): boolean {
  if (isAdminRole(session)) return true;
  if (typeof sdk?.hasPermission === 'function') {
    try {
      return sdk.hasPermission(permission) === true;
    } catch {
      return false;
    }
  }
  const perms = Array.isArray(session.permissions) ? (session.permissions as unknown[]) : [];
  return perms.includes('*') || perms.includes(permission);
}
