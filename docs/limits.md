# Time clock — Limits and troubleshooting

## Known limitations

- **No PDF report yet.** The records screen exports CSV; a signable monthly PDF is not available
  (attendance#3).
- **One workplace per business.** There is a single workplace location and radius; multi-site
  businesses cannot set one per store yet (attendance#4).
- **No Labour Inspectorate API.** The Spanish digital-record regulation (immutable record, remote
  access for the Inspectorate) has not been approved as of October 2026; there is no export
  channel to the Inspectorate beyond the CSV (attendance#5).
- **The radius trusts the device's GPS.** The distance is measured on the device and the server
  accepts what it reports, like Square and Factorial. A tampered device can report a false
  position. The device mode (shared / personal) is also reported by the client; a server-side
  device signal is tracked in hub#2554.
- **No «Clock in» button in the POS header yet.** Clocking in is done from the module's own
  screen (hub#2553).
- **Installed app on older Hubs counts as shared.** With a Hub whose SDK exposes the device mode
  (hub#2584) the module uses it; older Hubs fall back to the HTTP door, which in the installed app
  answers `shared`, so the radius only applies in the browser there.
- **No automatic purge after four years.** Records are kept; nothing is archived or deleted yet
  (attendance#7).
- **No pay or overtime.** Hours are not crossed with rates, contracts or the `staff` module
  (attendance#6).
- **A correction only touches the break left running.** When a correction sets a clock-out, a
  break still running in that day is closed at the new clock-out (or at its own start if it began
  later). Breaks that already ended are left as they were, even if they end after the new
  clock-out or start before the new clock-in: check and adjust the times so they fit.
- **Correction times are UTC.** A correction is sent as UTC (`2026-10-06T08:00:00.000Z`, what the
  screen sends); a time with an offset (`+02:00`) is refused. The screen converts the local time
  you type into UTC before sending.
- **Correcting needs the team view.** A role with `attendance.correct` but without
  `attendance.view_all` does not see **Correct**: grant both to whoever corrects working days.
- **Employees cannot see the correction history of their own days yet.** They see the corrected
  times, but the trail (who, when, before → after, reason) is only shown to `attendance.view_all`
  (attendance#8).
- **A forgotten clock-out is flagged, not guessed.** The day becomes **needs review**; no
  clock-out time is invented. A manager sets it with a correction.
- **No alert when a day is flagged for review.** The 15-minute check marks the day silently: there
  is no event to start an automation from («when a day needs review → tell the manager»), and the
  «Clocked in now» widget and the records screen catch up on the next clock-in, clock-out or
  correction, or when reopened. The Hub cannot yet send an event only for the days a check
  actually flags; until it can (hub#2612, attendance#15) the module sends none rather than one
  every 15 minutes with nothing in it (attendance#13).
- **A correction cannot overlap another working day of the same person.** The new hours may touch
  another day (start the instant it ended) but not run into it; an open day counts up to now, and a
  day that needs review counts only at its clock-in. The screen says so before saving
  (attendance#12).

## Refusals you will see

| Situation | Code | What to do |
|---|---|---|
| Clocking in with a working day already open, or from a personal device outside the radius (or without a measured position) when location is required | `attendance.clock_in_rejected` | Clock out first, move inside the radius, or clock in from the shared POS |
| Clocking out with no open working day | `attendance.no_open_record` | Nothing to close; check the records list |
| Starting a break with no open day, or with a break already running | `attendance.break_rejected` | Clock in first, or end the running break |
| Ending a break when none is running | `attendance.no_open_break` | Nothing to end |
| Correcting a day that does not exist, with a clock-out not after the clock-in, with hours that overlap another working day of the same person, or reopening it while the person has another open day | `attendance.record_not_found` | Check the times against the person's other days; close the other open day first |
| Saving the settings fails | `attendance.settings_not_saved` | Try again |
