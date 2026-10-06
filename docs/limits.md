# Time clock — Limits and troubleshooting

## Known limitations

- **No PDF report yet.** The records screen exports CSV; a signable monthly PDF is not available.
- **One workplace per business.** There is a single workplace location and radius; multi-site
  businesses cannot set one per store yet.
- **No Labour Inspectorate API.** The Spanish digital-record regulation (immutable record, remote
  access for the Inspectorate) has not been approved as of October 2026; there is no export
  channel to the Inspectorate beyond the CSV.
- **The radius trusts the device's GPS.** The distance is measured on the device and the server
  accepts what it reports, like Square and Factorial. A tampered device can report a false
  position. The device mode (shared / personal) is also reported by the client.
- **No automatic purge after four years.** Records are kept; nothing is archived or deleted yet.
- **No pay or overtime.** Hours are not crossed with rates or contracts.
- **A correction only touches the break left running.** When a correction sets a clock-out, a
  break still running in that day is closed at the new clock-out (or at its own start if it began
  later). Breaks that already ended are left as they were, even if they end after the new
  clock-out or start before the new clock-in: check and adjust the times so they fit.
- **Correction times are UTC.** A correction is sent as UTC (`2026-10-06T08:00:00.000Z`, what the
  screen sends); a time with an offset (`+02:00`) is refused. The screen converts the local time
  you type into UTC before sending.
- **A forgotten clock-out is flagged, not guessed.** The day becomes **needs review**; no
  clock-out time is invented. A manager sets it with a correction.

## Refusals you will see

| Situation | Code | What to do |
|---|---|---|
| Clocking in with a working day already open, or from a personal device outside the radius (or without a measured position) when location is required | `attendance.clock_in_rejected` | Clock out first, move inside the radius, or clock in from the shared POS |
| Clocking out with no open working day | `attendance.no_open_record` | Nothing to close; check the records list |
| Starting a break with no open day, or with a break already running | `attendance.break_rejected` | Clock in first, or end the running break |
| Ending a break when none is running | `attendance.no_open_break` | Nothing to end |
| Correcting a day that does not exist, with a clock-out not after the clock-in, or reopening it while the person has another open day | `attendance.record_not_found` | Check the times; close the other open day first |
| Saving the settings fails | `attendance.settings_not_saved` | Try again |
