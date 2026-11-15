# La Pizarra

Sitio de noticias independiente de la comunidad escolar pública de Puerto Rico. Maestras, maestros y estudiantes publican noticias, reportajes y opinión sobre la educación pública.

Independent news site for Puerto Rico's public school community, built with Next.js (App Router) and Payload CMS in a single app. The admin panel lives at `/admin`.

> Status: phase 6 of 8 done (security headers, accessibility and performance audit, dark mode, print styles).

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

## Commands

| Command               | What it does                                                                   |
| --------------------- | ------------------------------------------------------------------------------ |
| `pnpm dev`            | Start the site in development mode                                             |
| `pnpm build`          | Production build                                                               |
| `pnpm db:up`          | Start local Postgres (Docker)                                                  |
| `pnpm seed`           | Wipe the local database and load fictional sample content                      |
| `pnpm db:down`        | Stop local Postgres                                                            |
| `pnpm lint`           | ESLint                                                                         |
| `pnpm typecheck`      | TypeScript, strict mode                                                        |
| `pnpm format`         | Format everything with Prettier                                                |
| `pnpm test:unit`      | Unit tests (no database needed)                                                |
| `pnpm test:int`       | Integration tests against the `lapizarra_test` database                        |
| `pnpm test`           | Unit + integration tests                                                       |
| `pnpm test:e2e`       | Playwright end-to-end tests (run `pnpm exec playwright install chromium` once) |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` after changing collections                   |

## Environment variables

Every variable is documented in `.env.example`.
