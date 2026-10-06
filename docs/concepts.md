# Time clock — Concepts

## Working day (record)

One row per working day (`attendance_record`), the session model used by Odoo, Square and Toast:
`clock_in_at` when the person clocks in, `clock_out_at` when they clock out. Status:

- **open** — clocked in, not yet out. A person has **at most one** open working day; the database
  enforces it with a partial unique index, so even two simultaneous taps create only one.
- **closed** — clocked out, or closed by a correction.
- **needs_review** — still open after the configured number of hours (12 by default): the person
  probably forgot to clock out. It no longer blocks clocking in again; a manager closes it with a
  correction. The check runs every 15 minutes.

Working days are never deleted: there is no delete action, as the law asks for four years of
records.

## Break

A pause inside a working day (`attendance_break`): `started_at`, and `ended_at` once it ends. At
most one break runs at a time. Clocking out ends the running break. Correcting a day with a
clock-out also ends a break left running in it (at the new clock-out, or at its own start if it
began later).

## Correction

A manager's change to the clock-in/clock-out of a working day (`attendance_correction`). Every
correction is a new, immutable row with the **old** values, the **new** values, the **reason**
(mandatory), who made it and when. A correction whose clock-out is not after its clock-in is
refused and leaves no trace. Reopening a day (no clock-out) is refused while the same person
already has another open day.

## Device source

Each clock-in records the mode of the device it came from, as answered by the Hub
(`GET /api/device/mode`):

- **shared** — the counter POS everyone uses. Never asked for a location.
- **personal** — the worker's own phone or laptop. Subject to the radius when location is required.

## Location: what is stored and when

Nothing is stored unless the business turns **Require location** on and the clock-in comes from a
personal device. Then the device measures its position, the screen computes the distance to the
workplace, and the clock-in/clock-out stores latitude, longitude, accuracy, distance (metres) and
whether it was inside the radius (`in_*` / `out_*` columns). The server trusts the distance the
device reports, as Square and Factorial do: the GPS is the device's anyway.

## Durations

Every timestamp is stored as UTC text: the Hub writes clock-ins, clock-outs and breaks as
`…+00:00`, and a correction is accepted only in UTC `…Z` form. Because they are all UTC, sorting and
date-range filters on the text are in time order. A correction with an impossible date
(`2026-02-30`) is refused like any other invalid correction.

Queries return timestamps (RFC 3339, UTC) plus two helpers per working day:

- `local_date` — the business calendar day of the clock-in, read in the Hub's timezone (a clock-in
  at 23:30 UTC in Madrid belongs to the next day).
- `break_count` and `breaks_closed_minutes` — number of breaks, and the whole minutes of the
  **closed** ones. The Hub's SQL shim supports `erp_extract('epoch', …)`, so this sum is computed
  in SQL. A running break has no end yet: the screens add it live from the breaks query.

Time worked is computed in the screen: clock-out (or now) minus clock-in minus breaks.
