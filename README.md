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
- **Images**: logo (plus an optional version for dark backgrounds), social share image, homepage hero and About photo. Uploads are stored in the database (so `pnpm db:export` includes them), re-encoded to WebP and stripped of metadata such as GPS location. Served from `/media/<id>`.
- **Blog**: write, translate and publish posts (see [Blog](#blog)).
- **Site settings**: contact email and phone, social links (empty ones are hidden), prices and free-trial length, and the company details used in the Privacy Policy and Terms.
- **Menus**: header links and footer columns, with text in EN / IT / SQ. Without saved changes the site uses the built-in menus.

Saved images and menus are cached on the public site and refreshed instantly on save (`updateTag`).

```bash
pnpm admin:create you@example.com   # create an admin, or reset its password (asks in the terminal)
```

- Login uses [Better Auth](https://better-auth.com): email + password, plus Google once `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are set, and reCAPTCHA v3 once `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` are set.
- Public sign-up is off. Google can only log in to an account that already exists with the same email.
- Login is limited to 5 attempts per minute. Every admin page and action checks the session and the `ADMIN` role on the server (`src/lib/admin.ts`).

## Blog

Posts are written at **/admin/blog** and stored in the database (`BlogPost` + one `BlogPostTranslation` per language).

- English is required; Italian and Albanian are optional. A post without a translation shows the English version, with a notice.
- The text is markdown, with a toolbar for headings, bold, links, lists, quotes and pictures. Raw HTML is stripped when the post is shown (`src/lib/markdown.ts`).
- Drafts are only visible in the admin. Saving a post refreshes the blog, the homepage and the sitemap straight away (`updateTag("blog")`).
- Cover images and pictures inside posts are stored like other uploads (`/media/<id>`). Deleting a post removes its pictures too.

## Deploying

Production runs on Vercel (region `fra1`, Frankfurt) with a Neon database in `eu-central-1`.

1. **Database** — create a Postgres database on [Neon](https://neon.tech) (EU region). With its *direct* (non-pooler) connection string, run `DATABASE_URL="<direct url>" pnpm db:deploy` to create the tables, then import data with `pnpm db:export` + `psql` (see [Database](#database)).
2. **Vercel** — import the GitHub repo and set **Root Directory** to `apps/web`. Add these environment variables:
   - `DATABASE_URL` — Neon's *pooled* connection string, with `sslmode=verify-full`
   - `BETTER_AUTH_SECRET` — a new random value (`openssl rand -base64 32`), not the local one
   - `NEXT_PUBLIC_SITE_URL` — `https://appamora.com`
   - `ENABLE_EXPERIMENTAL_COREPACK` — `1`, so Vercel uses the pnpm version from `package.json`
   - Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`

   Login uses Vercel's production domain automatically; set `BETTER_AUTH_URL` only to override it.
3. **Domain (GoDaddy)** — in Vercel add `appamora.com` and `www.appamora.com` (redirecting `www` to the main domain), then in GoDaddy DNS set the records Vercel shows. Phase 2 will add a wildcard `*.appamora.com` record for client subdomains.

## Before launch

- Replace the `[YOUR STORY …]` placeholder on the About page (all three dictionaries).
- Have a native speaker review the Albanian and Italian copy.
