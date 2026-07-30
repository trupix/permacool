# Production database migration procedure

This release contains two additive migrations:

- Cannon Falls site, controller, and existing external VPN enrollment
- Organization-scoped site equipment configuration records

The application build does not run database migrations. Migration deployment is a separate, reviewed production operation.

## Pre-deployment checks

1. Confirm the target is the production database and take a current managed backup or snapshot.
2. Confirm `org-permacool` is the intended owner of Cannon Falls.
3. Run the read-only collision check:

   `npm run prisma:migrate:preflight:cannon-falls`

4. Stop if it reports any site, device, VPN identity, or tunnel-IP conflict. Resolve the ownership mismatch before continuing.
5. Review the pending migration list:

   `npx prisma migrate status`

## Controlled deployment

Run the following once from an approved release environment with the production `DATABASE_URL`:

`npm run prisma:migrate:deploy`

Do not add this command to the Vercel build step. Do not use `prisma migrate dev` against production.

## Verification

After deployment, confirm:

- `site-cannon-falls` belongs to `org-permacool`.
- `epic-cannon-falls-01` belongs to `site-cannon-falls`.
- `cannon-falls-groov-epic-01` and tunnel IP `172.28.0.11` belong only to that controller.
- `SiteEquipmentConfiguration` exists with its foreign key to `Site`.
- Owner and Operator accounts can update equipment for their organization; Viewer accounts receive `403`.
- A user from another organization receives `404` for the site, PLC, weather, telemetry, events, and equipment endpoints.

If any verification fails, stop the application rollout and restore the database snapshot before retrying. The VPN server and existing `.ovpn` profiles are not changed by these migrations.
