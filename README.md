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

## Set up on a new computer (Ubuntu/Debian)

```bash
sudo apt install -y git gh          # if they're not installed yet
gh auth login                       # log in to GitHub (choose HTTPS, then log in with the browser)
gh repo clone KrenarLipo/AppAmoraDevsite
cd AppAmoraDevsite
./setup.sh
```

`setup.sh` checks and installs what's missing (Node.js via nvm, pnpm, Docker), installs the packages, creates the local settings files with a new secret, starts the local database and creates its tables. It can also copy your data from the online database and add an **AppAmora (dev)** icon to the apps menu. It's safe to run again.

Day to day, on any computer:

```bash
git pull                 # new packages and database changes are applied automatically (.githooks/post-merge)
./scripts/start.sh       # or the AppAmora icon: starts the database and the site, opens the browser
pnpm db:pull-online      # optional: replace local data with a fresh copy of the online database
```

Settings files (`apps/web/.env.local`, `packages/db/.env*`) are never in git. Each computer gets its own; copy keys you need (Google, PayPal) by hand.

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

## Website builder (clients)

Businesses get a dashboard at **/dashboard** to build their own site, shown at **appamora.com/s/&lt;name&gt;** (subdomains come later). Clients' sites are kept out of search results until then.

- **Admin → Clients**: create a client (business, login, plan, template, language). The password is shown once to send to them. Edit the plan, the trial end and the "paid until" date, record cash payments, confirm pending ones, add logins, and use **View as client** to open their dashboard exactly as they see it.
- **Plans** (`src/lib/plans.ts`): the free trial gets 3 templates, 3 pages and 1 language. Starter adds all 6 templates, colors and fonts, the slideshow, 6 pages, 2 languages, subscribers and the WhatsApp button. Pro: unlimited pages, 5 languages, no badge, 3 logins. An account is **paid** while "paid until" is today or later. When the trial ends unpaid, the site goes offline and the client can only change the name and logo.
- **Dashboard**: design (template, logo, colors, fonts), home page (headline, slideshow, subscriber box), pages (markdown, per language), contact details and languages, messages from the site's contact form, subscribers (CSV download), plan and billing.
- **Templates** (`src/lib/sites/templates.ts`): 6 themes over the same building blocks, rendered by `src/app/s/[slug]/[[...path]]`.
- **Payments**: clients pay 1, 3 or 12 months with **PayPal or card** (`src/lib/paypal.ts`, Orders API; the server sets the amount and checks it after capture), or ask for **cash on delivery**, which you confirm in the admin. Without PayPal keys, only cash is offered.

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
