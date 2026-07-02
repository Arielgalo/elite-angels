# Seguridad del backend — Aura Experience

Resumen del modelo de seguridad (Supabase / Postgres RLS) tras la auditoría.

## Roles
- **anon** (visitante): sólo lee lo público (modelos publicadas y reseñas aprobadas) a través de vistas. No puede leer las tablas base directamente.
- **authenticated / modelo**: edita SÓLO su propio perfil (por email), sin poder tocar campos sensibles.
- **admin** (email en tabla `admins`): control total.
- **service_role** (Edge Functions / webhook de pago): confirma pagos.

## Reglas por tabla
- **solicitudes**
  - INSERT público: obligado a `estado='pendiente'` y `pago='pendiente'` (no se puede auto-publicar gratis ni auto-marcar pagado). Puntos acotados.
  - INSERT admin: libre (crea modelos gratis).
  - UPDATE modelo: sólo su fila. Un trigger (`proteger_estado_pago`) **congela** `estado, pago, precio, puntos, plan, numero, dias, vence, mp_*` para no-admins → la modelo no puede autoascenderse ni falsear pagos/ranking.
  - SELECT: modelo (su fila) o admin. El público lee vía la vista `perfiles_publicados`.
- **movimientos_puntos** (ledger de puntos): sólo admin (lectura y escritura). Al verificar un pago, un trigger acredita los puntos a la modelo por su número.
- **sitio_config**: lectura pública; **escritura sólo admin**.
- **resenas**: cualquiera crea, pero forzado a `estado='pendiente'` y `estrellas 1..5`. Modera/borra sólo admin.
- **admins**: cada admin sólo se ve a sí mismo. Sin fuga de emails.

## Storage
- Buckets `fotos`, `medios`, `sitio` públicos por URL, pero **sin listado** (no se puede enumerar archivos).
- Escritura de `sitio` sólo admin. Límites de tamaño y tipos MIME por bucket.

## Pagos
- El monto se **recalcula en el servidor** (Edge Function `crear-pago`) desde el plan/días/puntos reales de la solicitud → un cliente no puede pagar menos manipulando el front.
- Las funciones-trigger no son invocables como RPC público.

## Excepciones revisadas y aceptadas
- **Vistas `perfiles_publicados` y `resenas_aprobadas` (SECURITY DEFINER):** intencional. Actúan como *firewall de columnas*: exponen sólo campos no sensibles (nunca email, pago ni IDs de pago) y sólo filas publicadas/aprobadas. Verificado que anon no puede leer email ni las tablas base.
- **Protección de contraseñas filtradas (HaveIBeenPwned):** activar manualmente en el panel de Supabase → Authentication → Policies (toggle).

## Para escalar
- Índices en `solicitudes(estado, plan, puntos)` y `movimientos_puntos(numero_modelo)` cuando crezca el catálogo.
- Paginación en el listado público.
- Rate-limiting de subidas (Edge Function) si aparece abuso.
