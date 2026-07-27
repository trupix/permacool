# PermaCool Customer Portal Plan

## Outcome

PermaCool staff use one fleet-wide operations console. Approved customers use a customer portal that exposes only the organizations, sites, and machines explicitly assigned to them.

The portal includes machine status and telemetry, alerts, support requests, customer documents, and read-only invoice visibility. No customer-facing browser workflow may write directly to a PLC.

## Access model

Authorization is evaluated on the server for every page, action, repository query, and API route. Navigation visibility is not an authorization control.

### Platform roles

- `staff_admin`: fleet-wide access, account approval, assignments, billing, documents, and support administration.
- `staff_support`: fleet-wide read access plus support workflows; no account approval or role administration.
- `customer`: access only through approved organization membership and optional machine assignments.

### Account states

- `pending`: registration exists but no portal access is granted.
- `approved`: sign-in and assigned-resource access are enabled.
- `rejected`: registration was declined.
- `suspended`: previously approved access is disabled.

### Customer membership roles

- `customer_admin`: all sites and machines in the assigned organization.
- `operator`: operational read access to assigned organizations or machines.
- `viewer`: read-only access to assigned organizations or machines.

An organization membership can grant access to every machine in that organization or be restricted to explicit machine assignments. Registration details such as company name or serial number are identification hints only and never create authorization automatically.

## Registration and approval

1. A customer submits name, work email, company, and optional machine/site information.
2. The application creates a `pending` request without organization or machine access.
3. A `staff_admin` reviews it and selects an organization, membership role, and all machines or explicit machines.
4. Approval is audited and enables magic-link sign-in.
5. Rejection and suspension revoke application access. Authorization is checked against the application database on every request.

Authentication responses must not reveal whether an email is registered or approved.

## Portal surfaces

### Customers

- Overview: assigned equipment health, alerts, and recent activity.
- My Equipment: assigned sites and machines with status and telemetry.
- Support: create and review support requests and messages.
- Documents: manuals, cutsheets, wiring diagrams, and scoped service files.
- Billing: read-only FreshBooks invoice summaries and secure invoice links.
- Account: profile and later customer-team administration.

### Staff only

- Fleet-wide dashboard, sites, machines, alerts, and audit log.
- Account approval, suspension, roles, organization membership, and machine assignment.
- Support queue, document publishing, and invoice synchronization.
- Telemetry ingest testing and internal diagnostics.

## Security invariants

1. Staff access is explicit through a platform role; a customer organization owner is not PermaCool staff.
2. Customer queries include an organization constraint derived from the authenticated application user.
3. Restricted memberships also constrain access through explicit machine assignments.
4. Detail routes return `404` for out-of-scope resources to avoid leaking existence.
5. Support, document, invoice, telemetry, and alert APIs share the page access policy.
6. Pending, rejected, and suspended users cannot enter protected routes.
7. Admin mutations verify `staff_admin` server-side and write an audit record.
8. FreshBooks credentials stay server-side; customers receive sanitized invoice data or approved hosted links.

## Delivery sequence

1. Identity and isolation: roles, account states, approval, assignments, centralized policies, and scoped existing queries.
2. Portal experience: role-aware navigation, customer language, and removal of internal tools from customer UI.
3. Service features: support tickets, scoped documents, and FreshBooks invoice references.
4. Hardening: cross-tenant regression tests, Prisma validation, type checking, production build, and manual access matrix.

## Completion criteria

- Pending applicants cannot access protected routes.
- Staff admins can approve applicants and assign organizations or machines.
- Staff roles can see all sites and machines; support staff cannot change account authorization.
- Customers cannot read another organization's resources through lists, APIs, or guessed identifiers.
- Restricted customers see only explicitly assigned machines.
- Customer navigation exposes no staff diagnostics or administration.
- Support requests, documents, and invoice summaries work for customers and authorized staff.
- Authorization tests, Prisma validation, type checking, and production build pass.

