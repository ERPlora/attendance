#!/usr/bin/env python3
"""The working-day cycle of `attendance` against the REAL kernel.

`data.pg.test.py` proves the SQL on a scratch Postgres with the gate re-implemented in Python. This
battery proves the half only a real runtime can: that the manifest INSTALLS on a published hub,
that the runtime injects `:current_user_id`/`:now`/`:new_id` the way the SQL expects, that the
`expect_rows` gates (anchored and not) answer the declared domain codes through `POST /api/command`,
and that the queries come back through the list engine with the columns the screens read.

  1. clock in → `mine_open` has the day → start break → `mine_open` carries it → end break →
     clock out → `records.mine` lists ONE closed day with one break.
  2. A second clock-in while a day is open is refused with `attendance.clock_in_rejected`; with no
     open day, clock-out answers `attendance.no_open_record` and break end `attendance.no_open_break`.
  3. `settings.update` + `settings.get` round-trip, and with location required a personal device
     that did not measure is refused while the shared POS clocks in.
  4. `records.correct` with a reason rewrites the day and `corrections.list` shows the trail; a
     clock-out before the clock-in is refused with `attendance.record_not_found`.
  5. `presence.count` counts whoever is clocked in now.
  6. An EMPLOYEE (the permission set `role_permissions.employee` grants, sent as `X-Permissions`:
     dev auth cannot attach a role, see `hub_harness`) clocks its own day, but the kernel refuses
     it the team's data, the correction and the settings save — and a manager's set opens them.

Usage: `erplora test <dir> --against-hub [dev|stable|sha256:…]` (module-toolkit#110). Never on its
own: without a runtime it fails, it does not skip.
"""

from __future__ import annotations

import json
import pathlib
import sys

import hub_harness
from hub_harness import Hub, new_user

ROLES = json.loads(
    (pathlib.Path(__file__).resolve().parent.parent / "module.json").read_text()
)["role_permissions"]

LOCATION_OFF = {
    "require_location": 0,
    "geofence_radius_m": 100,
    "workplace_lat": None,
    "workplace_lng": None,
    "auto_close_after_hours": 12,
}


def test_full_working_day(hub: Hub) -> str:
    print("\n1 · clock in → break → clock out, as one fresh person")
    # Somebody else works a day first, so "only the caller's days" is a real claim and not the
    # accident of an empty hub.
    hub.as_user(new_user())
    hub.run("attendance.clock_in", {"source": "shared"})
    hub.run("attendance.clock_out", {})
    hub.as_user(new_user())
    hub.check("nobody is clocked in yet", hub.query("attendance.records.mine_open"), [])

    hub.run("attendance.clock_in", {"source": "shared"})
    open_day = hub.query("attendance.records.mine_open")
    hub.check("mine_open has the day", len(open_day), 1)
    day = open_day[0] if open_day else {}
    hub.check("…from the shared POS", day.get("source"), "shared")
    hub.check("…with no break running", day.get("open_break_id"), None)

    hub.run("attendance.break_start", {})
    running = (hub.query("attendance.records.mine_open") or [{}])[0]
    hub.check_true(
        "mine_open carries the running break",
        bool(running.get("open_break_id")),
        running,
    )

    hub.run("attendance.break_end", {})
    hub.check(
        "the break is no longer running",
        (hub.query("attendance.records.mine_open") or [{}])[0].get("open_break_id"),
        None,
    )

    hub.run("attendance.clock_out", {})
    hub.check(
        "nothing is open after clocking out",
        hub.query("attendance.records.mine_open"),
        [],
    )
    mine = hub.query("attendance.records.mine")
    hub.check("records.mine lists exactly one day", len(mine), 1)
    row = mine[0] if mine else {}
    hub.check("…closed", row.get("status"), "closed")
    hub.check("…with its break counted", row.get("break_count"), 1)
    hub.check_true("…and a local business date", bool(row.get("local_date")), row)
    hub.check(
        "records.mine only carries the caller's days",
        {r.get("user_id") for r in mine},
        {hub.user},
    )
    return row.get("id", "")


def test_refusals(hub: Hub) -> None:
    print("\n2 · the guards answer their domain codes")
    hub.as_user(new_user())
    hub.refused(
        "break end with no open day",
        "attendance.break_end",
        {},
        "attendance.no_open_break",
    )
    hub.refused(
        "break start with no open day",
        "attendance.break_start",
        {},
        "attendance.break_rejected",
    )
    hub.refused(
        "clock out with no open day",
        "attendance.clock_out",
        {},
        "attendance.no_open_record",
    )
    hub.run("attendance.clock_in", {"source": "shared"})
    hub.refused(
        "a second clock-in while a day is open",
        "attendance.clock_in",
        {"source": "shared"},
        "attendance.clock_in_rejected",
    )
    hub.check(
        "still exactly one open day", len(hub.query("attendance.records.mine_open")), 1
    )
    hub.run("attendance.clock_out", {})


def test_settings_and_geofence(hub: Hub) -> None:
    print("\n3 · settings round-trip, and the geofence blocks only personal devices")
    hub.as_user(new_user())
    location_on = {
        "require_location": 1,
        "geofence_radius_m": 250,
        "workplace_lat": 40.4168,
        "workplace_lng": -3.7038,
        "auto_close_after_hours": 10,
    }
    try:
        hub.run("attendance.settings.update", location_on)
        hub.check(
            "settings.get returns what was saved",
            hub.query("attendance.settings.get"),
            [location_on],
        )

        hub.refused(
            "a personal device that did not measure its position",
            "attendance.clock_in",
            {"source": "personal"},
            "attendance.clock_in_rejected",
        )
        hub.refused(
            "a personal device outside the radius",
            "attendance.clock_in",
            {
                "source": "personal",
                "lat": 40.45,
                "lng": -3.68,
                "accuracy_m": 9.5,
                "distance_m": 4100.2,
                "within_radius": 0,
            },
            "attendance.clock_in_rejected",
        )
        hub.run("attendance.clock_in", {"source": "shared"})
        hub.check(
            "the shared POS clocks in all the same",
            len(hub.query("attendance.records.mine_open")),
            1,
        )
        hub.run("attendance.clock_out", {})
    finally:
        # Batteries share one hub for the whole run: leave location OFF for whoever comes next.
        hub.run("attendance.settings.update", LOCATION_OFF)
    hub.check(
        "the second save updates the same row",
        hub.query("attendance.settings.get"),
        [LOCATION_OFF],
    )


def test_correction_trail(hub: Hub, record_id: str) -> None:
    print("\n4 · a correction rewrites the day and leaves its trail")
    hub.as_user(new_user())
    hub.refused(
        "a clock-out before the clock-in",
        "attendance.records.correct",
        {
            "record_id": record_id,
            "clock_in_at": "2026-10-06T09:00:00Z",
            "clock_out_at": "2026-10-06T08:00:00Z",
            "reason": "Wrong order",
        },
        "attendance.record_not_found",
    )
    # Every row the runtime writes holds `:now` in UTC (`…+00:00` with nanoseconds) and the list
    # engine sorts and filters clock_in_at as TEXT: a correction must be UTC too, so an offset value
    # is refused by the payload schema before any SQL runs.
    status, body = hub.command(
        "attendance.records.correct",
        {"record_id": record_id, "clock_in_at": "2026-10-06T10:00:00+02:00",
         "clock_out_at": "2026-10-06T18:00:00+02:00", "reason": "Local offset"},
    )
    hub.check("a correction with a +02:00 offset is refused by the schema (HTTP)", status, 422)
    hub.check(
        "the refused correction left no trail",
        hub.query("attendance.corrections.list", {"f_record_id": record_id}),
        [],
    )
    hub.run(
        "attendance.records.correct",
        {
            "record_id": record_id,
            "clock_in_at": "2026-10-06T08:00:00Z",
            "clock_out_at": "2026-10-06T16:30:00Z",
            "reason": "Forgot to clock out",
        },
    )
    day = (hub.query("attendance.records.get", {"record_id": record_id}) or [{}])[0]
    hub.check(
        "the day carries the corrected clock-in",
        day.get("clock_in_at"),
        "2026-10-06T08:00:00Z",
    )
    hub.check(
        "…and the corrected clock-out", day.get("clock_out_at"), "2026-10-06T16:30:00Z"
    )
    trail = hub.query("attendance.corrections.list", {"f_record_id": record_id})
    hub.check("one trail row", len(trail), 1)
    entry = trail[0] if trail else {}
    hub.check("…with the reason", entry.get("reason"), "Forgot to clock out")
    hub.check("…signed by who corrected", entry.get("created_by"), hub.user)
    hub.check(
        "…keeping the new clock-out",
        entry.get("new_clock_out_at"),
        "2026-10-06T16:30:00Z",
    )
    hub.check_true("…and the old one", bool(entry.get("old_clock_out_at")), entry)


def test_presence(hub: Hub) -> None:
    print("\n5 · presence.count counts whoever is clocked in now")
    hub.as_user(new_user())
    before = (hub.query("attendance.presence.count") or [{}])[0].get("value")
    hub.run("attendance.clock_in", {"source": "shared"})
    during = (hub.query("attendance.presence.count") or [{}])[0].get("value")
    hub.check("one more person clocked in", during, (before or 0) + 1)
    hub.run("attendance.clock_out", {})
    after = (hub.query("attendance.presence.count") or [{}])[0].get("value")
    hub.check("back to where it was after clocking out", after, before)


def test_employee_permissions(hub: Hub, record_id: str) -> None:
    print("\n6 · an employee clocks its own day and nothing of anybody else's")
    # The trail of the day corrected in 4, read with full permissions, to prove the refused
    # correction below wrote nothing.
    hub.as_user(new_user())
    trail_before = len(
        hub.query("attendance.corrections.list", {"f_record_id": record_id})
    )
    settings_before = hub.query("attendance.settings.get")

    hub.as_user(new_user(), permissions=ROLES["employee"])
    hub.run("attendance.clock_in", {"source": "shared"})
    hub.check("the employee sees its open day", len(hub.query("attendance.records.mine_open")), 1)
    hub.check_true("…reads the settings", isinstance(hub.query("attendance.settings.get"), list))
    hub.check("…and lists its own days", len(hub.query("attendance.records.mine")), 1)
    hub.run("attendance.break_start", {})
    hub.check("…and its own breaks", len(hub.query("attendance.breaks.mine")), 1)
    hub.run("attendance.break_end", {})

    for name, params in (
        ("attendance.records.list", {}),
        ("attendance.records.get", {"record_id": record_id}),
        ("attendance.breaks.list", {}),
        ("attendance.corrections.list", {"f_record_id": record_id}),
        ("attendance.presence.count", {}),
    ):
        hub.denied(f"employee reading `{name}`", "query", name, params, ("permission_denied",))
    elevable = ("requires_elevation", "permission_denied")
    hub.denied(
        "employee correcting a day",
        "command",
        "attendance.records.correct",
        {
            "record_id": record_id,
            "clock_in_at": "2026-10-06T06:00:00Z",
            "clock_out_at": "2026-10-06T07:00:00Z",
            "reason": "An employee rewriting a day",
        },
        elevable,
    )
    hub.denied(
        "employee saving the settings",
        "command",
        "attendance.settings.update",
        {**LOCATION_OFF, "auto_close_after_hours": 3},
        elevable,
    )
    hub.run("attendance.clock_out", {})

    hub.as_user(new_user(), permissions=ROLES["manager"])
    hub.check_true(
        "a manager's set reads the team", isinstance(hub.query("attendance.records.list"), list)
    )
    hub.check(
        "the refused correction left the trail as it was",
        len(hub.query("attendance.corrections.list", {"f_record_id": record_id})),
        trail_before,
    )
    hub.check(
        "the refused save left the settings as they were",
        hub.query("attendance.settings.get"),
        settings_before,
    )


def main() -> int:
    hub = Hub("clock_cycle.hub")
    print(
        f"Hub battery · attendance working-day cycle · {hub_harness.BASE} · hub {hub.hub_id}"
    )
    record_id = test_full_working_day(hub)
    test_refusals(hub)
    test_settings_and_geofence(hub)
    test_correction_trail(hub, record_id)
    test_presence(hub)
    test_employee_permissions(hub, record_id)
    return hub.finish(
        "the working-day cycle behaves as the spec promises, against the real kernel"
    )


if __name__ == "__main__":
    sys.exit(main())
