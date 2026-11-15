# La Pizarra — notes for future sessions

Independent news site for Puerto Rico's public school community. The owner is a public school teacher, **not a developer**: explain in plain language, and every content task must be doable from the admin panel without code.

## Stack (verified November 2026)

- Next.js 16.4 (App Router, RSC), React 19, TypeScript strict
- Payload CMS 3.93 in the same app (`/admin`), Lexical editor
- PostgreSQL via `@payloadcms/db-postgres` (Docker Compose locally, Neon in production)
- Media: local disk in dev, Cloudflare R2 through `@payloadcms/storage-s3` in production
- Tailwind CSS 4 (no UI kit), Vitest, Playwright, ESLint 9 flat config, Prettier
- Node 26.13.1+, pnpm 12. Deploy target: Vercel

## Commands

`pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm typecheck` · `pnpm format` · `pnpm test:unit` · `pnpm test:int` (needs Postgres) · `pnpm test:e2e` · `pnpm db:up` · `pnpm seed` (wipes and refills the LOCAL database with fictional content) · `pnpm generate:types` · `pnpm generate:importmap`

After every phase: lint, typecheck and tests must pass before committing.

## Conventions

- **Language:** public UI, URLs, admin labels and collection/field names are in Spanish (Puerto Rico). Code comments and docs for developers are in English. `GUIA-EDITORIAL.md` is in Spanish.
- **Dates:** always through `src/lib/fechas.ts` (`es-PR`, `America/Puerto_Rico`).
- **Access control:** one small pure function per rule in `src/access/`, enforced on collections and fields server-side, unit-tested. Never rely on hiding things in the UI.
- **Student safety:** authors flagged as minors never expose last name, photo or social links publicly. The public site reads only `nombrePublico`.
- **Rendering:** public pages are static/ISR with tag revalidation from Payload hooks. Keep client JS minimal. `cacheComponents` stays off (Payload does not guarantee compatibility).
- **Dependencies:** ask the owner before adding any paid service or major dependency. Prefer Payload built-ins.
- **Docs first:** check current Next.js and Payload docs before using an API; both move fast.
- **pnpm 12:** build-script approvals live in `pnpm-workspace.yaml` (`allowBuilds`), not in `package.json`.
- Files in `src/app/(payload)/` come from the Payload template and should not be edited by hand.

## Data model notes

- Collections: `articulos`, `categorias`, `etiquetas`, `media`, `paginas`, `autores`, `usuarios`, `mensajes`, `suscriptores`, `vistas`. Globals: `portada`, `ajustes`, `navegacion`.
- Roles on `usuarios.rol`: `admin`, `editor`, `colaborador`. The first account ever created becomes admin.
- Workflow rules live in `src/hooks/flujoEditorial.ts` (pure) and are applied in `Articulos.ts`. Field validation runs AFTER collection `beforeChange` hooks, so a select `filterOptions` must allow any value a hook may set.
- `mensajes`, `suscriptores`, `vistas` have `create` closed to the API; server code writes them with the Local API.
- Fields with a default that are `required` are also required in the generated create types; slugs use a `validate` function instead of `required` for that reason.
- `payload run` exits when the module finishes loading: scripts must use top-level `await`.
- Changing a collection slug or a `localized` flag in dev makes the schema push prompt interactively; reset the local DB instead (`docker compose down -v && pnpm db:up && pnpm seed`).

## Layout

```
src/payload.config.ts      Payload configuration
src/app/(payload)/         Admin panel + REST/GraphQL API (template files)
src/app/(frontend)/        Public site
src/collections/           Payload collections
src/globals/ blocks/ fields/ hooks/ access/   Globals, editor blocks, shared fields, workflow, access rules
src/seed/                  Fictional sample content (`pnpm seed`)
src/lib/                   Shared utilities (fechas.ts, later search/, email/, seo/)
tests/unit|int|e2e/        Vitest unit, Vitest integration (Local API), Playwright
docker-compose.yml         Local Postgres (+ lapizarra_test database)
.github/workflows/ci.yml   Lint, format check, typecheck, tests
```

## Phase plan

1. Setup — **done**
2. Data model, roles/access control, editorial workflow, seed — **done** (live preview config moves to phase 3, with the article page)
3. Public site (owner chooses between two visual directions first: A "Edición impresa", B "Pizarra")
4. Search, RSS, sitemap, SEO/structured data, OG images, share buttons
5. Forms (contact/submissions, newsletter), Turnstile + honeypot, email
6. Design polish, dark mode, accessibility and performance audit
7. Tests
8. Deployment (Vercel + Neon + R2), `DEPLOY.md`, `GUIA-EDITORIAL.md`

Decisions already made with the owner: authors are a separate collection from users; editorial state is a custom `estadoEditorial` field kept in sync with Payload's `_status`; search sits behind a `SearchProvider` interface (Postgres full-text first); scheduled publishing is triggered by a GitHub Actions timer calling `/api/payload-jobs/run` (Vercel's free plan only runs cron daily); email provider is chosen by env var and not decided yet; no public comments in v1.
