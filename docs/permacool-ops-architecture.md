# PermaCool Ops Architecture

## Goal

Add a secure operations surface to the PermaCool brand that can monitor remote PLC-connected systems across many customer locations and later support controlled configuration deployment.

## Deployment Model

- Marketing stays on `perma.cool`.
- Ops lives in the same Next.js app under protected routes such as `/dashboard`.
- Vercel uses one project rooted at this repository.
- Supabase Auth protects ops routes when configured.
- Supabase Postgres, through Prisma, stores ops data when `DATABASE_URL` is configured.
- Mock/fallback data keeps the dashboard buildable when live Supabase/database env vars are absent.

If `app.perma.cool` is desired later, map it to the same deployment and route into the ops surface rather than recreating a second repo/project.

## Workspace Layout

```text
PermaCool/
├─ app/                    # public pages, ops routes, auth, and APIs
│  ├─ (ops)/               # protected dashboard routes
│  ├─ api/                 # contact, health, telemetry ingest
│  ├─ auth/
│  └─ sign-in/
├─ components/             # ops dashboard components
├─ db/                     # early schema notes
├─ lib/                    # env, auth, Supabase, Prisma helpers
├─ prisma/                 # Supabase Postgres schema and seed
├─ server/                 # backend services and repositories
├─ types/                  # shared domain types
└─ docs/
```

## System Boundaries

### Public Web Layer

Purpose:

- brand presence
- SEO pages
- lead capture
- entry point to the ops app

This layer should not talk directly to PLCs.

### Ops Application Layer

Purpose:

- authenticated user access
- multi-tenant organization/site/device views
- telemetry dashboards
- alarm and event visibility
- audit logs
- command and deployment workflow surface

Stack:

- Next.js App Router
- Supabase Auth
- Supabase Postgres
- Prisma
- API routes / server actions for app operations

### Edge Gateway Layer

Purpose:

- connect locally to PLCs at each physical site
- poll telemetry over LAN protocols
- normalize and forward data to the cloud
- receive approved jobs from cloud services
- buffer data during internet outages

Important rule:

- prefer outbound secure connections from site gateway to cloud
- avoid exposing PLCs directly to the public internet

MVP implementation note:

- The first implementation uses an Opto 22 groov EPIC as the edge gateway itself.
- groov EPIC's built-in Node-RED + HTTP/MQTT capabilities can send read-only telemetry directly to `POST /api/ingest/telemetry`.
- A separate gateway box remains a later option for non-Opto PLCs, multi-device sites, or protocol translation.

### Data Layer

Core entities:

- organizations
- users
- roles
- locations/sites
- devices/PLCs
- telemetry streams
- alert events
- audit log entries
- config profiles
- deployment jobs

## Security Model

Non-negotiables:

- SSO or strong auth with MFA support
- role-based access control
- audit logs for every write action
- encrypted credentials/secrets
- route and server boundary separation between public site and ops app
- no direct browser-to-PLC communication

Recommended rollout:

1. read-only monitoring
2. internal write/test workflows on limited devices
3. staged production rollout with rollback support

## Networking Model

At each customer location:

- PLCs stay on local protected network
- local gateway/edge agent talks to PLCs using approved protocol drivers; for the MVP this can be the groov EPIC itself
- gateway opens secure outbound connection to cloud services
- cloud app reads latest telemetry and historical events from database/stream

Supported protocols will depend on hardware, but likely candidates include:

- Modbus TCP
- OPC UA
- Ethernet/IP
- vendor-specific device interfaces

## Vercel Model

Use one Vercel project for the combined app:

- domain: `perma.cool`
- root: repository root
- public pages: `/`, `/contact-us`, `/insights`, product and article pages
- protected ops routes: `/dashboard`, `/sites`, `/alerts`, `/audit-log`, `/admin/users`, `/devices/*`
- ops APIs: `/api/health`, `/api/ingest/telemetry`

## Near-Term Implementation Sequence

1. extend the root app's ops surface
2. implement auth and tenant model
3. add location/device inventory
4. add read-only telemetry ingestion and dashboards
5. add alerts and audit logs
6. add gateway service
7. add controlled deployment workflows

## Current Implementation Note

The repo now includes:

- Prisma schema scaffolding for the MVP entities
- environment variable template for app + auth + ingest token setup
- health route and first telemetry ingest route contract
- protected dashboard routes in the root Next app

Auth provider secrets and live database connection still need to be configured per environment.
