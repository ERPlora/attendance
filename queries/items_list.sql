-- attendance.items.list — el runtime aplica search/sort/filtros/paginación (motor de listas)
-- e inyecta el bind :hub_id. Devuelve la página + total para el pager.
-- El FILTRO de tenancy lo escribe el módulo: el motor de listas no lo añade, y sin él la lista
-- devuelve filas de OTROS hubs allí donde la base de datos está compartida (module-toolkit#80).
SELECT id, name, code, amount, created_at
FROM attendance_items
WHERE hub_id = :hub_id AND is_deleted = 0;
