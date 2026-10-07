#!/usr/bin/env python3
"""Manifest contract test for `attendance` — `module.json` must parse the way the RUNTIME parses it.

Ported from `tables/tests/manifest.contract.test.py` (tables#28). Why it exists there, and here: a
manifest that the runtime cannot deserialize does not degrade a feature, it closes the door —
`Manifest::load` is the first thing `installer::install` does, so one wrong JSON type makes the
module impossible to install on ANY hub, and `erplora validate` re-implements a subset of the
schema by hand instead of applying it.

Four layers, all in this one file, no services needed:

  1. TYPE CONTRACT (always, zero dependencies). Mirrors the serde model of
     `hub/crates/runtime/src/manifest.rs`: every block declared here must carry the JSON type the
     runtime deserializes it into.

  2. CANONICAL JSON SCHEMA (when reachable). If `jsonschema` is importable and the hub checkout is
     at hand (`ERPLORA_MODULE_SCHEMA`, or the sibling checkout used by the dev workspace), the
     manifest is validated against `hub/schemas/module.schema.json` ITSELF, read from the hub's
     `origin/develop`. Unreachable is reported as SKIPPED, never as a pass.

  3. DECLARED FILES EXIST. Every path the manifest points at (migrations, query/command SQL, JSON
     Schemas, the settings schema) must be in the package. The UI bundle (`ui.entry`) is produced
     by `erplora build` from `ui/components/`, so it is required as soon as there is a component
     to build — and its SHAPE (`dist/<id>.esm.js`) is required always.

  4. CROSS-REFERENCES HOLD. Every `expect_rows.error` is in `errors`, every `errors.<code>` has its
     sentence in `locales/en.json` AND `locales/es.json`, every permission a query, command,
     navigation entry, widget or role uses is declared in `permissions`, and every query/command
     the `settings`, `widgets` and `scheduled_tasks` blocks name exists. The runtime is forgiving
     with the transported blocks (`settings`, `widgets`, `navigation`): a dangling name there does
     not fail an install, it silently hides a screen — which is why it has to be strict here.

Usage: tests/manifest.contract.test.py   (exit 0 = green)
"""

from __future__ import annotations

import json
import os
import pathlib
import re
import subprocess
import sys

MODULE_DIR = pathlib.Path(__file__).resolve().parent.parent
MANIFEST_PATH = MODULE_DIR / "module.json"

# `enum CatchUp` in hub/crates/runtime/src/manifest.rs (`#[serde(rename_all = "lowercase")]`),
# mirrored by `$defs/scheduledTask.catch_up` in hub/schemas/module.schema.json. There is no
# "run every missed execution" mode on purpose: `collapse` (the default) runs the backlog ONCE,
# `skip` does not run it at all. A boolean is not a member of this enum.
CATCH_UP_VALUES = ("collapse", "skip")

# Dialects the runtime knows about (`struct Migrations`).
SQL_DIALECTS = ("sqlite", "postgres")
MODULE_ID = "attendance"

# Top-level blocks of the contract. The canonical schema declares `additionalProperties: false`;
# here an unknown key is only a warning, so that a manifest using a block newer than this list
# does not turn red for no reason (layer 2 is the strict one). Extend when the contract grows.
KNOWN_TOP_LEVEL = {
    "id",
    "name",
    "version",
    "description",
    "depends_on",
    "permissions",
    "role_permissions",
    "navigation",
    "migrations",
    "seed",
    "queries",
    "commands",
    "events",
    "agent",
    "ai_context",
    "scheduled_tasks",
    "widgets",
    "settings",
    "static_files",
    "provides_slots",
    "ui",
    "notify",
    "network",
    "capabilities",
    "setup",
    "errors",
}

# ADR-0398 — the value of every entry in `errors`. `{}` is the normal case; `deprecated` carries the
# version from which the code is announced as going away. Nothing else is part of the contract.
ERROR_ENTRY_KEYS = {"deprecated"}

# `errors::valid_domain_code` in the runtime: `<module>.<snake_case>`, 128 characters at most.
DOMAIN_CODE = re.compile(r"^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$")
DOMAIN_CODE_MAX = 128

JSON_TYPE_NAME = {
    bool: "boolean",
    int: "number",
    float: "number",
    str: "string",
    list: "array",
    dict: "object",
    type(None): "null",
}

failures: list[str] = []
warnings: list[str] = []
notes: list[str] = []


def type_name(value) -> str:
    return JSON_TYPE_NAME.get(type(value), type(value).__name__)


def expect(path: str, value, kind, enum: tuple | None = None) -> bool:
    """Assert the JSON type of `value`. `True`/`False` never pass as a number or a string:
    in Python `bool` is a subclass of `int`, in JSON it is a type of its own — and confusing
    the two is exactly the bug this file guards against."""
    ok = isinstance(value, kind) and not (isinstance(value, bool) and kind is not bool)
    if not ok:
        failures.append(
            f"{path}: expected {kind.__name__}, got {type_name(value)} ({value!r})"
        )
        return False
    if enum is not None and value not in enum:
        failures.append(f"{path}: {value!r} is not one of {list(enum)}")
        return False
    return True


def field(
    path: str,
    obj: dict,
    key: str,
    kind,
    required: bool = False,
    enum: tuple | None = None,
):
    """Check one key of an object. Absent (or `null`, which serde reads as `None` for an
    `Option<T>`) is fine unless the field is required."""
    if key not in obj or obj[key] is None:
        if required:
            failures.append(f"{path}.{key}: missing, and the runtime requires it")
        return None
    expect(f"{path}.{key}", obj[key], kind, enum)
    return obj[key]


def string_array(path: str, value) -> None:
    if not expect(path, value, list):
        return
    for i, item in enumerate(value):
        expect(f"{path}[{i}]", item, str)


# A migration entry admits TWO shapes (hub#542, `MigrationEntry` in the runtime and
# `$defs.migrationEntry` in the canonical schema): the bare path, which reads `expand` and is what
# the whole published catalogue uses, or `{ file, kind, since }` — the ONLY way to declare a
# `contract`, and therefore the only legitimate way to ship a `DROP` (the runtime turns it into a
# `RENAME … TO _deprecated_…` instead of destroying). `kind` and `since` are optional exactly like
# in the runtime. This test used to accept the string form alone, which put a manifest the core
# and the toolkit both accept in RED (tables#76, the migration that names the gate constraints).
MIGRATION_KINDS = ("expand", "backfill", "contract")


def migration_entry_array(path: str, value) -> None:
    if not expect(path, value, list):
        return
    for i, item in enumerate(value):
        where = f"{path}[{i}]"
        if isinstance(item, dict):
            field(where, item, "file", str, required=True)
            field(where, item, "kind", str, enum=MIGRATION_KINDS)
            field(where, item, "since", str)
            # `additionalProperties: false` in the canonical schema: a key it does not know about
            # is a typo that would be silently ignored, not an extension.
            for key in item:
                if key not in ("file", "kind", "since"):
                    failures.append(
                        f"{where}.{key}: not part of a migration entry — the canonical schema "
                        "declares `additionalProperties: false` (`file`, `kind`, `since`)"
                    )
            continue
        expect(where, item, str)


def migration_files(entries) -> list[str]:
    """The `.sql` paths an entry list points at, whichever shape each entry uses."""
    out: list[str] = []
    for item in entries if isinstance(entries, list) else []:
        if isinstance(item, str):
            out.append(item)
        elif isinstance(item, dict) and isinstance(item.get("file"), str):
            out.append(item["file"])
    return out


# ── Layer 1: the type contract, mirroring `struct Manifest` ──────────────────────────────


def check_identity(m: dict) -> None:
    field("", m, "id", str, required=True)
    field("", m, "name", str, required=True)
    field("", m, "version", str, required=True)
    field("", m, "description", str)

    # The marketplace resolves a module by its folder, so the two have to agree — but a git
    # worktree is checked out as `<id>-wt-<something>` (a worker) or `<id>-rv-<pr>` (a reviewer),
    # and comparing against that made this battery red on every worktree of the fleet, on a repo
    # nobody had touched. A red that fires on where the checkout lives, not on what the manifest
    # says, is a red people learn to skip.
    folder = re.sub(r"-(?:wt|rv)-[\w.-]+$", "", MODULE_DIR.name)
    if m.get("id") != folder:
        failures.append(
            f"id: {m.get('id')!r} does not match the module folder {MODULE_DIR.name!r}"
        )

    # The release bot bumps module.json and package.json together; a mismatch means a half-applied
    # release, and the marketplace publishes whatever module.json says.
    pkg_path = MODULE_DIR / "package.json"
    if pkg_path.exists():
        pkg_version = json.loads(pkg_path.read_text()).get("version")
        if pkg_version != m.get("version"):
            failures.append(
                f"version: module.json says {m.get('version')!r}, package.json says {pkg_version!r}"
            )


def check_permissions(m: dict) -> None:
    string_array("depends_on", m.get("depends_on", []))
    string_array("permissions", m.get("permissions", []))

    roles = m.get("role_permissions", {})
    if expect("role_permissions", roles, dict):
        for role, perms in roles.items():
            string_array(f"role_permissions.{role}", perms)


def check_navigation(m: dict) -> None:
    nav = m.get("navigation", [])
    if not expect("navigation", nav, list):
        return
    for i, entry in enumerate(nav):
        path = f"navigation[{i}]"
        if not expect(path, entry, dict):
            continue
        field(path, entry, "id", str, required=True)
        field(path, entry, "label", str, required=True)
        field(path, entry, "component", str, required=True)
        field(path, entry, "icon", str)
        field(path, entry, "permission", str)
        if "actions" in entry:
            failures.append(
                f"{path}.actions: dead and rejected by the canonical schema — a module-owned "
                f"topbar action goes through a `shell.topbar:<scope>` slot"
            )


def check_sql_blocks(m: dict) -> None:
    for block in ("migrations", "seed"):
        value = m.get(block, {})
        if not expect(block, value, dict):
            continue
        for dialect, files in value.items():
            if dialect not in SQL_DIALECTS:
                failures.append(f"{block}.{dialect}: unknown SQL dialect {dialect!r}")
                continue
            migration_entry_array(f"{block}.{dialect}", files)

    queries = m.get("queries", {})
    if expect("queries", queries, dict):
        for name, q in queries.items():
            path = f"queries.{name}"
            if not expect(path, q, dict):
                continue
            field(path, q, "permission", str, required=True)
            field(path, q, "sql", str, required=True)
            field(path, q, "schema", str)
            field(path, q, "expose_api", bool)
            if "list" in q and expect(f"{path}.list", q["list"], dict):
                spec = q["list"]
                string_array(f"{path}.list.search", spec.get("search", []))
                string_array(f"{path}.list.sort", spec.get("sort", []))
                field(f"{path}.list", spec, "default_sort", str)
                field(f"{path}.list", spec, "default_dir", str)
                field(f"{path}.list", spec, "page_size", int)

    commands = m.get("commands", {})
    if expect("commands", commands, dict):
        for name, c in commands.items():
            path = f"commands.{name}"
            if not expect(path, c, dict):
                continue
            field(path, c, "permission", str, required=True)
            field(path, c, "schema", str)
            field(path, c, "transaction", bool)
            field(path, c, "internal", bool)
            field(path, c, "expose_api", bool)
            field(path, c, "min_affected_rows", int)
            check_expect_rows(path, c)
            string_array(f"{path}.sql", c.get("sql", []))
            string_array(f"{path}.emit", c.get("emit", []))
            if "handler" in c and expect(f"{path}.handler", c["handler"], dict):
                h = c["handler"]
                field(f"{path}.handler", h, "type", str, required=True)
                field(f"{path}.handler", h, "file", str, required=True)
                field(f"{path}.handler", h, "function", str, required=True)


# ── The translatable affected-rows gate (`expect_rows`, hub#139 — hub#139) ─────────────
#
# It is the module's PUBLIC error ABI: a command that mutates nothing rolls back and answers this
# code instead of a `200 ok` with a phantom event. Two things can only be checked here:
#
#   * the namespace. The installer REJECTS a code outside the module's namespace (`valid_domain_code`), so a
#     typo there does not degrade a message — it makes the module uninstallable on every hub.
#   * the translation. The code is what the UI keys on (ADR-0055); with no `errors` entry the
#     screen falls back to the manifest's English, and the Spanish user reads English.


def check_expect_rows(path: str, c: dict) -> None:
    gate = c.get("expect_rows")
    if gate is None:
        return
    if not expect(f"{path}.expect_rows", gate, dict):
        return
    field(f"{path}.expect_rows", gate, "op", str, required=True, enum=("min",))
    field(f"{path}.expect_rows", gate, "n", int, required=True)
    code = field(f"{path}.expect_rows", gate, "error", str, required=True)
    message = field(f"{path}.expect_rows", gate, "message", str)
    if c.get("min_affected_rows") is not None:
        failures.append(
            f"{path}: `expect_rows` and `min_affected_rows` cannot coexist — the installer refuses it"
        )
    if isinstance(code, str) and not code.startswith(f"{MODULE_ID}."):
        failures.append(
            f"{path}.expect_rows.error: `{code}` is outside this module's namespace — "
            f"the installer rejects it and the module stops installing"
        )
    # hub#1091: the anchor must name one statement of THIS command, exactly as written in `sql`.
    # The installer rejects an anchor that does not, so a typo here is an uninstallable module.
    anchor = field(f"{path}.expect_rows", gate, "statement", str)
    if isinstance(anchor, str) and anchor not in (c.get("sql") or []):
        failures.append(
            f"{path}.expect_rows.statement: `{anchor}` is not one of this command's `sql` "
            f"entries {c.get('sql')} — the installer rejects the manifest"
        )
    if isinstance(message, str) and len(message) > 500:
        failures.append(f"{path}.expect_rows.message: over the 500-character cap")


# The domain codes a Tier-2 handler would mint (ADR-0398). `attendance` is Tier 0 today and has no
# `handler/`, so this reads nothing — it stays so that adding a handler later cannot ship a code
# with neither catalogue entry nor translation. The scan is LEXICAL over every
# `"attendance.<snake_case>"` literal, minus what the manifest already names as a query/command.
HANDLER_LITERAL = re.compile(r'"(attendance\.[a-z0-9_.]+)"')


def handler_codes(m: dict) -> set[str]:
    src = MODULE_DIR / "handler" / "src" / "lib.rs"
    if not src.exists():
        return set()
    names = set(m.get("commands") or {}) | set(m.get("queries") or {})
    return {
        code
        for code in HANDLER_LITERAL.findall(src.read_text())
        if code not in names and not code.split(".", 1)[1].startswith("_")
    }


def emitted_codes(m: dict) -> set[str]:
    """Every domain code this module can answer with: the declarative gate plus the handler."""
    return {
        c["expect_rows"]["error"]
        for c in (m.get("commands") or {}).values()
        if isinstance(c, dict)
        and isinstance(c.get("expect_rows"), dict)
        and isinstance(c["expect_rows"].get("error"), str)
    } | handler_codes(m)


def check_error_catalog(m: dict) -> None:
    """ADR-0398 — the codes are DECLARED surface (`module.json → errors`), not a side effect.

    Until this block existed a code was born in a literal of the handler or in an
    `expect_rows.error` and died where it was born: nothing published it, so nothing could notice
    it going away. `appointments` turned an `Err("overlap: …")` into a coded `DomainError` with its
    gate green and broke the pre-push gate of the whole fleet in under an hour, and hub#1070 lists
    18 tests of the hub asserting on the error TEXT because there was no code to assert on.

    With `errors` present the runtime is STRICT: an `Output.error` carrying a code that is not in
    the catalogue is a broken guest contract (`RuntimeError::Wasm`, `unexpected`), not a domain
    rejection the screen can translate. So the catalogue being one code short does not degrade a
    message — it turns a legitimate rejection into a 500. That is why the three lists
    (`expect_rows.error`, the handler's literals, and `locales/*.json → errors`) are compared
    against each other here and not merely against the manifest.
    """
    emitted = emitted_codes(m)
    catalog = m.get("errors")

    if catalog is None:
        if emitted:
            failures.append(
                f"errors: missing, and this module answers {len(emitted)} domain code(s) "
                f"({', '.join(sorted(emitted))}). ADR-0398: retiring one of them has to be a "
                f"visible change, and without the block nothing publishes them"
            )
        return
    if not expect("errors", catalog, dict):
        return

    for code, entry in sorted(catalog.items()):
        if len(code) > DOMAIN_CODE_MAX or not DOMAIN_CODE.match(code):
            failures.append(
                f"errors.{code}: not a domain code — the contract is `<module>.<snake_case>`, "
                f"{DOMAIN_CODE_MAX} characters at most (`errors::valid_domain_code`)"
            )
        elif not code.startswith(f"{m.get('id')}."):
            failures.append(
                f"errors.{code}: outside this module's namespace — the runtime rejects a code "
                f"a module does not own"
            )
        if not expect(f"errors.{code}", entry, dict):
            continue
        for key in sorted(set(entry) - ERROR_ENTRY_KEYS):
            failures.append(
                f"errors.{code}.{key}: not part of the contract — the value carries the STATE of "
                f"the code ({sorted(ERROR_ENTRY_KEYS)}), never its text. The sentence lives in "
                f"`locales/<lang>.json → errors` (ADR-0055)"
            )
        field(f"errors.{code}", entry, "deprecated", str)

    for code in sorted(emitted - set(catalog)):
        failures.append(
            f"errors: `{code}` is answered by this module but not declared. With `errors` present "
            f"the runtime is strict, so this code stops being a translatable rejection and "
            f"becomes `unexpected` (ADR-0398 §8.2)"
        )

    for code in sorted(set(catalog) - emitted):
        if isinstance(catalog[code], dict) and catalog[code].get("deprecated"):
            continue
        failures.append(
            f"errors.{code}: declared but nothing emits it. Either the code is gone — and then it "
            f"needs `deprecated` for one release before being removed — or the scan above lost "
            f"sight of where it is minted"
        )


def check_error_locales(m: dict) -> None:
    """Every code a command can answer must have its sentence in EN (source) and ES (ADR-0055).

    Includes the DECLARED catalogue, deprecated entries and all: a code still in the ABI is a code
    a hub can still answer, so the Spanish user must still be able to read it.
    """
    declared = emitted_codes(m) | set(m.get("errors") or {})
    if not declared:
        return
    for lang in ("en", "es"):
        path = MODULE_DIR / "locales" / f"{lang}.json"
        if not path.exists():
            failures.append(
                f"locales/{lang}.json: missing, and the error codes need it"
            )
            continue
        errors = json.loads(path.read_text()).get("errors")
        if not expect(f"locales/{lang}.json.errors", errors, dict):
            continue
        for code in sorted(declared - set(errors)):
            failures.append(
                f"locales/{lang}.json.errors: `{code}` is answered by a command but has no "
                f"translation — the screen would show the manifest's English"
            )
        for code in sorted(set(errors) - declared):
            failures.append(
                f"locales/{lang}.json.errors: `{code}` is translated but this module neither "
                f"emits nor declares it — a sentence for a code that does not exist"
            )


def check_events_and_slots(m: dict) -> None:
    events = m.get("events", {})
    if expect("events", events, dict):
        listen = events.get("listen", {})
        if expect("events.listen", listen, dict):
            for topic, listener in listen.items():
                path = f"events.listen.{topic}"
                if expect(path, listener, dict):
                    field(path, listener, "command", str, required=True)
        string_array("events.emits", events.get("emits", []))

    slots = m.get("provides_slots", [])
    if expect("provides_slots", slots, list):
        for i, slot in enumerate(slots):
            path = f"provides_slots[{i}]"
            if not expect(path, slot, dict):
                continue
            field(path, slot, "slot", str, required=True)
            field(path, slot, "component", str, required=True)
            field(path, slot, "permission", str)
            field(path, slot, "priority", int)

    if "ui" in m and expect("ui", m["ui"], dict):
        field("ui", m["ui"], "entry", str, required=True)

    if "agent" in m and expect("agent", m["agent"], dict):
        field("agent", m["agent"], "description", str, required=True)
        string_array("agent.keywords", m["agent"].get("keywords", []))


def check_scheduled_tasks(m: dict) -> None:
    """The block that shipped broken in v2.2.10 (tables#28).

    `catch_up` is a STRING enum, not a flag. A boolean here aborts `Manifest::load`, and with it
    the whole install — so this assertion is the one that must never go soft.
    """
    tasks = m.get("scheduled_tasks", [])
    if not expect("scheduled_tasks", tasks, list):
        return
    for i, task in enumerate(tasks):
        path = f"scheduled_tasks[{i}]"
        if not expect(path, task, dict):
            continue
        field(path, task, "name", str, required=True)
        field(path, task, "command", str, required=True)
        field(path, task, "cron", str, required=True)
        field(path, task, "payload", dict)
        if "catch_up" in task:
            if isinstance(task["catch_up"], bool):
                failures.append(
                    f"{path}.catch_up: {task['catch_up']!r} is a boolean — the contract is the "
                    f"string enum {list(CATCH_UP_VALUES)} (ADR-0011). This is tables#28: a "
                    f"boolean here makes the module impossible to install on ANY hub."
                )
            else:
                expect(f"{path}.catch_up", task["catch_up"], str, CATCH_UP_VALUES)

        command = task.get("command")
        if isinstance(command, str):
            if command not in m.get("commands", {}):
                failures.append(
                    f"{path}.command: {command!r} is not declared in `commands`"
                )
            if not command.startswith(f"{m.get('id')}."):
                failures.append(
                    f"{path}.command: {command!r} does not belong to this module"
                )


def check_unknown_top_level(m: dict) -> None:
    for key in sorted(set(m) - KNOWN_TOP_LEVEL):
        warnings.append(
            f"{key}: not a block this test knows about — the canonical schema declares "
            f"`additionalProperties: false`, so either it is a typo or this list is stale"
        )


# ── Layer 2: the canonical JSON Schema, when it is reachable ─────────────────────────────


SCHEMA_REL = "schemas/module.schema.json"
SCHEMA_REF = os.environ.get("ERPLORA_MODULE_SCHEMA_REF", "origin/develop")

# Set to False as soon as the canonical schema is actually applied, so the final line can say so.
# A run where layer 2 quietly did nothing must not read like a full green.
schema_applied = False


def hub_checkout() -> pathlib.Path:
    """Dev workspace layout: <root>/modules-workspace/modules/<id>/ next to <root>/hub/."""
    return MODULE_DIR.parents[2] / "hub"


def schema_from_git() -> tuple[str, str] | None:
    """Read the schema from the hub's `origin/develop` — the branch the contract lives on.

    inventory#31: a hub working tree parked on an older branch carries an older schema that can
    reject a manifest which is in fact correct. Reading the blob out of git sidesteps whatever the
    checkout happens to have on disk. Returns (label, text) or None.
    """
    hub = hub_checkout()
    if not (hub / ".git").exists():
        return None
    res = subprocess.run(
        ["git", "-C", str(hub), "show", f"{SCHEMA_REF}:{SCHEMA_REL}"],
        capture_output=True,
        text=True,
    )
    if res.returncode != 0:
        return None
    return f"{hub}@{SCHEMA_REF}:{SCHEMA_REL}", res.stdout


def canonical_schema_source() -> tuple[str, str] | None:
    """(label, text) of the schema to validate against, most authoritative first."""
    override = os.environ.get("ERPLORA_MODULE_SCHEMA")
    if override:
        path = pathlib.Path(override)
        return (str(path), path.read_text()) if path.exists() else None

    from_git = schema_from_git()
    if from_git is not None:
        return from_git

    working_tree = hub_checkout() / SCHEMA_REL
    if working_tree.exists():
        return str(working_tree), working_tree.read_text()
    return None


def check_against_canonical_schema(m: dict) -> None:
    global schema_applied
    try:
        import jsonschema
    except ImportError:
        notes.append(
            "SKIPPED canonical schema: `jsonschema` is not installed (pip install jsonschema)"
        )
        return

    source = canonical_schema_source()
    if source is None:
        notes.append(
            f"SKIPPED canonical schema: could not reach {SCHEMA_REL} — no {SCHEMA_REF} in the "
            f"sibling hub checkout ({hub_checkout()}) and no ERPLORA_MODULE_SCHEMA set. "
            f"Fix: `git -C <hub> fetch origin`, or point ERPLORA_MODULE_SCHEMA at the file."
        )
        return

    label, text = source
    try:
        schema = json.loads(text)
    except json.JSONDecodeError as exc:
        notes.append(f"SKIPPED canonical schema: {label} is not valid JSON ({exc})")
        return

    validator = jsonschema.Draft202012Validator(schema)
    schema_applied = True
    notes.append(f"canonical schema applied: {label}")
    for err in sorted(validator.iter_errors(m), key=lambda e: list(e.absolute_path)):
        where = "/".join(str(p) for p in err.absolute_path) or "<root>"
        failures.append(f"[schema] {where}: {err.message}")


# ── Layer 3: everything the manifest points at is in the package ─────────────────────────


def check_declared_files_exist(m: dict) -> None:
    declared: list[tuple[str, str]] = []

    for block in ("migrations", "seed"):
        for dialect, files in (m.get(block) or {}).items():
            # `migration_files` reads BOTH shapes. Filtering to `isinstance(f, str)` here, which is
            # what this did before, meant a `{ file, kind: "contract" }` entry pointing at a file
            # that is NOT in the package was never checked at all — the one entry shape that ships
            # a DROP was also the one nobody verified existed.
            declared += [(f"{block}.{dialect}", f) for f in migration_files(files)]

    for name, q in (m.get("queries") or {}).items():
        for key in ("sql", "schema"):
            if isinstance(q, dict) and isinstance(q.get(key), str):
                declared.append((f"queries.{name}.{key}", q[key]))

    for name, c in (m.get("commands") or {}).items():
        if not isinstance(c, dict):
            continue
        for rel in c.get("sql") or []:
            if isinstance(rel, str):
                declared.append((f"commands.{name}.sql", rel))
        if isinstance(c.get("schema"), str):
            declared.append((f"commands.{name}.schema", c["schema"]))
        handler = c.get("handler")
        if isinstance(handler, dict) and isinstance(handler.get("file"), str):
            declared.append((f"commands.{name}.handler.file", handler["file"]))

    # The bundle is BUILT from `ui/components/`: before the first component exists there is
    # nothing to build, so only its shape is pinned; from the first component on, it must exist.
    entry = (m.get("ui") or {}).get("entry") if isinstance(m.get("ui"), dict) else None
    if isinstance(entry, str):
        expected = f"dist/{MODULE_ID}.esm.js"
        if entry != expected:
            failures.append(
                f"ui.entry: `{entry}` — `erplora build` writes `{expected}`, so the shell would "
                f"load a file the package never carries"
            )
        components = MODULE_DIR / "ui" / "components"
        has_component = components.is_dir() and any(
            p.is_dir() for p in components.iterdir()
        )
        if has_component:
            declared.append(("ui.entry", entry))
    if isinstance(m.get("settings"), dict) and isinstance(
        m["settings"].get("schema"), str
    ):
        declared.append(("settings.schema", m["settings"]["schema"]))

    for where, rel in declared:
        if not (MODULE_DIR / rel).exists():
            failures.append(f"{where}: declares `{rel}`, which is not in the package")




# ── Layer 4: cross-references ────────────────────────────────────────────────────────────


def used_permissions(m: dict) -> list[tuple[str, str]]:
    """Every (where, permission) the manifest names outside `permissions` itself."""
    used: list[tuple[str, str]] = []
    for block in ("queries", "commands"):
        for name, spec in (m.get(block) or {}).items():
            if isinstance(spec, dict) and isinstance(spec.get("permission"), str):
                used.append((f"{block}.{name}.permission", spec["permission"]))
    for i, entry in enumerate(m.get("navigation") or []):
        if isinstance(entry, dict) and isinstance(entry.get("permission"), str):
            used.append((f"navigation[{i}].permission", entry["permission"]))
    for wid, widget in (m.get("widgets") or {}).items():
        if isinstance(widget, dict) and isinstance(widget.get("permission"), str):
            used.append((f"widgets.{wid}.permission", widget["permission"]))
    for role, perms in (m.get("role_permissions") or {}).items():
        for perm in perms if isinstance(perms, list) else []:
            if perm != "*":
                used.append((f"role_permissions.{role}", perm))
    return used


def check_permissions_declared(m: dict) -> None:
    """A permission nobody declared is a permission nobody can ever hold: the query answers 403 to
    everyone, the tab is hidden from everyone, and nothing fails at install time to say so."""
    declared = set(m.get("permissions") or [])
    for where, perm in used_permissions(m):
        if perm not in declared:
            failures.append(
                f"{where}: `{perm}` is not declared in `permissions` — nobody can ever hold it"
            )
    for perm in sorted(declared):
        if not perm.startswith(f"{MODULE_ID}."):
            failures.append(f"permissions: `{perm}` is outside this module's namespace")


def check_named_operations_exist(m: dict) -> None:
    """`settings`, `widgets` and `navigation` are TRANSPORTED blocks: the runtime does not resolve
    the names in them, the shell does, at the moment a screen is painted. A dangling name there
    does not fail an install — it shows an empty settings tab or a widget that never loads."""
    queries = set(m.get("queries") or {})
    commands = set(m.get("commands") or {})
    emits = set((m.get("events") or {}).get("emits") or [])

    settings = m.get("settings")
    if isinstance(settings, dict):
        get, set_ = settings.get("get"), settings.get("set")
        if isinstance(get, str) and get not in queries:
            failures.append(f"settings.get: `{get}` is not a query of this module")
        if isinstance(set_, str) and set_ not in commands:
            failures.append(f"settings.set: `{set_}` is not a command of this module")
        if isinstance(get, str) and get in queries and "list" in m["queries"][get]:
            failures.append(
                f"settings.get: `{get}` declares a `list` block — the shell reads ONE row"
            )
        if isinstance(set_, str) and set_ in commands and isinstance(settings.get("schema"), str):
            if m["commands"][set_].get("schema") != settings["schema"]:
                failures.append(
                    "settings.schema must be the same file as the `set` command's schema: the "
                    "form the shell paints and the payload the command accepts cannot drift"
                )

    for wid, widget in (m.get("widgets") or {}).items():
        if not isinstance(widget, dict):
            continue
        if not wid.startswith(f"{MODULE_ID}."):
            failures.append(f"widgets.{wid}: the id must be namespaced `{MODULE_ID}.<name>`")
        query = widget.get("query")
        if isinstance(query, str) and query not in queries:
            failures.append(f"widgets.{wid}.query: `{query}` is not a query of this module")
        for event in widget.get("refresh_on") or []:
            if event.startswith(f"{MODULE_ID}.") and event not in emits:
                failures.append(
                    f"widgets.{wid}.refresh_on: `{event}` is never emitted by this module, so "
                    f"the widget would never refresh on it"
                )

    for i, entry in enumerate(m.get("navigation") or []):
        if isinstance(entry, dict) and isinstance(entry.get("component"), str):
            component = entry["component"]
            if not component.startswith(f"erp-{MODULE_ID}-"):
                failures.append(
                    f"navigation[{i}].component: `{component}` is not this module's element "
                    f"(`erp-{MODULE_ID}-…`)"
                )

    for name, spec in (m.get("commands") or {}).items():
        if not isinstance(spec, dict):
            continue
        public = not name.split(".")[-1].startswith("_")
        if public and not isinstance(spec.get("schema"), str):
            failures.append(
                f"commands.{name}: a public command (no `_` prefix) needs a payload `schema`"
            )
        for event in spec.get("emit") or []:
            if event not in emits:
                failures.append(
                    f"commands.{name}.emit: `{event}` is not in `events.emits` — the runtime "
                    f"fails the whole command when that happens"
                )


def check_navigation_locales(m: dict) -> None:
    """Every navigation label ships in EN (source) and ES (ADR-0055)."""
    nav_ids = [e.get("id") for e in m.get("navigation") or [] if isinstance(e, dict)]
    for lang in ("en", "es"):
        path = MODULE_DIR / "locales" / f"{lang}.json"
        if not path.exists():
            failures.append(f"locales/{lang}.json: missing")
            continue
        data = json.loads(path.read_text())
        for key in ("name", "description"):
            if not isinstance(data.get(key), str) or not data[key].strip():
                failures.append(f"locales/{lang}.json: `{key}` is missing or empty")
        nav = data.get("navigation") or {}
        for nav_id in nav_ids:
            label = (nav.get(nav_id) or {}).get("label") if isinstance(nav, dict) else None
            if not isinstance(label, str) or not label.strip():
                failures.append(
                    f"locales/{lang}.json: `navigation.{nav_id}.label` is missing — the menu "
                    f"would fall back to the manifest's English"
                )


# ── Runner ───────────────────────────────────────────────────────────────────────────────


def main() -> int:
    raw = MANIFEST_PATH.read_text()
    try:
        manifest = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"FAILED — module.json is not valid JSON: {exc}")
        return 1

    check_identity(manifest)
    check_permissions(manifest)
    check_navigation(manifest)
    check_sql_blocks(manifest)
    check_events_and_slots(manifest)
    check_scheduled_tasks(manifest)
    check_error_catalog(manifest)
    check_error_locales(manifest)
    check_unknown_top_level(manifest)
    check_against_canonical_schema(manifest)
    check_declared_files_exist(manifest)
    check_permissions_declared(manifest)
    check_named_operations_exist(manifest)
    check_navigation_locales(manifest)

    for note in notes:
        print(f"  · {note}")
    for warning in warnings:
        print(f"  ! {warning}")
    print()

    if failures:
        print(f"FAILED — {len(failures)} contract violation(s) in module.json:")
        for f in failures:
            print(f"  - {f}")
        return 1
    layer2 = (
        "canonical schema applied"
        if schema_applied
        else "canonical schema SKIPPED, see above"
    )
    print(
        f"PASS — module.json v{manifest.get('version')} parses the way the runtime parses it "
        f"and every name it uses resolves ({layer2})"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
