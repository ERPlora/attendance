# Time clock — Overview

The **Time clock** module (`attendance`) is the working-day record of the business: every employee
clocks in when they start, clocks out when they finish, and can take breaks in between. Managers see
everybody's records, correct mistakes with a mandatory reason, and export the month.

## What it does

- **One-tap clock in / clock out** for whoever is signed in on the device (PIN or NFC badge of the
  Hub user). There is nothing to pick: the person clocking in is the session user.
- **Breaks** inside a working day (start break / end break). Clocking out ends a running break.
- **A legal working-day record.** Spain's art. 34.9 of the Workers' Statute (RDL 8/2019) requires
  the start and end of every working day to be recorded, kept for four years and made available to
  the worker and to the Labour Inspectorate. Records are never deleted.
- **Corrections with a trail.** A manager can fix a clock-in or clock-out; every correction keeps the
  old values, the new values, who made it, when, and why.
- **Forgotten clock-outs are flagged.** A working day still open after a configurable number of
  hours (12 by default) is marked **needs review** so the person can clock in again the next day,
  and a manager closes it with a correction.
- **Optional workplace radius.** Off by default. When turned on, someone clocking in from a
  **personal** device (their own phone or laptop) must be within the radius of the workplace. The
  **shared** counter POS is never asked for a location.
- **Dashboard widget** "Clocked in now" with the number of people currently clocked in.

## What it does not do

- It does not compute pay, overtime or hours against a contract (see `limits.md`).
- It does not manage shifts or rotas: a professional's shifts belong to the `staff` module
  (`schedules` holds the business opening hours).

## Relation with Hub users and `staff`

The person who clocks in is the **Hub user** of the session (core `hub_user`). Names are resolved
in the screens with the core query `hub.users.list`. The module does not depend on `staff`: a
business without the staff module still records working days. `staff_member.user_id` is the seam
if hours and costs are ever crossed.

## Who can do what

| Permission | Admin | Manager | Employee | Opens |
|---|---|---|---|---|
| `attendance.clock` | yes | yes | yes | clock in/out, breaks, own records, read settings |
| `attendance.view_all` | yes | yes | no | everybody's records, breaks, corrections, presence |
| `attendance.correct` | yes | yes | no | correct a working day |
| `attendance.manage_settings` | yes | yes | no | save the settings |
