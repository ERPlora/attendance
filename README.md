# attendance — Control horario (registro de jornada)

Módulo ERPlora para que cada empleado fiche la entrada y la salida con un toque, con pausas, y para
que el encargado vea, corrija (con motivo obligatorio y rastro) y exporte las jornadas. Cubre la
obligación del art. 34.9 ET (RDL 8/2019): registrar inicio y fin de cada jornada, conservarlo 4 años
y tenerlo accesible al trabajador y a la Inspección.

- Quien ficha es el **usuario del hub** de la sesión (PIN / placa NFC). No depende de `staff`.
- Una sola jornada **abierta** por persona (índice único parcial); las olvidadas pasan a
  `needs_review` tras N horas (12 por defecto) con una tarea cada 15 minutos.
- Nada se borra: no hay command de borrado; cada corrección guarda valores antiguos, nuevos y motivo.
- Ubicación **apagada por defecto**; al activarla, el radio bloquea solo los dispositivos
  **personales**, nunca el TPV compartido.

## Qué hay dentro

- `module.json` — manifest: permisos, queries, commands, tarea programada, ajustes y widget.
- `migrations/postgres/001_init.sql` — `attendance_record`, `attendance_break`,
  `attendance_correction`, `attendance_settings`.
- `queries/`, `commands/`, `schemas/` — SQL declarativo (Tier 0) y JSON Schema de cada payload.
- `ui/components/` — los Web Components (Lit): fichar, registros y ajustes.
- `locales/en.json` (fuente) + `locales/es.json`.
- `docs/` — documentación de usuario en inglés (la indexa el asistente).
- `fixtures/` — datos para `erplora dev`.
- `tests/` — contratos, batería contra Postgres real y batería contra el kernel.

## Comandos (desde `modules-workspace/`)

```sh
./node_modules/.bin/erplora validate attendance --pg
ERPLORA_TEST_PG_CONTAINER=erplora-test-pg-5433 ./node_modules/.bin/erplora test attendance
./node_modules/.bin/erplora test attendance --against-hub stable
./node_modules/.bin/erplora dev attendance
./node_modules/.bin/erplora build attendance
```
