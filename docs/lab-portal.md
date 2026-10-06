# Separate lab portal

`/lab` has its own navigation and equipment workspace, separate from the marketing site and operations dashboard. It is not linked from the public marketing navigation or sitemap. The page and API require approved lab membership or platform staff access. Missing auth/database configuration fails closed. Viewer memberships cannot save.

## Setup

1. Deploy the `LabCatalog` migration through the existing reviewed database migration process. It enables RLS with no anonymous policies; the existing trusted Prisma database role must have appropriate access.
2. Set `LAB_ORGANIZATION_ID` to the intended existing Organization ID. Use the existing Supabase authentication and database configuration. Assign approved lab members through the current membership workflow.
3. Import verified records using the portal's authenticated API with `{ revision: 0, catalog }`, or add equipment through the UI. Never commit customer inventory to this public repository. The catalog structure and validation live in `lib/lab-catalog.ts`.
4. Visit `/lab`. Optionally map a separately configured lab subdomain through the existing hosting provider; no DNS change is included here.

The database stores the catalog by organization with a revision check to prevent silent concurrent overwrites. A stale save returns 409, retaining the user's form. Service entries distinguish observations from completed repairs. States are manual dated observations, not sensor telemetry. External document links are restricted to HTTPS.

## Local review

Run the Next development server on `127.0.0.1` with `LAB_LOCAL_PREVIEW=1`. The isolated preview reads/writes `.lab-private/catalog.json` (ignored by Git). It never enables the preview bypass in production. Missing local data produces an empty catalog. Local preview data is not copied to production during builds.

Check with `node scripts/test-lab-catalog.ts`, TypeScript checking and the normal build. Verify search, type/state filters, adding equipment, condition checks, parts, service notes, save/reload, and stale revision rejection. Production readiness additionally requires live migration and authentication checks with two organizations and a viewer account.
