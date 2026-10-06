-- attendance.records.list: every working day of this hub (managers, attendance.view_all).
-- There is no name column: people are resolved in the UI through the core hub.users.list.
-- local_date is the business calendar day of clock_in_at, read in :timezone (the hub's IANA zone),
-- never the UTC date part: between local midnight and the UTC offset that answered yesterday
-- (same idiom as staff/queries/members_stats.sql). The COALESCE degrades to UTC like the runtime.
-- breaks_closed_minutes sums the CLOSED breaks only. A running break has no end yet and the UI
-- adds it live from attendance.breaks.mine / attendance.breaks.list.
SELECT r.id,
       r.user_id,
       r.clock_in_at,
       r.clock_out_at,
       r.status,
       r.source,
       r.in_distance_m,
       r.in_within_radius,
       r.out_distance_m,
       r.out_within_radius,
       r.note,
       CAST(CAST(erp_dt(r.clock_in_at) AT TIME ZONE COALESCE(NULLIF(TRIM(CAST(:timezone AS TEXT)), ''), 'UTC') AS DATE) AS TEXT) AS local_date,
       (SELECT COUNT(*)
          FROM attendance_break b
         WHERE b.hub_id = :hub_id AND b.record_id = r.id AND b.is_deleted = 0) AS break_count,
       (SELECT CAST(COALESCE(SUM(erp_extract('epoch', b.ended_at) - erp_extract('epoch', b.started_at)), 0) AS BIGINT) / 60
          FROM attendance_break b
         WHERE b.hub_id = :hub_id AND b.record_id = r.id
           AND b.ended_at IS NOT NULL AND b.is_deleted = 0) AS breaks_closed_minutes
FROM attendance_record r
WHERE r.hub_id = :hub_id
  AND r.is_deleted = 0
