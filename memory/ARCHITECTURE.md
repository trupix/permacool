# PermaCool Architecture Memory

Canonical architecture docs currently live in:
- `docs/permacool-ops-architecture.md`
- `docs/permacool-ops-mvp.md`

Summary:
- Public marketing site remains separate from the secure operations app.
- `ops-app/` is the Next.js app for `app.perma.cool` with Supabase auth and Supabase Postgres/Prisma as the data layer.
- MVP is read-only monitoring first: organizations, sites, devices, telemetry, alerts, users/roles, and audit log.
- PLCs should never be exposed directly to the browser or public internet; future gateways should connect outbound to cloud services.
