# Workflow — Control horario (módulo)
Prefijo: ATTENDANCE
Alcance MVP: transversal

## Para qué sirve y para quién
Es el registro de jornada del negocio. Cada persona del equipo ficha la entrada al llegar y la
salida al irse, con sus pausas en medio, con un toque y sin elegir nada: quien ficha es quien ha
entrado en el hub con su PIN o su placa. El encargado ve las jornadas de todo el equipo, corrige
las que están mal (siempre con un motivo, que queda en el historial) y saca el mes en CSV para la
gestoría o la Inspección de Trabajo.

Lo usan igual un restaurante y una peluquería: en España todo negocio con empleados tiene que
registrar el inicio y el fin de cada jornada, guardarlo cuatro años y tenerlo a disposición del
trabajador y de la Inspección (art. 34.9 del Estatuto de los Trabajadores, RDL 8/2019). Por eso el
alcance es `transversal`: no es parte del cobro, pero lo necesitan los dos verticales.

## Referencia adoptada
El modelo de «sesión» de Odoo Asistencias, Square Team, Toast y Lightspeed: una jornada es una
entrada y una salida de una persona, con pausas dentro; el encargado edita con rastro (Toast) y el
radio del lugar de trabajo solo se exige a los dispositivos personales (Square, Factorial,
Homebase). El fichaje no calcula nóminas ni horas extra: eso, en el mercado, es otro producto.

## Antes de empezar
- La app **Control horario** instalada. No necesita Personal: fichan las personas del hub.
- Cada persona tiene su PIN (o placa) en el hub.
- Si se quiere exigir que el móvil esté en el local, un encargado lo activa en **Ajustes** y fija
  la ubicación del local (ATTENDANCE-F04). Por defecto no se pide ninguna ubicación.
- El hub decide si un dispositivo es el TPV compartido o el dispositivo personal de alguien; al
  TPV compartido nunca se le pide la ubicación.

## Pantallas

### Fichar
Se llega desde el menú de la app, «Fichar». Arriba, «Hola, <nombre>» y «Son las <hora>»; en el
centro, el botón grande del momento («Fichar entrada», o «Empezar pausa» / «Terminar pausa» y
«Fichar salida»); debajo, «Hoy» (Trabajado y Pausas) y «Últimas jornadas» (las diez últimas, con
su estado: «En curso», «Cerrada», «Para revisar»). La puede abrir cualquier persona del equipo.
Cargando: «Cargando…». Con error: «No se ha podido cargar el control horario…» y «Reintentar».
Vacía: «Todavía no hay registros».

### Registros
Se llega desde el menú de la app, «Registros». Una tabla de las jornadas del mes elegido: Fecha,
Persona, Entrada, Salida, Pausas (min), Trabajado, Estado, Ubicación y Acciones; en un móvil,
tarjetas. Un empleado ve solo las suyas; el encargado ve las de todo el equipo con los filtros
«Persona», «Mes» y «Estado», y en cada fila «Corregir» e «Historial». Arriba, «Exportar CSV».
Cargando: «Cargando registros…». Vacía: «No hay registros en este mes.». Con error: «No se
pudieron cargar los registros.» y «Reintentar».

### Ajustes
Se llega desde la pestaña «Ajustes» de la app. «Pedir la ubicación al fichar desde un dispositivo
personal», «Radio permitido», «Ubicación del lugar de trabajo» (Latitud, Longitud y «Usar mi
ubicación actual») y «Marcar a revisar tras (horas)». Solo un encargado o un administrador puede
guardar; los demás la ven en solo lectura con «Solo un encargado o administrador puede cambiar
estos ajustes.». Cargando: indicador de carga. Con error: el aviso y «Reintentar».

### Panel «Fichados ahora»
Un panel de Inicio del hub con un número: cuántas personas tienen ahora una jornada abierta. Solo
lo ven quienes pueden ver las jornadas del equipo.

## Flujos

### ATTENDANCE-F01 Fichar la entrada al llegar y la salida al irse
Estado: hecho
Vertical: comun
Actor: administrador, responsable, empleado
Pantalla: Fichar
Pasos:
1. Entra en el hub con su PIN o su placa y abre Control horario → «Fichar». Ve «No has fichado la
   entrada» y el botón «Fichar entrada».
2. Pulsa «Fichar entrada». Ve «Entrada fichada a las 09:00.», «Dentro desde las 09:00» y el
   tiempo que lleva desde la entrada, que corre solo.
3. Al acabar, pulsa «Fichar salida». Ve «Salida fichada a las 17:00.» y vuelve el botón «Fichar
   entrada».
4. En «Hoy» sale el tiempo trabajado y en «Últimas jornadas» la jornada, «Cerrada».
5. Una jornada que cruza la medianoche (de 22:00 a 06:00) es una sola y cuenta entera en el día en
   que empezó.
Entra: la persona que ha entrado en el hub y si el dispositivo es el TPV compartido o uno personal
(los da el hub).
Sale: la jornada guardada con la hora del servidor, abierta al entrar y cerrada al salir; el aviso
de entrada y el de salida; el panel «Fichados ahora» sube y baja.
Si falla: fichar la entrada con una jornada ya abierta se rechaza con «No se ha podido fichar la
entrada: ya tienes una jornada abierta…» y la pantalla se recarga con la jornada abierta; sin
conexión sale el error con «Reintentar».
Implicados: pendiente
Pendiente de enlazar: hub — HUB_SHELL-F04 (entrar con PIN: quien ficha es la persona de la sesión)
Pendiente de enlazar: hub — HUB_SHELL-F11 (decidir si el dispositivo es compartido o personal)
QA: attendance/fichar-entrada-y-salida

### ATTENDANCE-F02 Hacer una pausa sin salir de la jornada
Estado: hecho
Vertical: comun
Actor: administrador, responsable, empleado
Pantalla: Fichar
Pasos:
1. Con la jornada abierta, pulsa «Empezar pausa». Ve «Pausa iniciada a las 13:00.» y «En pausa
   desde las 13:00»; el botón pasa a «Terminar pausa».
2. A la vuelta, pulsa «Terminar pausa». Ve «Pausa terminada a las 13:30.».
3. Puede hacer tantas pausas como quiera, una detrás de otra.
4. Si pulsa «Fichar salida» en plena pausa, la pausa se termina en ese mismo momento.
5. En «Hoy», «Pausas» suma el tiempo de pausa y «Trabajado» ya lo descuenta.
Entra: la jornada abierta de la persona (ATTENDANCE-F01).
Sale: cada pausa guardada dentro de su jornada; el aviso de pausa empezada y el de pausa terminada.
Si falla: sin jornada abierta o con una pausa ya en curso, la pantalla no ofrece «Empezar pausa»;
si llega a pedirse, sale «No se ha podido empezar la pausa…». Terminar una pausa que no existe da
«No hay ninguna pausa en curso que terminar.».
Implicados: ninguno
QA: attendance/hacer-una-pausa

### ATTENDANCE-F03 Fichar desde el móvil cuando el negocio pide la ubicación
Estado: hecho
Vertical: comun
Actor: administrador, responsable, empleado
Pantalla: Fichar
Pasos:
1. El negocio tiene activado «Pedir la ubicación al fichar desde un dispositivo personal»
   (ATTENDANCE-F04) y la persona usa su propio móvil o portátil.
2. Pulsa «Fichar entrada». Ve «Obteniendo tu ubicación…»; la primera vez el móvil pide permiso
   para usar la ubicación.
3. Dentro del radio, ficha como siempre y la jornada guarda la posición y la distancia al local.
4. Fuera del radio no ficha y lo dice: «Estás a 850 m del lugar de trabajo, fuera de los 100 m
   permitidos. Acércate para fichar o ficha en el mostrador.».
5. La salida nunca se bloquea: se guarda la posición si se puede y, si no, se ficha igual.
6. En el TPV del mostrador nunca se pide la ubicación, aunque el ajuste esté activado.
Entra: los ajustes de ubicación (ATTENDANCE-F04) y el modo del dispositivo (lo da el hub).
Sale: la jornada con la posición, la precisión, la distancia y si estaba dentro del radio, solo en
el momento de fichar; en Registros, la columna «Ubicación» lo enseña.
Si falla: con el permiso denegado, «El acceso a la ubicación está denegado…»; sin la ubicación del
local fijada, «Aún no se ha fijado la ubicación del lugar de trabajo…»; si el GPS tarda más de 15
segundos, «Obtener tu posición ha tardado demasiado. Vuelve a intentarlo.». En todos los casos no
se envía nada y se puede fichar en el mostrador.
Implicados: pendiente
Pendiente de enlazar: hub — HUB_SHELL-F11 (decidir si el dispositivo es compartido o personal)
QA: attendance/fichar-desde-el-movil-con-ubicacion

### ATTENDANCE-F04 Ajustar la ubicación del local y cuándo se revisa una jornada olvidada
Estado: hecho
Vertical: comun
Actor: administrador, responsable
Pantalla: Ajustes
Pasos:
1. Abre Control horario → «Ajustes».
2. Activa «Pedir la ubicación al fichar desde un dispositivo personal» y elige el «Radio
   permitido»: 50, 100, 250, 500 o 1000 m.
3. Desde el propio local, pulsa «Usar mi ubicación actual»: se rellenan la latitud y la longitud y
   ve la precisión leída. También puede escribirlas a mano.
4. En «Marcar a revisar tras (horas)» pone de 1 a 24 horas (12 si no lo toca).
5. Pulsa «Guardar» y ve «Ajustes guardados.».
Entra: nada de otros componentes; sin ajustes guardados se ven los valores por defecto.
Sale: los ajustes que leen Fichar (ATTENDANCE-F03) y la revisión de jornadas (ATTENDANCE-F05); el
aviso de ajustes cambiados.
Si falla: una latitud o longitud fuera de rango, solo una de las dos o unas horas que no son un
número entero de 1 a 24 se señalan antes de enviar; con la ubicación pedida y el local sin fijar,
avisa «Fija la ubicación del lugar de trabajo o nadie podrá fichar desde un dispositivo
personal.»; si no se guarda, «No se han podido guardar los ajustes del control horario…».
Implicados: pendiente
Pendiente de enlazar: hub — HUB_SHELL-F43 (la pestaña «Ajustes» de una app monta esta pantalla)
Pendiente de enlazar: hub — HUB_SHELL-F44 (guardar los ajustes de una app y quién puede)
QA: attendance/fichar-desde-el-movil-con-ubicacion

### ATTENDANCE-F05 Marcar para revisar una jornada que nadie cerró
Estado: hecho
Vertical: comun
Actor: sistema
Pantalla: ninguna
Pasos:
1. Cada 15 minutos, el hub revisa las jornadas abiertas.
2. Las que llevan abiertas más horas de las fijadas en Ajustes (12 por defecto) pasan a «Por
   revisar»: la persona olvidó fichar la salida.
3. No se inventa ninguna hora de salida: la pone un encargado con una corrección (ATTENDANCE-F08).
4. La persona puede volver a fichar la entrada al día siguiente sin esperar a esa corrección.
Entra: las horas de ATTENDANCE-F04.
Sale: la jornada en estado «Por revisar», con su insignia en Fichar y en Registros. No envía
ningún aviso.
Si falla: si la tarea no corre, la jornada sigue abierta y bloquea fichar otra entrada hasta que se
corrija o pase la siguiente revisión.
Implicados: pendiente
Pendiente de enlazar: hub — HUB-F62 (ejecutar las tareas programadas de los módulos)
QA: attendance/fichar-entrada-y-salida

### ATTENDANCE-F06 Ver mis jornadas del mes
Todavía no: el empleado ve sus horas corregidas, pero no quién las corrigió ni por qué.
Estado: parcial — el empleado no ve el historial de correcciones de sus jornadas (attendance#8)
Vertical: comun
Actor: empleado
Pantalla: Registros
Pasos:
1. Abre Control horario → «Registros»: ve sus jornadas del mes en curso, sin elegir persona.
2. En «Mes» puede elegir cualquiera de los últimos cuatro años.
3. La jornada abierta sale con «En curso» y el tiempo trabajado hasta ahora; la que falta por
   cerrar, «Por revisar».
4. Una jornada corregida sale ya con las horas nuevas.
Entra: sus jornadas y sus pausas; su nombre lo da el hub.
Sale: nada; solo lee.
Si falla: «No se pudieron cargar los registros.» y «Reintentar».
Implicados: ninguno
QA: attendance/exportar-el-mes-en-csv

### ATTENDANCE-F07 Ver las jornadas de todo el equipo
Todavía no: con cientos de pausas, una jornada abierta muy antigua puede enseñar más tiempo trabajado del real.
Estado: parcial — con cientos de pausas, una jornada abierta antigua puede sumar de más (attendance#10)
Vertical: comun
Actor: administrador, responsable
Pantalla: Registros
Pasos:
1. Abre Control horario → «Registros»: ve las jornadas del mes de todo el equipo, con el nombre de
   cada persona.
2. Filtra por «Persona», «Mes» y «Estado» («Abierta», «Cerrada», «Por revisar»).
3. En «Ubicación» ve si la entrada y la salida se ficharon dentro del radio del local, o «Sin
   ubicación registrada».
Entra: las jornadas y pausas de todos; los nombres, de las personas del hub.
Sale: nada; solo lee.
Si falla: si los nombres no cargan, cada persona sale con su identificador y el aviso «No se
pudieron cargar los nombres del equipo…»; si la tabla no carga, «Reintentar».
Implicados: ninguno
QA: attendance/corregir-una-jornada

### ATTENDANCE-F08 Corregir una jornada mal fichada, con su motivo
Estado: hecho
Vertical: comun
Actor: administrador, responsable
Pantalla: Registros
Pasos:
1. En «Registros», en la jornada mal fichada, pulsa «Corregir».
2. En «Corregir jornada» ve la entrada y la salida en la hora del negocio. Cambia la que está mal;
   dejar «Salida (vacía = sigue abierta)» vacía reabre la jornada.
3. Escribe el «Motivo» (obligatorio, al menos 3 caracteres) y pulsa «Guardar corrección».
4. Ve «Jornada corregida.»; la fila enseña las horas nuevas y el tiempo trabajado recalculado.
5. Una jornada «Por revisar» se cierra así: se le pone la salida y queda «Cerrada».
Entra: la jornada (ATTENDANCE-F07).
Sale: la jornada con las horas nuevas y una entrada nueva en su historial (ATTENDANCE-F09), que
nunca se borra; el aviso de jornada corregida; el panel «Fichados ahora» se actualiza.
Si falla: la pantalla no envía y lo dice si la salida no es posterior a la entrada («La salida
tiene que ser posterior a la entrada.»), si las horas pisan otra jornada de la misma persona
(«Estas horas se solapan con otra jornada de esta persona.») o si falta el motivo. Reabrir una
jornada cuando esa persona ya tiene otra abierta lo rechaza el hub con «No se ha podido corregir la
jornada…». «Corregir» solo aparece a quien puede ver el equipo y además corregir jornadas.
Implicados: ninguno
QA: attendance/corregir-una-jornada

### ATTENDANCE-F09 Ver quién cambió una jornada, cuándo y por qué
Estado: hecho
Vertical: comun
Actor: administrador, responsable
Pantalla: Registros
Pasos:
1. En «Registros», en una jornada, pulsa «Historial».
2. En «Historial de correcciones» ve cada cambio, del más reciente al más antiguo: quién, cuándo,
   «Antes» → «Después» y el «Motivo».
3. Si nadie la ha corregido, ve «Esta jornada no se ha corregido nunca.».
Entra: las correcciones de ATTENDANCE-F08; los nombres, de las personas del hub.
Sale: nada; el historial no se puede editar ni borrar.
Si falla: «No se pudo cargar el historial.».
Implicados: ninguno
QA: attendance/corregir-una-jornada

### ATTENDANCE-F10 Sacar el mes en CSV para la gestoría o la Inspección
Estado: hecho
Vertical: comun
Actor: administrador, responsable, empleado
Pantalla: Registros
Pasos:
1. En «Registros», elige el mes (y, si es encargado, la persona y el estado).
2. Pulsa «Exportar CSV»; mientras tanto ve «Exportando…».
3. Se descarga `attendance-2026-10.csv` con una línea por jornada del filtro, todas, no solo las
   que caben en la pantalla: fecha, persona, entrada, salida, minutos de pausa, minutos
   trabajados, estado y si la entrada y la salida fueron dentro del radio.
4. El fichero se abre con los acentos bien en una hoja de cálculo.
5. Un empleado solo exporta sus jornadas.
Entra: las jornadas del filtro (ATTENDANCE-F06, ATTENDANCE-F07).
Sale: el fichero descargado en el dispositivo; nada se guarda en el hub.
Si falla: un mes sin jornadas descarga solo la cabecera y avisa «No hay registros con este filtro:
el fichero solo lleva la cabecera.»; si la descarga falla, «No se pudo exportar el CSV. Inténtalo
de nuevo.».
Implicados: ninguno
QA: attendance/exportar-el-mes-en-csv

### ATTENDANCE-F11 Ver cuántas personas están fichadas ahora
Estado: hecho
Vertical: comun
Actor: administrador, responsable
Pantalla: Panel «Fichados ahora»
Pasos:
1. Abre Inicio en el hub.
2. En el panel «Fichados ahora» ve cuántas personas tienen la jornada abierta.
3. El número cambia en cuanto alguien ficha la entrada o la salida, o se corrige una jornada.
Entra: las jornadas abiertas (ATTENDANCE-F01, ATTENDANCE-F08).
Sale: nada; solo lee.
Si falla: el panel enseña su error como el resto de paneles de Inicio.
Implicados: pendiente
Pendiente de enlazar: hub — HUB_SHELL-F33 (ver los paneles de las apps en Inicio)
QA: attendance/fichar-entrada-y-salida

## Para quien lo mantiene
Lo que sigue es para quien cambia el componente; quien lo usa puede parar aquí.

## Código que gobierna
| Flujo | Código | Lo que sostiene su `Estado:` (verde el 08/10 sobre origin/main@05996cf) |
|---|---|---|
| F01 | `commands/clock_in.sql`, `clock_out.sql`; `queries/records_mine_open.sql`, `records_mine.sql`; `ui/components/erp-attendance-clock` | `tests/clock_cycle.hub.test.py::test_full_working_day`, `::test_refusals` (contra `ghcr.io/erplora/hub:stable`); `data.pg.test.py` caso 1; vitest `erp-attendance-clock` «buttons follow the state…», «(g) a clock_in_rejected refusal…», ««Today» is the day of the business zone…» |
| F02 | `commands/break_start.sql`, `break_end.sql`, `clock_out.sql`; `queries/breaks_mine.sql` | `test_full_working_day`, `test_refusals`; `data.pg.test.py` (la salida cierra la pausa, pausa sin jornada); vitest «Start break sends the command…», «sums today…» |
| F03 | `commands/clock_in.sql` (puerta de radio); `ui/lib/geo.ts`, `device-mode.ts` | `test_settings_and_geofence`; `data.pg.test.py` caso 3; vitest «(d)…(f)», «inside the radius…», «workplace not set…», «clocking out never blocks», `geo.test.ts` (15 s) |
| F04 | `commands/settings_update.sql`, `_settings_ensure.sql`; `queries/settings_get.sql`; `ui/components/erp-attendance-settings`; `schemas/` | `test_settings_and_geofence`, `test_employee_permissions`; vitest `erp-attendance-settings` (carga, guardado, validación, solo lectura) |
| F05 | `commands/_auto_review_stale.sql`; `scheduled_tasks.auto_review_stale` (`*/15`, `collapse`) | `data.pg.test.py` caso 5 |
| F06 | `queries/records_mine.sql`, `breaks_mine.sql`; `erp-attendance-records` (modo propio) | vitest «own days (employee without attendance.view_all)» |
| F07 | `queries/records_list.sql`, `breaks_list.sql`; `hub.users.list` | vitest «the team (manager with attendance.view_all)»; `test_employee_permissions` (403 al empleado) |
| F08 | `commands/record_correct.sql`, `record_correct_log.sql`, `_record_correct_close_break.sql`; `overlap.ts`, `zone.ts` | `test_correction_trail`, `test_correction_overlap`; `data.pg.test.py` caso 4 y los de solape; vitest «correcting a working day», `overlap.test.ts`, `zone.test.ts` |
| F09 | `queries/corrections_list.sql` | `test_correction_trail`; vitest «History lists the corrections…», «…made by the system…» |
| F10 | `ui/components/erp-attendance-records/csv.ts` | vitest «CSV export» (todas las páginas de 500 en 500, mes vacío, BOM), `csv.test.ts` |
| F11 | `queries/presence_count.sql`; `widgets.attendance.clocked_in_now` | `test_presence`; `data.pg.test.py` (solo las abiertas de este hub). El refresco por aviso (`refresh_on`) es del hub y ninguna batería del módulo lo prueba |

Suite completa: `ERPLORA_TEST_PG_CONTAINER=erplora-test-pg-5433 erplora test . --against-hub stable`
→ «20 batería(s) en verde».

## Cobertura contra la referencia
| Elemento | Estado | Flujo |
|---|---|---|
| Fichar entrada y salida con un toque, quien ficha es la sesión | hecho | ATTENDANCE-F01 |
| Pausas dentro de la jornada | hecho | ATTENDANCE-F02 |
| Radio del local solo para dispositivos personales | hecho | ATTENDANCE-F03 |
| Varios locales con su propio radio | no hecho — attendance#4 | — |
| Señal de dispositivo del lado del servidor (no fiarse del cliente) | no hecho — hub#2554 | ATTENDANCE-F03 |
| Botón «Fichar» en la cabecera del TPV | no hecho — hub#2553 | — |
| Jornada olvidada marcada, no adivinada | hecho | ATTENDANCE-F05 |
| Aviso al encargado cuando una jornada queda por revisar | no hecho — attendance#15 | ATTENDANCE-F05 |
| El empleado ve sus jornadas | hecho | ATTENDANCE-F06 |
| El empleado ve quién corrigió sus jornadas y por qué | no hecho — attendance#8 | ATTENDANCE-F06 |
| Vista del equipo con filtros | parcial — attendance#10 | ATTENDANCE-F07 |
| Corrección con motivo y rastro inmutable | hecho | ATTENDANCE-F08, ATTENDANCE-F09 |
| La pantalla Fichar se entera sola de una corrección | no hecho — attendance#11 | ATTENDANCE-F08 |
| Exportación CSV del mes | hecho | ATTENDANCE-F10 |
| Informe mensual en PDF por empleado | no hecho — attendance#3 | — |
| Exportación oficial para la Inspección (RD pendiente) | no hecho — attendance#5 | — |
| Conservar 4 años y suprimir después | parcial — se conserva; no se suprime (attendance#7) | — |
| Horas por tarifa (coste de personal) | no hecho — attendance#6 | — |
| Quién está dentro ahora | hecho | ATTENDANCE-F11 |

## Datos: de quién es cada dato
| Dato | Dueño | Cómo lo obtiene |
|---|---|---|
| Jornada (`attendance_record`): entrada, salida, estado, origen, posición al fichar | Control horario | propio |
| Pausa (`attendance_break`) | Control horario | propio |
| Corrección (`attendance_correction`): antes, después, motivo, autor, fecha | Control horario | propio, solo se inserta |
| Ajustes (`attendance_settings`, una fila por hub) | Control horario | propio |
| Persona que ficha | hub (`hub_user`) | la inyecta el runtime (`:current_user_id`); nunca viene en el payload |
| Nombre de cada persona | hub | `hub.users.list` en pantalla |
| Modo del dispositivo (compartido / personal) | hub | SDK (hub#2584) o `GET /api/device/mode` |

Datos personales: el nombre de la persona y, solo con la ubicación activada y desde un dispositivo
personal, la posición al fichar (nunca durante la jornada). La relación con Personal sería
`staff_member.user_id`, que hoy no se usa.

## Reglas que no se rompen
- Una persona tiene como mucho una jornada abierta (índice único parcial): dos toques a la vez crean
  una.
- Ninguna jornada se borra: no hay comando de borrado, por los cuatro años que pide la ley.
- Toda corrección lleva motivo y deja una fila nueva e inmutable; una corrección rechazada no deja
  rastro ni cambia nada.
- Una corrección no puede solapar dos jornadas de la misma persona; tocarse sí.
- Las horas se guardan en UTC y la fecha de la jornada es el día local del negocio en que empezó.
- Todo filtra por `hub_id` en la puerta del runtime; los datos de otro hub nunca llegan
  (`data.pg.test.py` caso 2).
- Al TPV compartido nunca se le pide la ubicación, y la salida nunca se bloquea por la ubicación.

## Lo que NO hace, a propósito
- No calcula nóminas, horas extra ni horas contra contrato (lo hace otro producto; attendance#6 solo
  cruzaría horas y tarifa).
- No gestiona turnos ni cuadrantes: los turnos de un profesional son de Personal.
- No sigue la posición durante la jornada: solo al fichar (criterio de la AEPD).
- No cierra solo una jornada olvidada ni inventa su salida.
- No avisa cada 15 minutos sin cambios: hasta que el hub pueda avisar solo de las jornadas que la
  revisión marca, no envía ningún aviso (attendance#13, attendance#15).

## Dudas abiertas
- El rótulo del mismo estado no coincide entre pantallas: «En curso» / «Para revisar» en Fichar y
  «Abierta» / «Por revisar» en Registros (attendance#18).
- El `WORKFLOW.md` de Personal pone «Fichaje, horas trabajadas y horas extra — fuera del MVP»: el
  fichaje ya existe aquí; esa fila tiene que enlazar a este módulo (staff#113).

## Fuentes contrastadas
- `docs/overview.md` decía que los turnos son del módulo `schedules`; `schedules` es el horario de
  apertura del negocio y los turnos de un profesional son de Personal. Corregido en esta misma PR.
- Los guiones de QA llaman a los botones «Entrar» y «Salir»; en pantalla son «Fichar entrada» y
  «Fichar salida».
- Guion `fichar-desde-el-movil-con-ubicacion`: «cómo se marca un dispositivo como personal — por
  confirmar» lo resuelve el hub (HUB_SHELL-F11); «si la salida bloquea fuera del radio — por
  confirmar»: no bloquea nunca; el GPS lento corta a los 15 s con «Obtener tu posición ha tardado
  demasiado…». Su nota sobre Android la cerró hub#2552.
- Guion `exportar-el-mes-en-csv`: los «por confirmar» los cierran los tests: exporta todas las
  páginas, un mes vacío descarga solo la cabecera con aviso, el mes es el del negocio (no UTC) y una
  jornada «Por revisar» deja vacíos los minutos trabajados.
- Guion `corregir-una-jornada`: dice que el empleado ve su jornada corregida «pero no el historial
  ajeno»; tampoco ve el de las suyas (attendance#8).
