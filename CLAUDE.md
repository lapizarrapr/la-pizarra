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

## Public site notes

- Routes live in `src/app/(frontend)/[locale]/`; `src/proxy.ts` serves Spanish without a prefix and redirects `/es/...` to the bare path. Build URLs only with `src/lib/rutas.ts`.
- All reads go through `src/lib/datos.ts` (`unstable_cache` + tags, `overrideAccess: false`). `src/hooks/revalidar.ts` expires tags from Payload hooks; verified in production mode for publish, edit and unpublish.
- Fixed strings live in `src/lib/i18n/es.ts`. Design tokens (light/dark) are CSS variables in `globals.css`, exposed to Tailwind as `fondo`, `tinta`, `gris`, `linea`, `acento`, `pizarra`, `tiza`, `alerta`, `superficie`.
- Images use `components/ImagenMedia.tsx` (plain `<img>` + srcset from Payload sizes), not `next/image`.
- Rich text renders through `components/TextoRico.tsx` (React elements, never raw HTML).
- Draft preview: `/vista-previa?ruta=…&secreto=…` enables draft mode only with the secret AND a logged-in newsroom user.
- Search: `src/lib/search/` (`ProveedorDeBusqueda` interface; Postgres full-text with `unaccent`, computed per query, no index yet). Raw SQL goes through `src/lib/db.ts` with bound parameters only.
- "Más leídas": `POST /api/vistas/registrar` (endpoint on the `vistas` collection) counts same-origin, non-bot views per article per day; ranking is cached 10 minutes.
- Feeds: `/feed.xml` and `/seccion/[slug]/feed.xml`. Also `/sitemap.xml`, `/robots.txt`, `/archivo`, `/archivo/AAAA/MM`, `/buscar?q=`.
- Social cards: the article photo's `og` size, or a generated card at `/og/articulo/[slug]` (`/og/sitio` for everything else). JSON-LD lives in `src/lib/seo.ts`.
- Scheduled publishing verified end to end: queue → `GET /api/payload-jobs/run` with `Authorization: Bearer $CRON_SECRET` → article live.
- Forms: server actions in `src/app/(frontend)/acciones.ts`; check order is spam trap → rate limit → Turnstile → validation → store → email. Validation is pure (`src/lib/formularios.ts`). Rate limit and Turnstile live in `src/lib/proteccion.ts` (Postgres-backed `limites` collection, keyed hash, never an IP). Turnstile is skipped when its keys are unset.
- Newsletter: `src/lib/newsletter/` (`ProveedorDeBoletin` interface, Payload implementation). Double opt-in with hashed 48h token; confirm and unsubscribe pages act only on a button press (POST), never on opening the link. `enlaceDeBaja(id)` builds the signed unsubscribe link. CSV export: `GET /api/suscriptores/exportar` (editor/admin).
- Email: `src/lib/email/adaptador.ts` picks Resend, SMTP or a console stand-in from env vars; templates in `plantillas.ts` (always escape visitor input). Restart `pnpm dev` after changing `payload.config.ts`-level settings such as the email adapter: the Payload instance is cached.
- "Quién firma" author box at the end of articles: `components/CajaDeAutores.tsx` (photo or monogram, description, bio). Minors need no special case there; the API already strips their photo and name.
- After `pnpm seed` with the dev server running, cached pages stay stale until something is saved in the admin (the seed runs outside Next.js, so it cannot expire the cache).
- Security headers and both Content-Security-Policies (public, admin) are built in `next.config.ts`. Any new third-party script, frame or image host must be added there or the browser blocks it. Inline scripts stay allowed because static pages need them.
- Audits (phase 6, production build, sample content): axe WCAG 2.2 AA = 0 violations on 12 page types × light/dark × phone/desktop (`tests/e2e/accesibilidad.e2e.spec.ts`); Lighthouse mobile ≈ 95 performance, 100 accessibility / best practices / SEO on home and article. Run e2e against a production build with `E2E_BASE_URL=http://localhost:3100 pnpm test:e2e`.
- Lighthouse cannot launch Chrome by itself on this Windows machine ("spawn UNKNOWN"): launch Chromium through Playwright with `--remote-debugging-port` and pass `--port` to Lighthouse.
- Inter (UI labels) is deliberately not preloaded; it kept LCP under 3 s on throttled mobile.
- Deleting: `src/hooks/borrado.ts`. An article's `vistas` rows are removed with it (the NOT NULL foreign key otherwise makes the delete fail with a 500); sections and authors still used by articles refuse deletion with a Spanish message. When adding a required relationship to another collection, add the matching delete rule.
- `APIError` messages reach the admin user only when the 4th argument (`isPublic`) is `true`.
- Admin "Publish" button visibility comes from calling `update` access with `data._status = 'published'`; `actualizarArticulos` answers `false` for writers there.
- `admin.avatar` is `'default'` (no Gravatar: it leaks a hash of staff emails and the CSP blocks it).
- Admin document locking: while one person has an article open, others get a "document locked" dialog with "take over".
- Changes inside `payload.config.ts` or collection hooks may need a dev-server restart to take effect.
- Delete `.next/` if `tsc` reports errors inside `.next/types` after moving routes.

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
3. Public site — **done**. Owner chose direction **B "Pizarra"** (green masthead, chalk-yellow accent; Fraunces / Newsreader / Inter). Share buttons, related, prev/next, most-read and search come in phase 4; form blocks render a placeholder until phase 5
4. Search, RSS, sitemap, SEO/structured data, OG images, share buttons — **done**
5. Forms (contact/submissions, newsletter), Turnstile + honeypot, email — **done** (email provider still undecided; Turnstile not yet exercised against Cloudflare)
6. Design polish, dark mode, accessibility and performance audit — **done** (manual screen-reader pass and admin-panel CSP under real editing still to do)
7. Tests — **done**: 61 unit, 35 integration, 61 browser (Playwright). `tests/e2e/flujo-editorial.e2e.spec.ts` drives the real admin (writer drafts → editor publishes → portada/section/search → delete); helpers in `tests/helpers/admin.ts`. Browser tests need the sample content and `SEED_PASSWORD`. The CI workflow (lint/unit/integration job + e2e job on a production build) has never run on GitHub yet
8. Deployment (Vercel + Neon + R2), `DEPLOY.md`, `GUIA-EDITORIAL.md`

Decisions already made with the owner: authors are a separate collection from users; editorial state is a custom `estadoEditorial` field kept in sync with Payload's `_status`; search sits behind a `SearchProvider` interface (Postgres full-text first); scheduled publishing is triggered by a GitHub Actions timer calling `/api/payload-jobs/run` (Vercel's free plan only runs cron daily); email provider is chosen by env var and not decided yet; no public comments in v1.
