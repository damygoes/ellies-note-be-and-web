# ElliesNote: backend & website

This repo holds the API behind the ElliesNote iOS app and the public website (landing page, privacy policy, terms, support). ElliesNote is a quick daily check-in app for people living with CFS/ME, fibromyalgia and similar conditions. You log energy, symptoms, sleep and crash days, and the app helps you spot patterns over time.

The mobile app lives in a separate repo.

## Stack

- Next.js 16 (App Router) on Vercel
- Postgres on Neon, with Drizzle ORM
- Clerk for auth
- Upstash QStash for scheduled reminder jobs, sent as Expo push notifications
- RevenueCat for subscriptions (webhook only)
- Sentry for error tracking

## Running locally

```bash
pnpm install
pnpm dev
```

The app reads its env from `.env.local` (or `.env.development.local`) and validates it on startup, so it will fail fast if something is missing. You'll need:

```
DATABASE_URL, DATABASE_HOST, DATABASE_PORT, DATABASE_NAME,
DATABASE_USERNAME, DATABASE_PASSWORD
CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
QSTASH_URL, QSTASH_TOKEN, QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY
REVENUECAT_WEBHOOK_SECRET
NEXT_PUBLIC_SENTRY_DSN
```

The full list and its validation are in `src/lib/env.server.ts` and `src/lib/env.client.ts`.

## Database

Schemas are in `src/db/schema/`, and generated migrations go in `src/db/drizzle/`.

```bash
pnpm db:generate      # create a migration from schema changes
pnpm db:migrate       # apply migrations (uses your local env)
pnpm db:migrate-prod  # apply migrations against production
```

drizzle-kit needs a direct connection, so if `DATABASE_URL_UNPOOLED` is set it's used instead of the pooled Neon URL.

## Project layout

```
src/app/api/     API routes (check-ins, crash days, health metrics, integrations, webhooks, cron)
src/app/         website pages
src/db/          Drizzle client, schemas and migrations
src/features/    domain types and helpers
src/utils/       small shared helpers (dates, request parsing, errors)
```

`GET /api/health` returns the current environment and DB host. It's handy for checking a deployment is pointing at the right database.
