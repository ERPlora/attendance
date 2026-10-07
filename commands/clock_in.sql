-- attendance.clock_in: opens the caller's working day. Inserts 0 rows (and the guard answers
-- attendance.clock_in_rejected) when:
--   * the caller already has an OPEN working day in this hub, or
--   * location is required, the device is personal, and the client did not report being inside
--     the radius (within_radius NULL or 0). A shared device (the counter POS) is never blocked.
-- A needs_review day does NOT block: the guard looks at status = 'open' only.
-- The distance is the one the CLIENT measured (the GPS is the client's anyway, as in Square and
-- Factorial). ON CONFLICT on the partial unique index turns a double-tap race into 0 rows, so the
-- loser gets the same domain code instead of a unique-violation 500.
-- Every bind that can arrive NULL carries the SAME cast at every appearance: Postgres fixes a
-- bind's type at its first use, and two different deductions fail the PREPARE.
INSERT INTO attendance_record
  (id, hub_id, user_id, clock_in_at, status, source,
   in_lat, in_lng, in_accuracy_m, in_distance_m, in_within_radius,
   note, is_deleted, created_by, updated_by, created_at, updated_at)
SELECT :new_id, :hub_id, :current_user_id, CAST(:now AS TEXT), 'open', CAST(:source AS TEXT),
       :lat, :lng, :accuracy_m, :distance_m, CAST(:within_radius AS BIGINT),
       '', 0, :current_user_id, :current_user_id, CAST(:now AS TEXT), CAST(:now AS TEXT)
WHERE NOT EXISTS (
        SELECT 1
          FROM attendance_record o
         WHERE o.hub_id = :hub_id
           AND o.user_id = :current_user_id
           AND o.status = 'open'
           AND o.is_deleted = 0)
  AND (COALESCE((SELECT s.require_location
                   FROM attendance_settings s
                  WHERE s.hub_id = :hub_id AND s.is_deleted = 0), 0) = 0
       OR CAST(:source AS TEXT) = 'shared'
       OR COALESCE(CAST(:within_radius AS BIGINT), 0) = 1)
ON CONFLICT (hub_id, user_id) WHERE status = 'open' AND is_deleted = 0 DO NOTHING
