# Time clock — Screens

## Clock in (`/m/attendance/clock`)

1. Open **Time clock → Clock in**. The screen shows your name and the local time.
2. **Not clocked in:** tap the big **Clock in** button.
   - If the business requires a location and you are on a **personal** device, the screen first
     asks the browser for your position, shows how far you are from the workplace and only clocks
     you in when you are inside the allowed radius. Denying the location permission, being outside
     the radius or a workplace without coordinates blocks the clock-in with a message, and nothing
     is sent.
   - On the **shared** counter POS no location is ever asked.
3. **Clocked in:** a timer runs since your clock-in. Use **Start break** / **End break** for breaks
   and **Clock out** at the end of the day (a running break is ended for you).
4. Below, **Today** shows the time worked and the breaks of the day, and the list shows your last
   working days with their status (**open**, **closed**, **needs review**).

## Records (`/m/attendance/records`)

- **Employees** see their own working days.
- **Managers** (`attendance.view_all`) see everybody's, filtered by person, month and status.
- Columns: local date, person, clock-in, clock-out, break minutes, time worked, status and whether
  the clock-in/out was inside the radius.
- **Correct** (managers with `attendance.correct`): change the clock-in and/or clock-out and write
  the reason (mandatory, at least 3 characters). The clock-out must be after the clock-in. Leaving
  the clock-out empty reopens the day. **Correct** lives in the team view, so a role needs
  `attendance.view_all` as well: with `attendance.correct` alone the button is not shown.
- **History** (managers with `attendance.view_all`): every correction of a working day — who,
  when, before → after, and the reason. A correction made by the system (a scheduled task) shows
  **System** as its author.
- **Month**: the current month and the 48 before it (the four years the records are kept).
- **Export CSV**: the current filter as `attendance-YYYY-MM.csv`.

## Settings (module Settings tab)

- **Require location when clocking in from a personal device** (off by default).
- **Allowed radius**: 50, 100, 250, 500 or 1000 metres.
- **Workplace latitude / longitude**, or **Use my current location** to fill them from the device.
  With location required and no workplace set, nobody on a personal device can clock in — the
  screen warns about it.
- **Flag open days for review after** 1–24 hours (12 by default).
