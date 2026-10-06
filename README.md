# attendance

Módulo ERPlora (declarativo + Web Component Lit). Repo independiente; se desarrolla dentro de un
workspace creado con `erplora startproject`.

- `module.json` — manifest (queries/commands/navigation/permissions).
- `ui/components/erp-attendance-items/erp-attendance-items.ts` — el Web Component (Lit) que usa `ok-data-table`.
- `queries/`, `commands/`, `migrations/` — SQL declarativo (Postgres).
- `locales/en.json`, `locales/es.json` — textos del módulo (nombre, menú y `ui.*` de las vistas): inglés fuente + español.
- `fixtures/` — datos mock que usa `erplora dev` para previsualizar sin backend.
- `dist/attendance.esm.js` — artefacto que va en el `module.zip` (lo genera `erplora build`).

```sh
erplora dev attendance      # previsualiza
erplora build attendance    # compila el WC
```
