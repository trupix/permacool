# PermaCool Ops MVP (Read-Only Monitoring First)

## MVP objective

Ship a useful first version without remote writes to PLCs.

Success means an authenticated user can sign in, see all customer sites, inspect device health, and review telemetry/events in one place.

## MVP scope

### Included

- authentication
- organizations / customer accounts
- site/location records
- PLC/device inventory
- device status (online/offline/degraded)
- latest telemetry values
- recent event timeline
- alerts/alarm feed
- audit logging foundation
- internal admin settings for users and roles

### Explicitly excluded from MVP

- remote config pushes
- direct PLC writes from browser
- automated rollback
- maintenance scheduling
- advanced analytics/forecasting
- billing/subscription workflows

## Primary user flows

### 1. Operations overview
User signs in and sees:
- fleet health summary
- sites with active issues
- devices offline right now
- latest alarm/event activity

### 2. Site detail
User opens a site and sees:
- site metadata
- gateway connectivity state
- device list
- recent telemetry snapshot
- recent alerts/events

### 3. Device detail
User opens a device and sees:
- device identity and protocol
- current health state
- key telemetry points
- last seen timestamp
- recent event history

### 4. Admin management
Privileged user can:
- add/edit organizations
- add/edit sites
- add/edit devices
- assign user roles

## MVP page breakdown

1. **Login**
2. **Dashboard**
3. **Organizations / Sites list**
4. **Site detail**
5. **Device detail**
6. **Alerts feed**
7. **Users / Roles admin**
8. **Audit log**

## Recommended data model for MVP

### organizations
- id
- name
- status
- created_at

### sites
- id
- organization_id
- name
- timezone
- address / region
- gateway_status

### devices
- id
- site_id
- name
- plc_model
- protocol
- serial_number
- status
- last_seen_at

### telemetry_points
- id
- device_id
- key
- label
- unit
- latest_value
- latest_timestamp

### alerts
- id
- site_id
- device_id
- severity
- type
- message
- started_at
- ended_at
- status

### audit_logs
- id
- actor_user_id
- entity_type
- entity_id
- action
- metadata
- created_at

## Build order

### Step 1: app foundation
- build ops routes inside the root Next app
- use one Vercel project boundary
- set up TypeScript, Supabase auth, Prisma, and env structure

### Step 2: auth + tenant model
- login
- protected routes
- roles and permissions skeleton
- organization/site/device schema

### Step 3: operational views
- dashboard shell
- site list
- site detail
- device detail
- alerts feed

### Step 4: ingestion contract
- define gateway-to-cloud payload shape
- add endpoint or queue consumer for telemetry ingestion
- store latest status and event history

### Step 5: admin + auditability
- user/role admin
- audit log views
- write tracking for admin changes

## Acceptance criteria

The MVP is successful when:
- authenticated users can access only permitted org/site data
- operators can see live-ish device status for all connected sites
- alerts and recent telemetry are visible without direct PLC access
- admin changes are logged
- the architecture is ready for later write/deploy workflows

## Post-MVP path

After MVP proves stable:
1. add site gateway service
2. add protocol-specific connectors
3. add config profile/versioning
4. add approvals and staged deployment jobs
5. add rollback and maintenance windows
