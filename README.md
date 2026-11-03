# AppAmora

The AppAmora platform: AI Agents, Vibe Coding and AI SEO for small businesses — plus a no-code website builder (coming in phase 2).

## Structure

```
apps/
  web/          appamora.com — Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4
packages/
  db/           Prisma 7 + PostgreSQL schema and client (@appamora/db)
```

Managed with **pnpm** workspaces and **Turborepo**. Future products (builder dashboard, SEO tools, creator tools) go in `apps/` and share `packages/`.

## Getting started

Requirements: Node.js 22+, pnpm (`corepack enable pnpm`), Docker and the PostgreSQL client tools (`psql`, `pg_dump`).

```bash
pnpm install
pnpm db:up                                     # start local Postgres in Docker (port 5434)
cp packages/db/.env.example packages/db/.env   # already points at the local database
cp apps/web/.env.example apps/web/.env.local
pnpm db:migrate                                # create the tables
pnpm dev                                       # http://localhost:3000
```

Local database URL: `postgresql://appamora:appamora@localhost:5434/appamora?schema=public`

The site builds and runs without a database; only the contact form needs `DATABASE_URL`.

Other commands: `pnpm build`, `pnpm lint`, `pnpm typecheck`.

## Database

| Command | What it does |
|---|---|
| `pnpm db:up` / `pnpm db:down` | Start / stop the local Postgres container (data is kept in a Docker volume) |
| `pnpm db:migrate` | After changing `packages/db/prisma/schema.prisma`: create a migration and apply it locally |
| `pnpm db:studio` | Browse and edit the data in your browser |
| `pnpm db:deploy` | Apply migrations to the database in `DATABASE_URL` (use for the online database) |
| `pnpm db:export [url]` | Export data (local by default) to `backups/appamora-data-<date>.sql` |

### Moving the local data online (Neon / Supabase)

```bash
DATABASE_URL="<online url>" pnpm db:deploy     # 1. create the same tables online
pnpm db:export                                 # 2. export local data
psql "<online url>" -f backups/<file>.sql      # 3. import it
```

`backups/` is git-ignored because it contains personal data from contact forms.

## Languages

The site is served under `/en`, `/it` and `/sq`. Visitors hitting `/` are redirected to their saved or browser language (`src/proxy.ts`).

- UI text: `apps/web/src/i18n/dictionaries/*.ts`. English is the source of truth; TypeScript fails the build if another language is missing a key.
- Adding German or French: create `de.ts` / `fr.ts`, then add the code to `locales` in `src/i18n/config.ts` and to the `dictionaries` map in `src/i18n/index.ts`.

## Admin

The admin area lives at `/admin`; you log in on the site itself at `/en/login` (also `/it/login`, `/sq/login`).

- **Messages**: inbox for contact-form and waitlist messages.
- **Images**: logo (plus an optional version for dark backgrounds), social share image, homepage hero, About photo and blog covers. Uploads are stored in the database (so `pnpm db:export` includes them), re-encoded to WebP and stripped of metadata such as GPS location. Served from `/media/<id>`.
- **Menus**: header links and footer columns, with text in EN / IT / SQ. Without saved changes the site uses the built-in menus.

Saved images and menus are cached on the public site and refreshed instantly on save (`updateTag`).

```bash
pnpm admin:create you@example.com   # create an admin, or reset its password (asks in the terminal)
```

- Login uses [Better Auth](https://better-auth.com): email + password, plus Google once `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are set, and reCAPTCHA v3 once `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` are set.
- Public sign-up is off. Google can only log in to an account that already exists with the same email.
- Login is limited to 5 attempts per minute. Every admin page and action checks the session and the `ADMIN` role on the server (`src/lib/admin.ts`).

## Blog

Posts are markdown files in `apps/web/content/blog/<locale>/<slug>.md`:

```md
---
title: Post title
description: One-sentence summary used in cards and search results.
date: 2026-11-03
tag: AI SEO
---

Markdown content…
```

A post missing in Italian or Albanian falls back to the English version, with a notice.

## Deploying

1. **Database** — create a Postgres database on [Neon](https://neon.tech) or [Supabase](https://supabase.com) and run `DATABASE_URL="<its url>" pnpm db:deploy` to create the tables.
2. **Vercel** — import the GitHub repo, set **Root Directory** to `apps/web`, and add the `DATABASE_URL` and `NEXT_PUBLIC_SITE_URL` environment variables.
3. **Domain (GoDaddy)** — in Vercel add `appamora.com` and `www.appamora.com`, then in GoDaddy DNS set the records Vercel shows (an `A` record for `@` and a `CNAME` for `www`). Phase 2 will add a wildcard `*.appamora.com` record for client subdomains.

## Before launch

- Confirm the contact email and Instagram/TikTok URLs in `apps/web/src/lib/site.ts`.
- Replace the `[YOUR STORY …]` placeholder on the About page (all three dictionaries).
- Have a native speaker review the Albanian and Italian copy.
