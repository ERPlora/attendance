#!/usr/bin/env python3
"""Permissions contract test for `attendance` — who may do what, pinned to spec §2, §3 and §4.

Why a separate file: `manifest.contract.test.py` proves every permission a query or command names
is DECLARED; it does not prove it is the RIGHT one. Swapping `attendance.records.list` from
`attendance.view_all` to `attendance.clock` is a perfectly valid manifest that lets every employee
read the whole team's working days — the kind of edit that passes every other check. This file is
the one that turns it red.

Three things are pinned, exactly (not "contains"):

  1. `role_permissions`: an employee clocks and nothing else, a manager holds the four module
     permissions, an admin holds `*`.
  2. The permission of every query the spec lists.
  3. The permission of every command the spec lists.

Nothing more, nothing less: a query or command the spec does not list is a failure too, so a new
door has to be decided here before it ships.

Usage: tests/permissions.contract.test.py   (exit 0 = green)
"""

from __future__ import annotations

import json
import pathlib
import sys

MODULE_DIR = pathlib.Path(__file__).resolve().parent.parent
MANIFEST = MODULE_DIR / "module.json"

CLOCK = "attendance.clock"
VIEW_ALL = "attendance.view_all"
CORRECT = "attendance.correct"
MANAGE_SETTINGS = "attendance.manage_settings"

# Spec §2.
ROLE_PERMISSIONS = {
    "admin": ["*"],
    "manager": [CLOCK, VIEW_ALL, CORRECT, MANAGE_SETTINGS],
    "employee": [CLOCK],
}

# Spec §3: own data and the settings read need only `clock`; anybody else's data needs `view_all`.
QUERY_PERMISSIONS = {
    "attendance.settings.get": CLOCK,
    "attendance.records.mine_open": CLOCK,
    "attendance.records.mine": CLOCK,
    "attendance.breaks.mine": CLOCK,
    "attendance.records.list": VIEW_ALL,
    "attendance.records.get": VIEW_ALL,
    "attendance.breaks.list": VIEW_ALL,
    "attendance.corrections.list": VIEW_ALL,
    "attendance.presence.count": VIEW_ALL,
}

# Spec §4.
COMMAND_PERMISSIONS = {
    "attendance.clock_in": CLOCK,
    "attendance.clock_out": CLOCK,
    "attendance.break_start": CLOCK,
    "attendance.break_end": CLOCK,
    "attendance._auto_review_stale": CLOCK,
    "attendance.records.correct": CORRECT,
    "attendance.settings.update": MANAGE_SETTINGS,
}

failures: list[str] = []


def check(condition: bool, message: str) -> None:
    if not condition:
        failures.append(message)


manifest = json.loads(MANIFEST.read_text())

# 1. Roles.
roles = manifest.get("role_permissions") or {}
check(
    sorted(roles) == sorted(ROLE_PERMISSIONS),
    f"role_permissions must declare exactly {sorted(ROLE_PERMISSIONS)}, got {sorted(roles)}",
)
for role, want in ROLE_PERMISSIONS.items():
    got = roles.get(role)
    check(
        isinstance(got, list) and sorted(got) == sorted(want) and len(got) == len(set(got)),
        f"role_permissions.{role} must be exactly {want}, got {got}",
    )

check(
    sorted(manifest.get("permissions") or []) == sorted([CLOCK, VIEW_ALL, CORRECT, MANAGE_SETTINGS]),
    f"permissions must be exactly the four of spec §2, got {manifest.get('permissions')}",
)


# 2 and 3. Queries and commands.
def pin(kind: str, declared: dict, want: dict) -> None:
    check(
        sorted(declared) == sorted(want),
        f"{kind}: the manifest declares {sorted(set(declared) - set(want))} beyond the spec and "
        f"misses {sorted(set(want) - set(declared))} — decide the permission here first",
    )
    for name, permission in want.items():
        got = (declared.get(name) or {}).get("permission")
        check(
            got == permission,
            f"{kind} `{name}` must require `{permission}` (spec), got `{got}`",
        )


pin("query", manifest.get("queries") or {}, QUERY_PERMISSIONS)
pin("command", manifest.get("commands") or {}, COMMAND_PERMISSIONS)

if failures:
    print(f"✗ {len(failures)} permission contract failure(s):", file=sys.stderr)
    for f in failures:
        print(f"  - {f}", file=sys.stderr)
    sys.exit(1)

print(
    "✓ attendance permissions: an employee only clocks, a manager holds the four, an admin `*`, "
    f"and the {len(QUERY_PERMISSIONS)} queries and {len(COMMAND_PERMISSIONS)} commands each require "
    "exactly the permission the spec gives them"
)
