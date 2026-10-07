-- attendance.break_end: ends the running break of the caller's OPEN working day.
-- Also the FIRST statement of attendance.clock_out, where touching 0 rows is normal (no break was
-- running), which is why clock_out anchors its guard on commands/clock_out.sql and not here.
UPDATE attendance_break
SET ended_at   = CAST(:now AS TEXT),
    updated_by = :current_user_id,
    updated_at = CAST(:now AS TEXT)
WHERE hub_id = :hub_id
  AND ended_at IS NULL
  AND is_deleted = 0
  AND record_id IN (
        SELECT r.id
          FROM attendance_record r
         WHERE r.hub_id = :hub_id
           AND r.user_id = :current_user_id
           AND r.status = 'open'
           AND r.is_deleted = 0)
