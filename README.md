# La Pizarra

Sitio de noticias independiente de la comunidad escolar pública de Puerto Rico. Maestras, maestros y estudiantes publican noticias, reportajes y opinión sobre la educación pública.

Independent news site for Puerto Rico's public school community. One application holds both the public site and the newsroom's admin panel (`/admin`), built with Next.js (App Router) and Payload CMS on PostgreSQL.

## Where to look

| If you want to…                                 | Read                                             |
| ----------------------------------------------- | ------------------------------------------------ |
| Write, publish and manage the newsroom          | [GUIA-EDITORIAL.md](GUIA-EDITORIAL.md) (español) |
| Put the site online, back it up, add a domain   | [DEPLOY.md](DEPLOY.md)                           |
| Change the code with Claude Code or a developer | [CLAUDE.md](CLAUDE.md) and this file             |

## What it does

- **Newsroom:** three roles (administración, editor/a, colaborador/a) enforced on the server; drafts → review → published → archived; version history; scheduled publishing; live preview; document locking.
- **Public site:** portada with featured and per-section rows, article pages with author box, related and most-read, section / tag / author pages, search, monthly archive, RSS, sitemap, social cards, light and dark themes.
- **Readers:** contact and "Envía tu historia" forms, newsletter sign-up with double confirmation, CSV export. No public comments.
- **Student safety:** authors flagged as minors never expose last name, photo or social links through the site or its API.
- **Privacy and security:** no cookies for readers, no ad trackers, strict Content-Security-Policy, spam protection with Turnstile, a honeypot and rate limits.
- **Quality bar:** WCAG 2.2 AA (automated axe checks on every page type), Lighthouse mobile ≥ 90, 157 automated tests.

## Stack

Next.js 16 · React 19 · TypeScript (strict) · Payload CMS 3 with the Lexical editor · PostgreSQL (Docker locally, Neon in production) · Cloudflare R2 for media · Tailwind CSS 4 · Vitest and Playwright · deployed on Vercel.

## Requirements

- Node.js 26.13.1 or newer (see `.nvmrc`)
- pnpm 12 (`npm install -g pnpm`)
- Docker Desktop (runs the local PostgreSQL database)

## Local setup

```bash
pnpm install
```

```bash
cp .env.example .env
```

Open `.env` and fill in `PAYLOAD_SECRET`, `PREVIEW_SECRET` and `CRON_SECRET` with random strings (the file explains how to generate them), and choose a `SEED_PASSWORD`. Then start the database, load the sample content and start the site:

```bash
pnpm db:up
```

```bash
pnpm seed
```

```bash
pnpm dev
```

- Public site: http://localhost:3000
- Admin panel: http://localhost:3000/admin (sample accounts: `admin@`, `editor@`, `maestra@`, `estudiante@lapizarra.test`, all with your `SEED_PASSWORD`)

The sample content is fictional and exists only on the laptop. `pnpm seed` refuses to run against any database that is not local.

## Commands

| Command                    | What it does                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `pnpm dev`                 | Start the site in development mode                                                       |
| `pnpm build`               | Production build                                                                         |
| `pnpm start`               | Serve the production build                                                               |
| `pnpm db:up`               | Start local Postgres (Docker)                                                            |
| `pnpm db:down`             | Stop local Postgres                                                                      |
| `pnpm seed`                | Wipe the local database and load fictional sample content                                |
| `pnpm lint`                | ESLint                                                                                   |
| `pnpm typecheck`           | TypeScript, strict mode                                                                  |
| `pnpm format`              | Format everything with Prettier                                                          |
| `pnpm test:unit`           | Unit tests (no database needed)                                                          |
| `pnpm test:int`            | Integration tests against the `lapizarra_test` database                                  |
| `pnpm test`                | Unit + integration tests                                                                 |
| `pnpm test:e2e`            | Browser tests: needs `pnpm seed` first, and `pnpm exec playwright install chromium` once |
| `pnpm generate:types`      | Regenerate `src/payload-types.ts` after changing collections                             |
| `pnpm migrate:create name` | Create a migration file after changing the shape of the data (see DEPLOY.md)             |
| `pnpm respaldo`            | Save a copy of the production database to `respaldos/` (see DEPLOY.md)                   |
| `pnpm build:vercel`        | What Vercel runs: apply migrations, create first-deploy content if empty, build          |

## How it is organized

```
src/payload.config.ts      Payload configuration
src/app/(payload)/         Admin panel + REST/GraphQL API (template files, not edited by hand)
src/app/(frontend)/        Public site
src/collections/           Content types: artículos, autores, usuarios, media, páginas…
src/globals/               Portada, ajustes, menús
src/access/                Who may do what: one small tested function per rule
src/hooks/                 Editorial workflow, cache refresh, delete rules
src/lib/                   Dates, URLs, data access, search, email, newsletter, SEO
src/migrations/            Database changes applied on each deploy
src/seed/                  Sample content (local) and first-deploy content (production)
scripts/respaldo.mjs       Production database backup
tests/unit|int|e2e/        Vitest unit, Vitest integration, Playwright
.github/workflows/         CI (tests) and the scheduled-publishing timer
```

## Production in one paragraph

Pushing to `main` on GitHub runs the tests and makes Vercel build and publish. The build applies pending database migrations to Neon first. Photos go straight from the admin to Cloudflare R2. A GitHub Actions timer calls the site every 10 minutes to publish scheduled articles. Content edits never need a deploy: saving in the admin refreshes the affected pages within seconds. Details and the step-by-step are in [DEPLOY.md](DEPLOY.md).

## Environment variables

Every variable is documented in `.env.example`. Secrets live only in `.env` on the laptop (never committed) and in Vercel's settings in production.
