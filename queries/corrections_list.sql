-- attendance.corrections.list: the trail of corrections (old values, new values, reason, who and
-- when). Filtered by record_id from the History action of the records screen.
SELECT c.id,
       c.record_id,
       c.old_clock_in_at,
       c.old_clock_out_at,
       c.old_status,
       c.new_clock_in_at,
       c.new_clock_out_at,
       c.new_status,
       c.reason,
       c.created_by,
       c.created_at
FROM attendance_correction c
WHERE c.hub_id = :hub_id
  AND c.is_deleted = 0
