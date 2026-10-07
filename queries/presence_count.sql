-- attendance.presence.count: how many people are clocked in right now in THIS hub (one row,
-- column value). Feeds the attendance.clocked_in_now dashboard widget. A needs_review day is not
-- counted: the person forgot to clock out, nobody knows whether they are still there.
SELECT COUNT(*) AS value
FROM attendance_record
WHERE hub_id = :hub_id
  AND status = 'open'
  AND is_deleted = 0
