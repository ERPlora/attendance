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
- `ui/components/` — los Web Components (Lit) de las tres pantallas (abajo); `ui/lib/` — lógica
  compartida (modo del dispositivo, geolocalización, duraciones, errores, ajustes por defecto).
- `ui/testids.test.ts` — guarda del contrato `data-testid` de las tres pantallas (copiada de
  `modifiers`): un testid renombrado o un control sin testid pone la suite en rojo.
- `dist/` — bundle ESM, iconos, sello de frescura y versión de OutfitKit; se versiona y se regenera
  con `erplora build` antes de cada commit que toque `ui/` o `locales/`.
- `locales/en.json` (fuente) + `locales/es.json`.
- `docs/` — documentación de usuario en inglés (la indexa el asistente).
- `fixtures/` — datos para `erplora dev`.
- `tests/` — contratos, batería contra Postgres real y batería contra el kernel.

## Pantallas

| Pantalla | Componente | Dónde | Permiso | Qué hace |
|---|---|---|---|---|
| **Fichar** | `erp-attendance-clock` | menú «Clock in» | `attendance.clock` | Botón grande de entrada; dentro, cronómetro, pausa / fin de pausa y salida. Resumen de hoy (trabajado y pausas) y últimas jornadas. En un dispositivo personal con la ubicación exigida pide la posición y, si se deniega, no envía el fichaje. |
| **Registros** | `erp-attendance-records` | menú «Records» | `attendance.clock` (lo propio); `attendance.view_all` (todos) | Jornadas del mes por persona y estado, exportación CSV del filtro (`attendance-YYYY-MM.csv`) y, con `attendance.correct`, corrección con motivo obligatorio e historial de cambios por jornada. |
| **Ajustes** | `erp-attendance-settings` | ajustes del módulo | `attendance.clock` (solo lectura); `attendance.manage_settings` (cambiar) | Exigir ubicación en dispositivos personales, radio, coordenadas del centro («Use my current location») y horas tras las que una jornada abierta se marca «needs review» (no cierra nada: la cierra un encargado con una corrección). Sin fila guardada muestra los valores por defecto. |

Además, el widget «Clocked in now» (`attendance.view_all`) cuenta quién está dentro ahora.

## Comandos (desde `modules-workspace/`)

```sh
./node_modules/.bin/erplora validate attendance --pg
ERPLORA_TEST_PG_CONTAINER=erplora-test-pg-5433 ./node_modules/.bin/erplora test attendance
./node_modules/.bin/erplora test attendance --against-hub stable
npx vitest run modules/attendance/
./node_modules/.bin/erplora contracts attendance
./node_modules/.bin/erplora dev attendance
./node_modules/.bin/erplora build attendance
```
