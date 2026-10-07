"""Plumbing shared by the `*.hub.test.py` batteries — the ones that talk to a REAL kernel.

Ported from `tables/tests/hub_harness.py` (itself from `sales`, ERPlora/hub#1264).
`erplora test <dir> --against-hub` (module-toolkit#110) starts the published hub image with its own
Postgres, installs the module through `POST /api/modules/install` and hands the url over in
`ERPLORA_HUB_BASE_URL`. Everything below is the thin layer between a battery and that runtime: the
two doors (`/api/query`, `/api/command`), the error envelope, and a `check()` that records a failure
instead of dying on it, so a red run names EVERY broken assertion and not just the first.

Two facts of the runtime a battery has to know, both resolved here:

  * THE TENANT. Requests go out under the RUNTIME's own `hub_id` (`GET /api/hub/context`), not
    under an invented one (hub#594).
  * THE SESSION USER. Dev auth trusts `X-User-Id`. Each run mints its own users, because batteries
    share one hub for the length of the run — and `attendance` keys everything on the session
    user (`:current_user_id`), so a fresh user per scenario is a fresh clock.
  * THE SESSION PERMISSIONS. Dev auth has no role to resolve: it trusts `X-Permissions` (a comma
    list) and, without the header, grants `*`. So a ROLE cannot be attached to a dev user — what a
    battery CAN attach is the permission set that role resolves to (`as_user(…, permissions=…)`,
    read from the manifest's `role_permissions`), which is what the kernel gates on.

It refuses to skip. Without a runtime a battery FAILS: a check that excuses itself is the green that
proves nothing (module-toolkit#50).
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
import uuid

BASE = (
    os.environ.get("ATTENDANCE_HUB_BASE_URL")
    or os.environ.get("ERPLORA_HUB_BASE_URL")
    or ""
).rstrip("/")


class Hub:
    """One battery's view of the live runtime."""

    def __init__(
        self, battery: str, needs: tuple[str, ...] = ("attendance",)
    ):
        self.battery = battery
        self.failures: list[str] = []
        if not BASE:
            print(
                f"{battery}: no runtime at the other end "
                "(ATTENDANCE_HUB_BASE_URL / ERPLORA_HUB_BASE_URL is empty)."
            )
            print(
                "Run it with `erplora test <dir> --against-hub`; without a hub this is NOT a skip, "
                "it is a failure."
            )
            sys.exit(1)
        self.user = new_user()
        self.permissions: list[str] | None = None
        self.hub_id = self._runtime_hub_id()
        self._require_installed(needs)

    # ── transport ────────────────────────────────────────────────────────────────────────

    def as_user(self, user: str, permissions: list[str] | None = None) -> "Hub":
        """Every request from now on goes out as `user` (dev auth trusts `X-User-Id`) holding
        `permissions` (`X-Permissions`); `None` sends no header, which dev auth reads as `*`."""
        self.user = user
        self.permissions = permissions
        return self

    def _request(self, method: str, path: str, body=None):
        data = None if body is None else json.dumps(body).encode()
        headers = {
            "content-type": "application/json",
            "x-hub-id": self.hub_id,
            "x-user-id": self.user,
        }
        if self.permissions is not None:
            headers["x-permissions"] = ",".join(self.permissions)
        req = urllib.request.Request(
            f"{BASE}{path}", data=data, headers=headers, method=method
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as res:
                return res.status, json.loads(res.read().decode() or "null")
        except urllib.error.HTTPError as err:
            raw = err.read().decode()
            try:
                return err.code, json.loads(raw or "null")
            except json.JSONDecodeError:
                return err.code, {"raw": raw}

    def _runtime_hub_id(self) -> str:
        req = urllib.request.Request(f"{BASE}/api/hub/context", method="GET")
        with urllib.request.urlopen(req, timeout=60) as res:
            body = json.loads(res.read().decode())
        hub_id = body.get("hub_id")
        if not hub_id:
            print(
                f"{self.battery}: GET /api/hub/context did not say the hub_id: {body}"
            )
            sys.exit(1)
        return hub_id

    def _require_installed(self, needs: tuple[str, ...]) -> None:
        status, body = self._request("GET", "/api/modules")
        installed = (
            {m["id"] for m in (body or {}).get("data", [])} if status == 200 else set()
        )
        missing = [m for m in needs if m not in installed]
        if missing:
            print(
                f"{self.battery}: the runtime at {BASE} does not have {missing} installed "
                f"(installed: {sorted(installed)}). Not a skip: nothing below can be trusted "
                "without the module installed through the same door a real hub uses."
            )
            sys.exit(1)

    # ── the two doors ────────────────────────────────────────────────────────────────────

    def query(self, name: str, params: dict | None = None) -> list:
        """Rows of a query. A query with a `list` block answers `{rows,total,…}`; the rest answer
        the bare array. Both come back as the list of rows."""
        status, body = self._request(
            "POST", "/api/query", {"name": name, "params": params or {}}
        )
        if status != 200 or not (body or {}).get("ok"):
            raise AssertionError(f"query {name} answered {status}: {body}")
        data = body["data"]
        if isinstance(data, dict) and "rows" in data:
            return data["rows"]
        return data

    def page(self, name: str, params: dict | None = None) -> dict:
        """The whole page of a `list` query, `total` included."""
        status, body = self._request(
            "POST", "/api/query", {"name": name, "params": params or {}}
        )
        if status != 200 or not (body or {}).get("ok"):
            raise AssertionError(f"query {name} answered {status}: {body}")
        return body["data"]

    def command(self, name: str, payload: dict):
        """`(status, body)` of a command, whatever the runtime answered."""
        return self._request("POST", "/api/command", {"name": name, "payload": payload})

    def run(self, name: str, payload: dict) -> dict:
        """A command that MUST succeed. Its `data` (`operations`, `new_ids`, …)."""
        status, body = self.command(name, payload)
        if status != 200 or not (body or {}).get("ok"):
            raise AssertionError(f"command {name} answered {status}: {body}")
        return body["data"]

    def refused(self, label: str, name: str, payload: dict, code: str) -> None:
        """The runtime must REFUSE the command with exactly this domain code — the code, never the
        prose (ADR-0398 §6): the till translates the code, nobody reads the sentence."""
        status, body = self.command(name, payload)
        got = (
            ((body or {}).get("error") or {}).get("code")
            if isinstance(body, dict)
            else None
        )
        if status == 200:
            self.failures.append(
                f"{label} — expected refusal `{code}`, the command SUCCEEDED: {body}"
            )
            print(f"  FAIL: {label} — expected refusal `{code}`, got success: {body}")
        elif got != code:
            self.failures.append(
                f"{label} — expected code [{code}], got [{got}] (HTTP {status}: {body})"
            )
            print(
                f"  FAIL: {label} — expected code [{code}], got [{got}] (HTTP {status})"
            )
        else:
            print(f"  ok: {label} refused with `{code}` (HTTP {status})")

    def denied(
        self, label: str, door: str, name: str, body: dict, codes: tuple[str, ...]
    ) -> None:
        """A query (`door="query"`) or command (`door="command"`) the session may NOT run: HTTP 403
        with one of `codes`. A command a manager could approve answers `requires_elevation` on a
        hub with hub#360 and `permission_denied` on an older one; a query is always the latter."""
        key = "params" if door == "query" else "payload"
        status, answer = self._request("POST", f"/api/{door}", {"name": name, key: body})
        got = (
            ((answer or {}).get("error") or {}).get("code")
            if isinstance(answer, dict)
            else None
        )
        if status == 403 and got in codes:
            print(f"  ok: {label} denied with `{got}` (HTTP 403)")
            return
        self.failures.append(
            f"{label} — expected HTTP 403 with one of {list(codes)}, got HTTP {status} [{got}]: {answer}"
        )
        print(f"  FAIL: {label} — expected 403 {list(codes)}, got HTTP {status} [{got}]")

    # ── bookkeeping ──────────────────────────────────────────────────────────────────────

    def check(self, label: str, got, want) -> None:
        if got != want:
            self.failures.append(f"{label} — expected [{want!r}], got [{got!r}]")
            print(f"  FAIL: {label} — expected [{want!r}], got [{got!r}]")
        else:
            print(f"  ok: {label} = {got!r}")

    def check_true(self, label: str, condition: bool, detail="") -> None:
        if not condition:
            self.failures.append(f"{label} — {detail}" if detail else label)
            print(f"  FAIL: {label} {detail}")
        else:
            print(f"  ok: {label}")

    def finish(self, verdict: str) -> int:
        print()
        if self.failures:
            print(f"✗ {self.battery}: {len(self.failures)} failure(s):")
            for f in self.failures:
                print(f"  - {f}")
            return 1
        print(f"✓ {self.battery}: {verdict}")
        return 0


def new_user() -> str:
    """A session user nobody else in this run (or a previous one) has used."""
    return f"u-{uuid.uuid4().hex[:8]}"
