# PermaCool

Single Next.js app for the PermaCool public marketing site and secure operations dashboard.

## App Surfaces

- Public marketing pages live under `app/` and render at routes such as `/`, `/contact-us`, `/insights`, and product/article URLs.
- Ops dashboard pages live under `app/(ops)/` and render at `/dashboard`, `/sites`, `/alerts`, `/audit-log`, `/admin/users`, `/devices/[deviceid]`, and `/ingest-test`.
- Ops APIs live under `app/api/health` and `app/api/ingest/telemetry`.
- Auth routes live under `app/sign-in` and `app/auth/callback`.

## Stack

- Next.js App Router
- React
- Resend for marketing contact form delivery
- Supabase Auth for protected ops routes when configured
- Supabase Postgres through Prisma for persisted ops data when `DATABASE_URL` is configured
- Mock/fallback ops data when Supabase or database env vars are absent

## Local Setup

```bash
npm install
npm run prisma:generate
npm run build
```

Copy `.env.example` to `.env.local` and fill in the values needed for the surface you are working on.

## Useful Scripts

```bash
npm run dev
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
npm run telemetry:test
```

## Deployment Shape

Use one Vercel project for the combined app. The public site can remain on `perma.cool`; the ops dashboard can be exposed as path-based routes such as `/dashboard` or later mapped behind `app.perma.cool` with routing/domain configuration while still using this repo and app.

Marketing and ops share a codebase, but protected dashboard routes are enforced by `proxy.ts` when Supabase is configured.
