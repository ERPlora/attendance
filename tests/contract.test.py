#!/usr/bin/env python3
"""Contract test for `attendance` — the business rules a later edit could undo without anything
else complaining.

Each one is a decision taken against the market (Odoo, Square, Toast, Factorial, Fresha…) and the
Spanish law (art. 34.9 ET, RDL 8/2019: record the start and end of every working day, keep it four
years, make it available to the worker and to the Labour Inspectorate):

  1. ONE OPEN WORKING DAY PER PERSON, enforced by the DATABASE. A partial unique index over
     `(hub_id, user_id) WHERE status = 'open' AND is_deleted = 0`. The `NOT EXISTS` guard of
     `clock_in` is the polite answer; the index is what still holds when two taps race.
  2. NOTHING IS EVER DELETED. There is no delete command and no SQL that deletes or soft-deletes a
     record or a correction: a time record that can vanish is not a legal record.
  3. A CORRECTION KEEPS ITS TRAIL. `attendance_correction` stores the old values, the new values
     and a mandatory reason (min 3 characters in the schema) — the "rastro" the pending Royal
     Decree asks for, and what an inspector reads.
  4. THE DEVICE SOURCE IS A CLOSED ENUM. `source` is `shared` (the counter POS) or `personal`
     (the worker's own phone or laptop). The geofence only ever blocks `personal`.
  5. LOCATION IS OFF BY DEFAULT. `require_location` defaults to 0 in the table AND in the settings
     schema (Square, Fresha, Factorial): a freshly installed hub clocks in without asking for GPS.
  6. `clock_in`'s guard answers `attendance.clock_in_rejected`, and `records.correct`'s guard is
     anchored on the statement that writes the trail — so a correction can never be applied
     without its trail row.
  7. The «Clocked in now» widget refreshes on every event that changes how many days are open and
     the module emits: clock in, clock out and a correction — and listens to no event nobody sends.
  8. THE SCHEDULED REVIEW EMITS NOTHING (attendance#13), and carries no row gate. See the case.

Usage: tests/contract.test.py   (exit 0 = green)
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

MODULE_DIR = pathlib.Path(__file__).resolve().parent.parent
MANIFEST = MODULE_DIR / "module.json"
MIGRATION = MODULE_DIR / "migrations" / "postgres" / "001_init.sql"

failures: list[str] = []


def check(condition: bool, message: str) -> None:
    if not condition:
        failures.append(message)


manifest = json.loads(MANIFEST.read_text())
sql = MIGRATION.read_text() if MIGRATION.exists() else ""
commands = manifest.get("commands") or {}


def table_body(name: str) -> str:
    """The text between `CREATE TABLE IF NOT EXISTS name (` and its closing `);`, or ''."""
    m = re.search(rf"CREATE TABLE IF NOT EXISTS {name}\s*\((.*?)\n\);", sql, re.S)
    return m.group(1) if m else ""


def read_json(rel: str | None) -> dict:
    if not rel or not (MODULE_DIR / rel).exists():
        return {}
    return json.loads((MODULE_DIR / rel).read_text())


def sql_files_of(spec: dict) -> list[str]:
    paths = spec.get("sql")
    return [paths] if isinstance(paths, str) else list(paths or [])


# --- 1 · one open working day per person, held by the database -----------------------------
record = table_body("attendance_record")
check(bool(record), "attendance_record does not exist in 001_init.sql")
for column in ("user_id", "clock_in_at", "clock_out_at", "status", "source"):
    check(
        re.search(rf"\b{column}\b", record) is not None,
        f"attendance_record must declare `{column}`",
    )
unique_open = re.search(
    r"CREATE UNIQUE INDEX IF NOT EXISTS \w+\s+ON attendance_record\s*\(\s*hub_id\s*,\s*user_id\s*\)"
    r"\s*WHERE\s+status\s*=\s*'open'\s+AND\s+is_deleted\s*=\s*0",
    sql,
)
check(
    unique_open is not None,
    "001_init.sql must carry the partial UNIQUE index on attendance_record(hub_id, user_id) "
    "WHERE status = 'open' AND is_deleted = 0 — the NOT EXISTS guard alone loses a double tap race",
)

# --- 2 · nothing is ever deleted ------------------------------------------------------------
for name in commands:
    check(
        "delete" not in name and "remove" not in name,
        f"`{name}` looks like a delete command: a time record must never be deletable",
    )
for name, spec in commands.items():
    for rel in sql_files_of(spec):
        path = MODULE_DIR / rel
        body = path.read_text() if path.exists() else ""
        code = "\n".join(l for l in body.splitlines() if not l.strip().startswith("--"))
        check(
            not re.search(r"\bDELETE\s+FROM\b", code, re.I),
            f"{name} ({rel}) deletes rows — attendance records and corrections are never deleted",
        )
        check(
            not re.search(r"\bis_deleted\s*=\s*1\b", code),
            f"{name} ({rel}) soft-deletes rows — attendance records and corrections are never deleted",
        )

# --- 3 · a correction keeps its trail -------------------------------------------------------
correction = table_body("attendance_correction")
check(bool(correction), "attendance_correction does not exist in 001_init.sql")
for column in (
    "record_id",
    "old_clock_in_at",
    "old_clock_out_at",
    "old_status",
    "new_clock_in_at",
    "new_clock_out_at",
    "new_status",
    "reason",
):
    check(
        re.search(rf"\b{column}\b", correction) is not None,
        f"attendance_correction must store `{column}` (old + new + reason is the trail)",
    )
check(
    re.search(r"\breason\s+TEXT\s+NOT\s+NULL", correction) is not None,
    "attendance_correction.reason must be NOT NULL: a correction without a reason is not a trail",
)

correct = commands.get("attendance.records.correct") or {}
check(bool(correct), "attendance.records.correct is missing")
correct_schema = read_json(correct.get("schema"))
reason = (correct_schema.get("properties") or {}).get("reason") or {}
check(
    "reason" in (correct_schema.get("required") or []),
    "records.correct must REQUIRE `reason`",
)
check(reason.get("minLength") == 3, "records.correct `reason` must have minLength 3")
check(
    correct_schema.get("additionalProperties") is False,
    "records.correct schema must be closed (additionalProperties: false)",
)
gate = correct.get("expect_rows") or {}
check(
    gate.get("error") == "attendance.record_not_found",
    "records.correct must answer `attendance.record_not_found` when nothing was corrected",
)
check(
    gate.get("statement") == "commands/record_correct_log.sql",
    "records.correct's guard must be ANCHORED on the trail INSERT (commands/record_correct_log.sql): "
    "without the anchor, the UPDATE alone could satisfy it and a correction would land with no trail",
)
check(
    (correct.get("sql") or [None])[0] == "commands/record_correct_log.sql",
    "the trail INSERT must run FIRST, while the record still holds the OLD values it copies",
)

# --- 4 · the device source is a closed enum -------------------------------------------------
clock_in = commands.get("attendance.clock_in") or {}
clock_in_schema = read_json(clock_in.get("schema"))
source = (clock_in_schema.get("properties") or {}).get("source") or {}
check(
    sorted(source.get("enum") or []) == ["personal", "shared"],
    f"clock_in `source` must be the enum [shared, personal], got {source.get('enum')}",
)
check(
    "source" in (clock_in_schema.get("required") or []),
    "clock_in must REQUIRE `source`",
)
check(
    clock_in_schema.get("additionalProperties") is False,
    "clock_in schema must be closed (additionalProperties: false)",
)

# --- 5 · location is off by default ---------------------------------------------------------
settings = table_body("attendance_settings")
check(bool(settings), "attendance_settings does not exist in 001_init.sql")
check(
    re.search(r"\brequire_location\s+INTEGER\s+NOT\s+NULL\s+DEFAULT\s+0\b", settings)
    is not None,
    "attendance_settings.require_location must be INTEGER NOT NULL DEFAULT 0 — location is OFF "
    "until the owner turns it on",
)
check(
    re.search(
        r"CREATE UNIQUE INDEX IF NOT EXISTS \w+\s+ON attendance_settings\s*\(\s*hub_id\s*\)",
        sql,
    )
    is not None,
    "attendance_settings must be a singleton per hub: UNIQUE (hub_id)",
)
settings_cmd = commands.get("attendance.settings.update") or {}
settings_schema = read_json(settings_cmd.get("schema"))
require_location = (settings_schema.get("properties") or {}).get(
    "require_location"
) or {}
check(
    require_location.get("default") == 0,
    "settings schema: require_location default must be 0",
)
check(
    require_location.get("enum") == [0, 1],
    "settings schema: require_location is an integer flag, enum [0, 1] (staff#24: the shell's "
    "generic form paints it as a toggle)",
)

# --- 6 · the guards answer the right codes --------------------------------------------------
check(
    (clock_in.get("expect_rows") or {}).get("error") == "attendance.clock_in_rejected",
    "clock_in's guard must answer `attendance.clock_in_rejected`",
)
clock_out = commands.get("attendance.clock_out") or {}
check(
    (clock_out.get("expect_rows") or {}).get("statement") == "commands/clock_out.sql",
    "clock_out's guard must be anchored on commands/clock_out.sql: closing an open break is "
    "allowed to touch 0 rows and must not be able to satisfy the guard on its own",
)

# --- the migration guard trap (hub, 2026-08-18) ---------------------------------------------
for path in (
    sorted((MODULE_DIR / "migrations").rglob("*.sql"))
    + sorted((MODULE_DIR / "queries").glob("*.sql"))
    + sorted((MODULE_DIR / "commands").glob("*.sql"))
):
    for n, line in enumerate(path.read_text().splitlines(), 1):
        stripped = line.strip()
        if stripped.startswith("--") and ";" in stripped:
            failures.append(
                f"{path.relative_to(MODULE_DIR)}:{n}: a `;` inside a `--` comment makes the guard "
                f"split the file there and REJECT the whole module at install time"
            )

# --- the marketplace card speaks the hub's language -----------------------------------------
LOCALES = MODULE_DIR / "locales"
english = (
    json.loads((LOCALES / "en.json").read_text())
    if (LOCALES / "en.json").exists()
    else {}
)
spanish = (
    json.loads((LOCALES / "es.json").read_text())
    if (LOCALES / "es.json").exists()
    else {}
)
check(
    english.get("description") == manifest.get("description"),
    "locales/en.json `description` must equal module.json `description` (English is the source)",
)
for key in ("name", "description"):
    check(
        bool(spanish.get(key)) and spanish.get(key) != english.get(key),
        f"locales/es.json `{key}` must be a Spanish translation, not missing nor a copy",
    )

# 7. THE «CLOCKED IN NOW» WIDGET REFRESHES ON EVERY EVENT THAT MOVES THE COUNT. `presence.count`
#    counts `open` days, and three emitted events change that number: clocking in and out and a
#    correction (which can close a day or reopen one). A widget that misses one shows a stale count
#    until the next clock-in. The scheduled review (open → needs_review) moves it too but emits
#    nothing until the runtime can emit per flagged day (8, attendance#15).
widget = (manifest.get("widgets") or {}).get("attendance.clocked_in_now") or {}
for event in (
    "attendance.clocked_in",
    "attendance.clocked_out",
    "attendance.record.corrected",
):
    check(
        event in (widget.get("refresh_on") or []),
        f"widget attendance.clocked_in_now must refresh on `{event}`: it changes how many days are open",
    )
emitted = {e if isinstance(e, str) else e.get("event") for c in manifest["commands"].values() for e in c.get("emit") or []}
for event in widget.get("refresh_on") or []:
    check(
        event in emitted,
        f"widget attendance.clocked_in_now listens to `{event}`, which no command of the module emits",
    )

# 8. attendance#13 — THE SCHEDULED REVIEW EMITS NOTHING. The runtime writes a command's `emit` once
#    per EXECUTION, whether it touched rows or not, with the task's empty payload: on PRE
#    `attendance.record.needs_review` went out every 15 minutes (96 a day) with nothing flagged and
#    no record id, and it is offered as a trigger in the automations editor. The row gates cannot
#    fix it in a scheduled task: `expect_rows`/`min_affected_rows` roll the run back, so the task
#    does not advance and is retried with an error every 5 minutes (hub HUB-F62). Until the runtime
#    can emit only when — and per row — something was flagged (hub#2612), the event does not exist:
#    not emitted, not declared, not listened to by the screens (attendance#15 brings it back).
task_command = next(
    t["command"] for t in manifest.get("scheduled_tasks") or [] if t.get("name") == "auto_review_stale"
)
task = manifest["commands"][task_command]
check(not task.get("emit"), f"attendance#13: `{task_command}` must not emit (one event per run, flagged or not), got {task.get('emit')}")
check(
    "expect_rows" not in task and "min_affected_rows" not in task,
    f"attendance#13: `{task_command}` must carry no row gate: 0 rows is its normal run, and a gate would turn it into an error retried every 5 minutes",
)
check(
    "attendance.record.needs_review" not in ((manifest.get("events") or {}).get("emits") or []),
    "attendance#13: `attendance.record.needs_review` must not be offered in events.emits while nothing emits it",
)
for ts in sorted((MODULE_DIR / "ui").rglob("*.ts")):
    if ts.name.endswith(".test.ts"):
        continue
    check(
        "attendance.record.needs_review" not in ts.read_text(),
        f"attendance#13: {ts.relative_to(MODULE_DIR)} listens to `attendance.record.needs_review`, which nothing emits",
    )

if failures:
    print(f"✗ {len(failures)} contract failure(s):", file=sys.stderr)
    for f in failures:
        print(f"  - {f}", file=sys.stderr)
    sys.exit(1)

print(
    "✓ attendance contract: one open working day per person held by a unique index, nothing is "
    "ever deleted, every correction keeps old + new + reason, the device source is a closed enum, "
    "location is off by default, the guards answer the right codes, the presence widget "
    "refreshes on every emitted event that moves its count, and the scheduled review emits nothing"
)
