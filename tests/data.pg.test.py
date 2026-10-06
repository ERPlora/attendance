#!/usr/bin/env python3
"""`attendance` data layer against a REAL Postgres — every query and command, run.

Why this file exists: `contract.test.py` reads files and `erplora validate --pg` only proves every
statement PREPAREs. A statement can prepare perfectly and still insert when it should refuse, read
another hub's rows, or count the wrong thing. Each case below is a promise the clock screen and
the law depend on:

  1. Two clock-ins in a row: the second is REFUSED (`attendance.clock_in_rejected`) and creates no
     row — by the guard, and by the partial unique index when the guard is bypassed.
  2. Tenancy: another hub's open day, settings or breaks never reach the caller.
  3. Geofence: with `require_location = 1`, a PERSONAL device outside the radius (or that did not
     measure) is refused, while the SHARED counter POS with the same data is accepted.
  4. A correction whose clock-out is not after its clock-in is refused, leaves no trail row and
     changes nothing.
  5. `_auto_review_stale`, run without a user, flags only the open days older than the threshold,
     and the person can clock in again afterwards.
  Plus: clock-out closes the running break, break start/end refuse without an open day/break,
  `records.mine` only returns the caller's rows, `presence.count` counts only this hub's open days,
  and `settings.update` creates the singleton and then updates it.

How it runs the SQL, mirroring the runtime:
  * the migration goes through the DDL type shim (INTEGER → BIGINT, REAL → DOUBLE PRECISION);
  * the `erp_*` bridge functions are lowered exactly like `hub/crates/db/src/lib.rs` does;
  * a command runs its `sql[]` in ONE transaction and applies its `expect_rows` gate as declared
    in `module.json` (anchored on `statement` when there is one): below the minimum, the whole
    transaction rolls back and the declared code is the answer;
  * every statement is also PREPAREd with REAL positional parameters (system binds typed, the rest
    left `unknown`, which is the shape a JSON `null` takes in the runtime): literal substitution
    alone cannot see a bind whose type Postgres cannot deduce.

Usage: tests/data.pg.test.py   (exit 0 = green)
  Uses the `erplora-test-pg-5433` container by default (override: ERPLORA_TEST_PG_CONTAINER).
  Creates a scratch database and DROPS it at the end, pass or fail. If Docker or the container is
  missing this is SKIPPED, never passed.
"""

from __future__ import annotations

import json
import os
import pathlib
import re
import subprocess
import sys
import uuid

MODULE_DIR = pathlib.Path(__file__).resolve().parent.parent
CONTAINER = os.environ.get("ERPLORA_TEST_PG_CONTAINER", "erplora-test-pg-5433")
DB = f"attendance_data_{uuid.uuid4().hex[:8]}"
MANIFEST = json.loads((MODULE_DIR / "module.json").read_text())

HUB = "hub-a"
OTHER_HUB = "hub-b"
# A third hub for the cases added after the main story, so they cannot shift its counts.
THIRD_HUB = "hub-c"
TZ = "Europe/Madrid"

# Binds the runtime injects itself, always present and typed TEXT (`system_params`).
SYSTEM_BINDS = ("hub_id", "current_user_id", "now", "new_id", "timezone")


def psql(args: list[str], db: str | None = None, stdin: str | None = None) -> str:
    cmd = [
        "docker",
        "exec",
        "-i",
        CONTAINER,
        "psql",
        "-v",
        "ON_ERROR_STOP=1",
        "-U",
        "postgres",
        "-X",
    ]
    if db:
        cmd += ["-d", db]
    cmd += args
    res = subprocess.run(cmd, input=stdin, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(res.stderr.strip() or res.stdout.strip())
    return res.stdout


def available() -> bool:
    try:
        psql(["-c", "SELECT 1"])
        return True
    except Exception:  # noqa: BLE001 - any failure means "no Postgres here"
        return False


# ── the runtime's translation ────────────────────────────────────────────────────────────


def strip_comments(sql: str) -> str:
    return "\n".join(
        line for line in sql.splitlines() if not line.strip().startswith("--")
    )


def scan_args(sql: str, open_at: int) -> tuple[list[str], int] | None:
    """Balanced, string-aware arguments of the call whose `(` is at `open_at`."""
    depth, start, in_string, args = 0, open_at + 1, False, []
    for i in range(open_at, len(sql)):
        c = sql[i]
        if in_string:
            if c == "'":
                in_string = False
            continue
        if c == "'":
            in_string = True
        elif c == "(":
            depth += 1
        elif c == ")":
            depth -= 1
            if depth == 0:
                args.append(sql[start:i])
                return args, i + 1
        elif c == "," and depth == 1:
            args.append(sql[start:i])
            start = i + 1
    return None


def render_bridge(name: str, raw: list[str]) -> str:
    a = [shim(x.strip()) for x in raw]
    if name == "erp_dt":
        return f"(({a[0]})::timestamptz)"
    if name == "erp_date":
        return f"(({a[0]})::date)"
    if name == "erp_dateadd":
        return f"(({a[0]})::timestamptz + (({a[1]}) || ' ' || {a[2]})::interval)"
    if name == "erp_extract":
        part = raw[0].strip().strip("'").lower()
        assert part in ("hour", "minute", "second", "epoch"), part
        return f"(EXTRACT({part} FROM ({a[1]})::timestamptz)::bigint)"
    raise AssertionError(f"bridge function {name} is not lowered by this test")


BRIDGE = re.compile(r"(?<![\w])(erp_dt|erp_date|erp_dateadd|erp_extract)\s*\(")


def shim(sql: str) -> str:
    """Lower every `erp_*(…)` call the way the runtime does (recursive, string-aware)."""
    out, i = "", 0
    while True:
        m = BRIDGE.search(sql, i)
        if not m:
            return out + sql[i:]
        call = scan_args(sql, m.end() - 1)
        assert call is not None, (
            f"unbalanced call at {sql[m.start() : m.start() + 40]!r}"
        )
        args, end = call
        out += sql[i : m.start()] + render_bridge(m.group(1), args)
        i = end


def ddl_shim(sql: str) -> str:
    """`shim_ddl_types`: the portable types to their native Postgres width."""
    sql = re.sub(r"\bINTEGER\b", "BIGINT", sql)
    return re.sub(r"\bREAL\b", "DOUBLE PRECISION", sql)


BIND = re.compile(r"(?<![:\w]):([a-z_][a-z0-9_]*)")


def lit(value) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "1" if value else "0"
    if isinstance(value, (int, float)):
        return repr(value)
    return "'" + str(value).replace("'", "''") + "'"


def bind_literals(sql: str, params: dict) -> str:
    """Named binds → literals. A bind the payload does not carry is NULL, like the runtime."""
    return BIND.sub(lambda m: lit(params.get(m.group(1))), sql)


def prepare_error(sql: str, db: str) -> str | None:
    """PREPARE with REAL positional parameters, first-appearance order, the way sqlx does.
    System binds are typed TEXT (always present); every other one is `unknown` — a JSON `null`
    arrives as `DynNull`, OID 0 — which is exactly the shape that breaks an un-CAST bind."""
    order: list[str] = []
    for name in BIND.findall(sql):
        if name not in order:
            order.append(name)
    positional = BIND.sub(lambda m: f"${order.index(m.group(1)) + 1}", sql)
    types = ", ".join("text" if n in SYSTEM_BINDS else "unknown" for n in order)
    stmt = f"prep_{uuid.uuid4().hex[:8]}"
    head = f"PREPARE {stmt} ({types}) AS " if order else f"PREPARE {stmt} AS "
    try:
        psql(["-c", head + shim(positional)], db=db)
        return None
    except Exception as exc:  # noqa: BLE001 - the message IS the assertion
        return str(exc)


# ── the two doors ────────────────────────────────────────────────────────────────────────


def statement(rel: str) -> str:
    return strip_comments((MODULE_DIR / rel).read_text()).strip().rstrip(";")


def ctx(hub: str, user: str, now: str) -> dict:
    return {"hub_id": hub, "current_user_id": user, "now": now, "timezone": TZ}


def run_command(
    name: str, payload: dict, hub: str, user: str, now: str
) -> tuple[bool, str | None]:
    """(ok, error_code). Runs the command's statements in ONE transaction, measures the affected
    rows, and applies its declared `expect_rows` gate: below the minimum the transaction is rolled
    back and the declared code is the answer, as `execute_tx_gated` does."""
    spec = MANIFEST["commands"][name]
    params = {**payload, **ctx(hub, user, now), "new_id": f"id-{uuid.uuid4().hex[:12]}"}
    body = ";\n".join(bind_literals(statement(rel), params) for rel in spec["sql"])
    body = shim(body)

    try:
        out = psql(["-f", "-"], db=DB, stdin=f"BEGIN;\n{body};\nROLLBACK;\n")
    except RuntimeError as exc:
        # Postgres refused a statement: in the runtime that is a 500, never a domain answer.
        return False, f"500: {exc}"
    counts = _counts(out)
    gate = spec.get("expect_rows")
    if gate:
        anchor = gate.get("statement")
        affected = counts[spec["sql"].index(anchor)] if anchor else sum(counts)
        if affected < gate["n"]:
            return False, gate["error"]
    psql(["-f", "-"], db=DB, stdin=f"BEGIN;\n{body};\nCOMMIT;\n")
    return True, None


def _counts(psql_output: str) -> list[int]:
    """Affected rows per statement, in order, from psql's command tags."""
    counts = []
    for line in psql_output.splitlines():
        m = re.match(r"^(?:INSERT \d+ (\d+)|UPDATE (\d+))$", line.strip())
        if m:
            counts.append(int(m.group(1) or m.group(2)))
    return counts


def query(
    name: str, params: dict, hub: str, user: str = "", now: str = "2026-10-06T12:00:00Z"
) -> list[dict]:
    spec = MANIFEST["queries"][name]
    sql = shim(bind_literals(statement(spec["sql"]), {**params, **ctx(hub, user, now)}))
    raw = psql(["-tA", "-c", f"SELECT row_to_json(q) FROM ({sql}) q"], db=DB).strip()
    return [json.loads(line) for line in raw.splitlines() if line]


# ── the battery ──────────────────────────────────────────────────────────────────────────

if not available():
    print(
        f"SKIPPED: no Postgres in container `{CONTAINER}` — this is a SKIP, not a pass"
    )
    sys.exit(0)

failures: list[str] = []


def check(condition: bool, message: str) -> None:
    if not condition:
        failures.append(message)


def rows(sql: str) -> list[list[str]]:
    out = psql(["-tA", "-F", "|", "-c", sql], db=DB).strip()
    return [r.split("|") for r in out.splitlines() if r]


T0 = "2026-10-06T08:00:00Z"


def at(minutes: int) -> str:
    """T0 plus `minutes`, RFC 3339 UTC — the shape `:now` arrives in."""
    h, m = divmod(8 * 60 + minutes, 60)
    d, h = divmod(h, 24)
    return f"2026-10-{6 + d:02d}T{h:02d}:{m:02d}:00Z"


psql(["-c", f'CREATE DATABASE "{DB}"'])
try:
    # --- 0 · the migration APPLIES and every statement PREPAREs with real binds ---------------
    migration = (MODULE_DIR / "migrations" / "postgres" / "001_init.sql").read_text()
    psql(["-f", "-"], db=DB, stdin=ddl_shim(migration))
    tables = {
        r[0]
        for r in rows(
            "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
        )
    }
    for t in (
        "attendance_record",
        "attendance_break",
        "attendance_correction",
        "attendance_settings",
    ):
        check(t in tables, f"{t} was not created by the migration")

    for block in ("queries", "commands"):
        for name, spec in MANIFEST[block].items():
            paths = spec["sql"] if isinstance(spec["sql"], list) else [spec["sql"]]
            for rel in paths:
                err = prepare_error(statement(rel), DB)
                check(
                    err is None,
                    f"{name} ({rel}) does not PREPARE with real binds: {err}",
                )

    # --- 1 · two clock-ins in a row: the second is refused, no second row ----------------------
    ok, code = run_command("attendance.clock_in", {"source": "shared"}, HUB, "ana", T0)
    check(ok, f"the first clock-in must succeed, got {code}")
    ok, code = run_command(
        "attendance.clock_in", {"source": "shared"}, HUB, "ana", at(5)
    )
    check(
        not ok and code == "attendance.clock_in_rejected",
        f"a second clock-in with a day already open must answer attendance.clock_in_rejected, got ok={ok} code={code}",
    )
    open_ana = rows(
        f"SELECT id FROM attendance_record WHERE hub_id = '{HUB}' AND user_id = 'ana' AND status = 'open'"
    )
    check(
        len(open_ana) == 1, f"ana must have exactly ONE open day, got {len(open_ana)}"
    )
    try:
        psql(
            [
                "-c",
                "INSERT INTO attendance_record (id, hub_id, user_id, clock_in_at, source) "
                f"VALUES ('bypass', '{HUB}', 'ana', '{at(6)}', 'shared')",
            ],
            db=DB,
        )
        failures.append(
            "the partial unique index must refuse a second OPEN day even when the guard is bypassed"
        )
    except RuntimeError as exc:
        check(
            "uq_attendance_record_one_open" in str(exc),
            f"the second open day must be refused by uq_attendance_record_one_open, got: {exc}",
        )

    mine_open = query("attendance.records.mine_open", {}, HUB, "ana")
    check(
        len(mine_open) == 1 and mine_open[0]["source"] == "shared",
        f"mine_open must return ana's open day, got {mine_open}",
    )
    check(
        mine_open and mine_open[0]["open_break_id"] is None,
        "with no break running, open_break_id must be NULL",
    )

    # --- 2 · tenancy: another hub never reaches the caller -------------------------------------
    ok, _ = run_command(
        "attendance.clock_in", {"source": "shared"}, OTHER_HUB, "bea", T0
    )
    check(ok, "bea clocks in at hub-b")
    ok, _ = run_command(
        "attendance.settings.update",
        {
            "require_location": 1,
            "geofence_radius_m": 50,
            "workplace_lat": 1.0,
            "workplace_lng": 1.0,
            "auto_close_after_hours": 1,
        },
        OTHER_HUB,
        "boss-b",
        T0,
    )
    check(ok, "hub-b saves its settings")
    ok, code = run_command(
        "attendance.clock_in", {"source": "personal"}, HUB, "bea", T0
    )
    check(
        ok,
        f"bea's open day at hub-b and hub-b's require_location must not block her at hub-a, got {code}",
    )
    check(
        query("attendance.records.mine_open", {}, HUB, "nobody") == [],
        "mine_open of a user with no open day must be empty",
    )
    hub_a_presence = query("attendance.presence.count", {}, HUB)
    check(
        hub_a_presence == [{"value": 2}],
        f"presence.count at hub-a must count only hub-a's open days (ana + bea = 2), got {hub_a_presence}",
    )
    check(
        query("attendance.settings.get", {}, HUB) == [],
        "hub-a never saved settings: settings.get must be empty there despite hub-b's row",
    )
    run_command("attendance.break_start", {}, OTHER_HUB, "bea", at(10))
    check(
        query("attendance.breaks.list", {}, HUB) == [],
        "hub-b's break must not appear in hub-a's breaks.list",
    )
    bea_a = query("attendance.records.mine_open", {}, HUB, "bea")[0]
    check(
        bea_a["open_break_id"] is None,
        "bea's running break at hub-b must not show as running in her hub-a day",
    )
    ok, code = run_command("attendance.break_end", {}, HUB, "bea", at(11))
    check(
        not ok and code == "attendance.no_open_break",
        f"break_end at hub-a must not close bea's break at hub-b, got ok={ok} code={code}",
    )

    # --- 3 · geofence: personal outside → refused, shared → accepted ---------------------------
    ok, _ = run_command(
        "attendance.settings.update",
        {
            "require_location": 1,
            "geofence_radius_m": 100,
            "workplace_lat": 40.4168,
            "workplace_lng": -3.7038,
            "auto_close_after_hours": 12,
        },
        HUB,
        "boss",
        T0,
    )
    check(ok, "hub-a turns location on")
    outside = {
        "source": "personal",
        "lat": 40.43,
        "lng": -3.69,
        "accuracy_m": 8.0,
        "distance_m": 1850.5,
        "within_radius": 0,
    }
    ok, code = run_command("attendance.clock_in", outside, HUB, "carl", T0)
    check(
        not ok and code == "attendance.clock_in_rejected",
        f"personal device OUTSIDE the radius must be refused, got ok={ok} code={code}",
    )
    unmeasured = {
        "source": "personal",
        "lat": None,
        "lng": None,
        "accuracy_m": None,
        "distance_m": None,
        "within_radius": None,
    }
    ok, code = run_command("attendance.clock_in", unmeasured, HUB, "carl", T0)
    check(
        not ok and code == "attendance.clock_in_rejected",
        f"personal device that did not measure (within_radius NULL) must be refused, got ok={ok} code={code}",
    )
    check(
        rows(
            f"SELECT 1 FROM attendance_record WHERE hub_id = '{HUB}' AND user_id = 'carl'"
        )
        == [],
        "a refused clock-in must not leave a row",
    )
    ok, code = run_command(
        "attendance.clock_in", {**outside, "source": "shared"}, HUB, "carl", T0
    )
    check(ok, f"the SHARED counter POS with the same data must be accepted, got {code}")
    inside = {
        "source": "personal",
        "lat": 40.4169,
        "lng": -3.7037,
        "accuracy_m": 5.0,
        "distance_m": 12.3,
        "within_radius": 1,
    }
    ok, code = run_command("attendance.clock_in", inside, HUB, "dani", T0)
    check(ok, f"a personal device INSIDE the radius must be accepted, got {code}")
    dani = rows(
        f"SELECT source, in_lat, in_distance_m, in_within_radius FROM attendance_record "
        f"WHERE hub_id = '{HUB}' AND user_id = 'dani'"
    )
    check(
        dani == [["personal", "40.4169", "12.3", "1"]],
        f"the clock-in must record where it was made, at full precision, got {dani}",
    )

    # --- breaks and clock-out ------------------------------------------------------------------
    ok, code = run_command("attendance.break_start", {}, HUB, "nobody", at(30))
    check(
        not ok and code == "attendance.break_rejected",
        f"break_start without an open day must be refused, got ok={ok} code={code}",
    )
    ok, code = run_command("attendance.break_end", {}, HUB, "ana", at(30))
    check(
        not ok and code == "attendance.no_open_break",
        f"break_end without a running break must be refused, got ok={ok} code={code}",
    )
    ok, _ = run_command("attendance.break_start", {}, HUB, "ana", at(60))
    check(ok, "ana starts a break")
    ok, code = run_command("attendance.break_start", {}, HUB, "ana", at(61))
    check(
        not ok and code == "attendance.break_rejected",
        f"a second break while one is running must be refused, got ok={ok} code={code}",
    )
    ana_open = query("attendance.records.mine_open", {}, HUB, "ana")[0]
    check(
        ana_open["open_break_id"] is not None
        and ana_open["open_break_started_at"] == at(60),
        f"mine_open must carry the running break, got {ana_open}",
    )
    ok, _ = run_command("attendance.break_end", {}, HUB, "ana", at(75))
    check(ok, "ana ends her break")
    ok, _ = run_command("attendance.break_start", {}, HUB, "ana", at(120))
    check(ok, "ana starts a second break")
    ok, code = run_command("attendance.clock_out", {}, HUB, "ana", at(130))
    check(ok, f"ana clocks out with a break running, got {code}")
    still_running = rows(
        f"SELECT 1 FROM attendance_break WHERE hub_id = '{HUB}' AND ended_at IS NULL "
        f"AND record_id = '{open_ana[0][0]}'"
    )
    check(still_running == [], "clock_out must close the running break")
    ana_day = rows(
        f"SELECT status, clock_out_at FROM attendance_record WHERE id = '{open_ana[0][0]}'"
    )
    check(
        ana_day == [["closed", at(130)]],
        f"ana's day must be closed at clock-out time, got {ana_day}",
    )
    ok, code = run_command("attendance.clock_out", {}, HUB, "ana", at(131))
    check(
        not ok and code == "attendance.no_open_record",
        f"clocking out with no open day must answer attendance.no_open_record, got ok={ok} code={code}",
    )

    mine = query("attendance.records.mine", {}, HUB, "ana")
    check(
        {r["user_id"] for r in mine} == {"ana"} and len(mine) == 1,
        f"records.mine must return only the caller's rows, got {[r['user_id'] for r in mine]}",
    )
    if mine:
        check(
            mine[0]["break_count"] == 2,
            f"break_count must be 2, got {mine[0]['break_count']}",
        )
        check(
            mine[0]["breaks_closed_minutes"] == 25,
            f"breaks_closed_minutes must be 15 + 10 = 25, got {mine[0]['breaks_closed_minutes']}",
        )
        check(
            mine[0]["local_date"] == "2026-10-06",
            f"local_date must be 2026-10-06, got {mine[0]['local_date']}",
        )
    every = query("attendance.records.list", {}, HUB)
    check(
        {r["user_id"] for r in every} == {"ana", "bea", "carl", "dani"},
        f"records.list must return every person of hub-a and nobody from hub-b, got {sorted(r['user_id'] for r in every)}",
    )
    breaks_mine = query("attendance.breaks.mine", {}, HUB, "ana")
    check(
        len(breaks_mine) == 2,
        f"breaks.mine must return ana's 2 breaks, got {len(breaks_mine)}",
    )
    check(query("attendance.breaks.mine", {}, HUB, "dani") == [], "dani has no breaks")

    # local_date is the BUSINESS day: 23:30 UTC is already tomorrow in Madrid (UTC+2 in October).
    run_command(
        "attendance.clock_in", {"source": "shared"}, HUB, "eli", "2026-10-06T23:30:00Z"
    )
    eli = query("attendance.records.mine", {}, HUB, "eli")
    check(
        eli and eli[0]["local_date"] == "2026-10-07",
        f"local_date must be read in the hub's timezone, got {eli[0]['local_date'] if eli else eli}",
    )

    # --- 4 · corrections -----------------------------------------------------------------------
    record_id = open_ana[0][0]
    before = rows(
        f"SELECT clock_in_at, clock_out_at, status FROM attendance_record WHERE id = '{record_id}'"
    )
    ok, code = run_command(
        "attendance.records.correct",
        {
            "record_id": record_id,
            "clock_in_at": at(0),
            "clock_out_at": at(0),
            "reason": "Typo",
        },
        HUB,
        "boss",
        at(200),
    )
    check(
        not ok and code == "attendance.record_not_found",
        f"clock-out == clock-in must be refused, got ok={ok} code={code}",
    )
    ok, code = run_command(
        "attendance.records.correct",
        {
            "record_id": record_id,
            "clock_in_at": at(60),
            "clock_out_at": at(30),
            "reason": "Typo",
        },
        HUB,
        "boss",
        at(200),
    )
    check(
        not ok and code == "attendance.record_not_found",
        f"clock-out before clock-in must be refused, got ok={ok} code={code}",
    )
    check(
        rows(f"SELECT 1 FROM attendance_correction WHERE record_id = '{record_id}'")
        == [],
        "a refused correction must leave NO trail row",
    )
    check(
        rows(
            f"SELECT clock_in_at, clock_out_at, status FROM attendance_record WHERE id = '{record_id}'"
        )
        == before,
        "a refused correction must change nothing",
    )
    ok, code = run_command(
        "attendance.records.correct",
        {
            "record_id": "does-not-exist",
            "clock_in_at": at(0),
            "clock_out_at": at(60),
            "reason": "Typo",
        },
        HUB,
        "boss",
        at(200),
    )
    check(
        not ok and code == "attendance.record_not_found",
        "an unknown record must be refused",
    )
    ok, code = run_command(
        "attendance.records.correct",
        {
            "record_id": record_id,
            "clock_in_at": at(0),
            "clock_out_at": at(60),
            "reason": "Typo",
        },
        OTHER_HUB,
        "boss-b",
        at(200),
    )
    check(
        not ok and code == "attendance.record_not_found",
        "another hub cannot correct hub-a's record",
    )

    ok, code = run_command(
        "attendance.records.correct",
        {
            "record_id": record_id,
            "clock_in_at": at(-15),
            "clock_out_at": at(150),
            "reason": "Forgot to clock in at arrival",
        },
        HUB,
        "boss",
        at(200),
    )
    check(ok, f"a valid correction must be applied, got {code}")
    trail = query("attendance.corrections.list", {}, HUB)
    check(len(trail) == 1, f"one trail row expected, got {len(trail)}")
    if trail:
        t = trail[0]
        check(
            (t["old_clock_in_at"], t["old_clock_out_at"], t["old_status"])
            == (at(0), at(130), "closed"),
            f"the trail must keep the OLD values, got {t}",
        )
        check(
            (t["new_clock_in_at"], t["new_clock_out_at"], t["new_status"])
            == (at(-15), at(150), "closed"),
            f"the trail must keep the NEW values, got {t}",
        )
        check(
            t["reason"] == "Forgot to clock in at arrival"
            and t["created_by"] == "boss",
            f"the trail must keep the reason and who corrected, got {t}",
        )
    check(
        rows(
            f"SELECT clock_in_at, clock_out_at, status FROM attendance_record WHERE id = '{record_id}'"
        )
        == [[at(-15), at(150), "closed"]],
        "the record must carry the corrected times",
    )
    check(
        query("attendance.corrections.list", {}, OTHER_HUB) == [],
        "hub-b must not read hub-a's trail",
    )

    # Reopening a day while the person already has another open one would break the index.
    ok, _ = run_command(
        "attendance.clock_in", {"source": "shared"}, HUB, "ana", at(300)
    )
    check(ok, "ana clocks in again for a new day")
    ok, code = run_command(
        "attendance.records.correct",
        {
            "record_id": record_id,
            "clock_in_at": at(-15),
            "clock_out_at": None,
            "reason": "Reopen by mistake",
        },
        HUB,
        "boss",
        at(310),
    )
    check(
        not ok and code == "attendance.record_not_found",
        f"reopening a day while another is open must be refused (not a 500), got ok={ok} code={code}",
    )

    # --- 5 · _auto_review_stale, without a user ------------------------------------------------
    # hub-a threshold is 12 h. carl and dani clocked in at T0, ana at T0+5h, eli at 23:30.
    ok, _ = run_command("attendance._auto_review_stale", {}, HUB, "", at(12 * 60 + 1))
    check(ok, "the task runs")
    flagged = {
        r[0]
        for r in rows(
            f"SELECT user_id FROM attendance_record WHERE hub_id = '{HUB}' "
            f"AND status = 'needs_review'"
        )
    }
    check(
        flagged == {"carl", "dani", "bea"},
        f"only the open days older than 12 h are flagged (carl, dani, bea), got {sorted(flagged)}",
    )
    still_open = {
        r[0]
        for r in rows(
            f"SELECT user_id FROM attendance_record WHERE hub_id = '{HUB}' AND status = 'open'"
        )
    }
    check(
        still_open == {"ana", "eli"},
        f"younger open days stay open, got {sorted(still_open)}",
    )
    bea_b = rows(
        f"SELECT status FROM attendance_record WHERE hub_id = '{OTHER_HUB}' AND user_id = 'bea'"
    )
    check(bea_b == [["open"]], f"the task for hub-a must not touch hub-b, got {bea_b}")
    ok, code = run_command(
        "attendance.clock_in", {"source": "shared"}, HUB, "carl", at(12 * 60 + 5)
    )
    check(ok, f"after needs_review, carl can clock in again, got {code}")
    # Now hub-a holds closed, needs_review AND open days: only the open ones are "clocked in now".
    presence = query("attendance.presence.count", {}, HUB)
    check(presence == [{"value": 3}],
          f"presence.count must count only OPEN days (ana, eli, carl), not closed or needs_review ones, got {presence}")
    # hub-b's own threshold (1 h) is used for hub-b.
    run_command("attendance._auto_review_stale", {}, OTHER_HUB, "", at(61))
    check(
        rows(
            f"SELECT status FROM attendance_record WHERE hub_id = '{OTHER_HUB}' AND user_id = 'bea'"
        )
        == [["needs_review"]],
        "hub-b's day is flagged with hub-b's 1 h threshold",
    )
    # A manager closes a needs_review day with a correction.
    bea_a_id = rows(
        f"SELECT id FROM attendance_record WHERE hub_id = '{HUB}' AND user_id = 'bea'"
    )[0][0]
    ok, code = run_command(
        "attendance.records.correct",
        {
            "record_id": bea_a_id,
            "clock_in_at": at(0),
            "clock_out_at": at(480),
            "reason": "Forgot to clock out",
        },
        HUB,
        "boss",
        at(800),
    )
    check(ok, f"a needs_review day is closed with a correction, got {code}")
    check(
        rows(f"SELECT status FROM attendance_record WHERE id = '{bea_a_id}'")
        == [["closed"]],
        "the corrected needs_review day is closed",
    )
    bea_b_id = rows(
        f"SELECT id FROM attendance_record WHERE hub_id = '{OTHER_HUB}' AND user_id = 'bea'"
    )[0][0]
    # bea's hub-b day still has the break she started at T0+10, AFTER the clock-out set here.
    ok, code = run_command(
        "attendance.records.correct",
        {
            "record_id": bea_b_id,
            "clock_in_at": at(0),
            "clock_out_at": at(5),
            "reason": "Forgot to clock out",
        },
        OTHER_HUB,
        "boss-b",
        at(800),
    )
    check(ok, f"hub-b's manager closes bea's needs_review day, got {code}")
    check(
        rows(f"SELECT ended_at FROM attendance_break WHERE record_id = '{bea_b_id}'")
        == [[at(10)]],
        "a break that started after the corrected clock-out is closed at its own start",
    )


    # --- hub-c · break_end and clock_out only ever touch the CALLER's break --------------------
    for person in ("gil", "hugo"):
        ok, code = run_command("attendance.clock_in", {"source": "shared"}, THIRD_HUB, person, T0)
        check(ok, f"{person} clocks in at hub-c, got {code}")
        ok, code = run_command("attendance.break_start", {}, THIRD_HUB, person, at(20))
        check(ok, f"{person} starts a break at hub-c, got {code}")

    def hugo_state() -> list[list[str]]:
        return rows(
            "SELECT r.status, b.ended_at IS NULL FROM attendance_record r "
            "JOIN attendance_break b ON b.record_id = r.id AND b.hub_id = r.hub_id "
            f"WHERE r.hub_id = '{THIRD_HUB}' AND r.user_id = 'hugo'"
        )

    ok, code = run_command("attendance.break_end", {}, THIRD_HUB, "gil", at(30))
    check(ok, f"gil ends his break, got {code}")
    check(hugo_state() == [["open", "t"]],
          f"gil's break_end must leave hugo's break running and his day open, got {hugo_state()}")
    run_command("attendance.break_start", {}, THIRD_HUB, "gil", at(40))
    ok, code = run_command("attendance.clock_out", {}, THIRD_HUB, "gil", at(50))
    check(ok, f"gil clocks out with a break running, got {code}")
    check(hugo_state() == [["open", "t"]],
          f"gil's clock_out (which ends a break first) must leave hugo's break running and his day "
          f"open, got {hugo_state()}")

    # --- hub-c · a correction closes the break left running at the NEW clock-out --------------
    hugo_id = rows(f"SELECT id FROM attendance_record WHERE hub_id = '{THIRD_HUB}' AND user_id = 'hugo'")[0][0]
    ok, code = run_command(
        "attendance.records.correct",
        {"record_id": hugo_id, "clock_in_at": at(0), "clock_out_at": at(90), "reason": "Left without clocking out"},
        THIRD_HUB, "boss-c", at(500),
    )
    check(ok, f"the correction of hugo's day is applied, got {code}")
    check(rows(f"SELECT ended_at FROM attendance_break WHERE record_id = '{hugo_id}'") == [[at(90)]],
          "a break running inside the corrected day is closed at the new clock-out")
    check(rows(f"SELECT status FROM attendance_record WHERE id = '{hugo_id}'") == [["closed"]],
          "the corrected day is closed")

    # --- hub-c · correction timestamps: UTC `Z` only, stored verbatim --------------------------
    # The list engine sorts and range-filters clock_in_at as TEXT, and every row the runtime
    # writes holds `:now` in UTC `…Z`. A `+02:00` value would sort and filter in the wrong place,
    # so the schema accepts exactly what `Date.prototype.toISOString()` sends.
    correct_schema = json.loads((MODULE_DIR / MANIFEST["commands"]["attendance.records.correct"]["schema"]).read_text())
    for field_name in ("clock_in_at", "clock_out_at"):
        pattern = correct_schema["properties"][field_name]["pattern"]
        for value, accepted in (
            ("2026-10-06T08:00:00.000Z", True),
            ("2026-10-06T08:00:00Z", True),
            ("2026-10-06T10:00:00+02:00", False),
            ("2026-10-06T08:00:00-00:00", False),
            ("2026-10-06T08:00Z", False),
            ("2026-10-06 08:00:00Z", False),
        ):
            check(bool(re.search(pattern, value)) == accepted,
                  f"record_correct schema `{field_name}` must {'accept' if accepted else 'reject'} {value!r}")
    ok, code = run_command(
        "attendance.records.correct",
        {"record_id": hugo_id, "clock_in_at": "2026-10-06T07:45:00.000Z",
         "clock_out_at": "2026-10-06T09:30:00.000Z", "reason": "Exact times from the shift sheet"},
        THIRD_HUB, "boss-c", at(510),
    )
    check(ok, f"a toISOString() correction is applied, got {code}")
    stored = rows(f"SELECT clock_in_at, clock_out_at FROM attendance_record WHERE id = '{hugo_id}'")
    check(stored == [["2026-10-06T07:45:00.000Z", "2026-10-06T09:30:00.000Z"]],
          f"the UTC values are stored verbatim, got {stored}")

    # An impossible date passes a regex but not Postgres: it must be a domain refusal, not a 500.
    trail_before = rows(f"SELECT COUNT(*) FROM attendance_correction WHERE record_id = '{hugo_id}'")
    for bad_in, bad_out in (("2026-13-45T10:00:00Z", "2026-10-06T18:00:00Z"),
                            ("2026-10-06T08:00:00Z", "2026-02-30T18:00:00Z"),
                            ("2026-02-30T08:00:00Z", None)):
        ok, code = run_command(
            "attendance.records.correct",
            {"record_id": hugo_id, "clock_in_at": bad_in, "clock_out_at": bad_out, "reason": "Typo in the date"},
            THIRD_HUB, "boss-c", at(520),
        )
        check(not ok and code == "attendance.record_not_found",
              f"impossible date ({bad_in}, {bad_out}) must answer attendance.record_not_found, got ok={ok} code={code}")
    check(rows(f"SELECT COUNT(*) FROM attendance_correction WHERE record_id = '{hugo_id}'") == trail_before,
          "an impossible date leaves no trail row")

    # --- settings: created on first save, then updated in place --------------------------------
    settings = query("attendance.settings.get", {}, HUB)
    check(
        settings
        == [
            {
                "require_location": 1,
                "geofence_radius_m": 100,
                "workplace_lat": 40.4168,
                "workplace_lng": -3.7038,
                "auto_close_after_hours": 12,
            }
        ],
        f"the first save must create the row with the snapshot, got {settings}",
    )
    ok, _ = run_command(
        "attendance.settings.update",
        {
            "require_location": 0,
            "geofence_radius_m": 250,
            "workplace_lat": None,
            "workplace_lng": None,
            "auto_close_after_hours": 8,
        },
        HUB,
        "boss",
        at(900),
    )
    check(ok, "the second save succeeds")
    settings = query("attendance.settings.get", {}, HUB)
    check(
        settings
        == [
            {
                "require_location": 0,
                "geofence_radius_m": 250,
                "workplace_lat": None,
                "workplace_lng": None,
                "auto_close_after_hours": 8,
            }
        ],
        f"the second save must update the same row, clearing the workplace, got {settings}",
    )
    check(
        rows(f"SELECT COUNT(*) FROM attendance_settings WHERE hub_id = '{HUB}'")
        == [["1"]],
        "settings stay a singleton per hub",
    )
finally:
    psql(["-c", f'DROP DATABASE IF EXISTS "{DB}" WITH (FORCE)'])

if failures:
    print(
        f"✗ {len(failures)} failure(s) running attendance against Postgres:",
        file=sys.stderr,
    )
    for f in failures:
        print(f"  - {f}", file=sys.stderr)
    sys.exit(1)

print(
    "✓ attendance on real Postgres: migration applies, every statement PREPAREs with real binds, "
    "one open day per person, tenancy holds, the geofence blocks only personal devices, invalid "
    "corrections leave no trace, stale days are flagged per hub, settings are a singleton"
)
