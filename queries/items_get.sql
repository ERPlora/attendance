-- attendance.items.get — acotado por hub: un id de otro hub no se lee desde aquí.
SELECT id, name, code, amount, created_at, updated_at
FROM attendance_items
WHERE hub_id = :hub_id AND id = :id AND is_deleted = 0;
