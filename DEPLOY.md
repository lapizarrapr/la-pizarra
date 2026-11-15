# Putting La Pizarra online

This guide takes the site from this laptop to the internet. It assumes you have never done this before. Each step says what you are doing, where to click, and what to copy.

Your laptop is only the workshop. Once this is done, the site runs entirely on four outside services, and it keeps running with the laptop closed.

| Service        | What it does for La Pizarra                                                       | Cost                                         |
| -------------- | --------------------------------------------------------------------------------- | -------------------------------------------- |
| **GitHub**     | Keeps the code, runs the tests, and is the 10-minute clock for scheduled articles | Free                                         |
| **Neon**       | The database: articles, accounts, subscribers                                     | Free plan                                    |
| **Cloudflare** | R2 stores the photos; Turnstile stops spam robots                                 | Free allowance (R2 asks for a card on file)  |
| **Vercel**     | Runs the website and the admin panel                                              | Free "Hobby" plan (see the note below)       |
| A domain name  | Your own address, such as `lapizarra.org`                                         | About $10–15 a year. Optional at first       |
| Email provider | Sends newsletter confirmations and password resets                                | Free plan. Needs a domain. Optional at first |

Free plans change. Check each service's pricing page when you sign up; the limits that matter are listed in [Limits to keep an eye on](#limits-to-keep-an-eye-on).

> **Vercel's free plan is for non-commercial use.** A volunteer news site with no advertising and no sales fits. If La Pizarra ever carries ads, sponsorships or paid subscriptions, it needs Vercel's paid plan.

**Time:** about two hours, in one sitting or several. Steps 1 to 6 put the site online. Steps 7 to 10 can wait a few days.

**Three rules about secrets**

1. Passwords, keys and "connection strings" go only into the settings pages named in this guide. Never into a file in the project, an email or a chat.
2. Use a password manager, and turn on two-step verification on all four services. Whoever gets into these accounts controls the site.
3. If a secret is ever exposed, replace it in the service that issued it, update it in Vercel, and redeploy.

---

## Before you start: a notepad of values

You will collect values in steps 2 to 4 and paste them into Vercel in step 5. Keep them in your password manager as you go.

You also need three random secrets of your own. Run this three times in the project's terminal and save the three results as `PAYLOAD_SECRET`, `PREVIEW_SECRET` and `CRON_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Do not reuse the ones in the laptop's `.env` file. Production gets its own.

---

## Step 1. GitHub: a home for the code

1. Create an account at github.com and turn on two-step verification (Settings → Password and authentication).
2. Create a repository: the **+** at the top right → **New repository**. Name it `la-pizarra`. Leave "Add a README" unchecked.
3. Choose **Public** or **Private**:
   - **Public (recommended).** Anyone can read the code. It contains no passwords, no articles and no personal data, and many newsrooms publish theirs. GitHub's automation is free without limit for public repositories.
   - **Private.** The code is hidden, but the free plan includes a limited number of automation minutes each month (about 2,000), and the 10-minute clock alone would use roughly 4,300. If you choose private, open `.github/workflows/publicacion-programada.yml` and change `*/10` to `*/30`. Scheduled articles will then go out up to half an hour late.
4. **Before the first upload, fix the name on the commits.** Every saved change ("commit") records an email address, and right now it is your personal one. GitHub gives you a private stand-in: Settings → Emails → check **Keep my email addresses private**, and copy the address that ends in `@users.noreply.github.com`. Ask Claude Code: "replace the email on all commits with this one" and paste it. Do this before step 5 below; afterwards it is much harder.
5. Upload the code. GitHub shows the two commands under "…or push an existing repository". They look like this, with your user name:

```bash
git remote add origin https://github.com/TU-USUARIO/la-pizarra.git
```

```bash
git push -u origin main
```

A browser window asks you to sign in to GitHub the first time.

6. Open the repository's **Actions** tab. A run called "CI" starts by itself and takes about ten minutes. A green check means all 157 tests passed on GitHub's computers. This workflow has never run there before; if it turns red, open the run, copy the error and ask Claude Code to fix it.

---

## Step 2. Neon: the database

1. Create an account at neon.com (you can sign in with GitHub).
2. Create a project:
   - Name: `la-pizarra`
   - Postgres version: **17** (the same one the laptop uses)
   - Region: **AWS US East (N. Virginia)**. It is the closest to Puerto Rico and to where Vercel runs the site.
3. Press **Connect**. Make sure **Connection pooling** is on, and copy the connection string. It starts with `postgresql://` and its host name contains `-pooler`. Save it as `DATABASE_URL`.
4. In the same window turn connection pooling **off** and copy that second string (no `-pooler`). Save it as "Neon direct connection". You need it only for backups (step 10).

These two strings contain the database password. Treat them like a password.

You do not create any tables. The first deploy builds them.

---

## Step 3. Cloudflare: photos (R2) and spam protection (Turnstile)

Create an account at cloudflare.com and turn on two-step verification.

### 3a. The photo bucket

1. In the dashboard open **R2 Object Storage**. Cloudflare asks for a payment card to activate R2, even though the free allowance (about 10 GB, several thousand photos) costs nothing.
2. **Create bucket** → name `la-pizarra-media` → location **Automatic** → Standard storage.
3. Open the bucket → **Settings** → **Public access** → enable the **Public Development URL** (`r2.dev`). Copy the address it shows, which looks like `https://pub-xxxxxxxx.r2.dev`. Save it as `R2_PUBLIC_URL`, with no slash at the end. When you have your own domain, step 8 replaces it with `media.your-domain`.
4. Still in Settings, find **CORS policy** → **Add** and paste this, then save. It lets the admin panel send photos straight to the bucket. Replace the address in step 5 once you know it.

```json
[
  {
    "AllowedOrigins": ["https://la-pizarra.vercel.app"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

5. Create the key the site uses to store photos: R2 → **Manage API tokens** → **Create API token**.
   - Permission: **Object Read & Write**
   - Apply to **specific bucket**: `la-pizarra-media`
   - No expiry
6. The next page shows values that appear **only once**. Save three:
   - Access Key ID → `R2_ACCESS_KEY_ID`
   - Secret Access Key → `R2_SECRET_ACCESS_KEY`
   - The S3 endpoint, `https://<letters-and-numbers>.r2.cloudflarestorage.com` → `R2_ENDPOINT`

### 3b. Turnstile

1. Dashboard → **Turnstile** → **Add widget**.
2. Name: `La Pizarra`. Hostnames: `la-pizarra.vercel.app` for now (add your domain in step 8). Mode: **Managed**.
3. Save the **Site key** as `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and the **Secret key** as `TURNSTILE_SECRET_KEY`.

---

## Step 4. Email (can wait until you have a domain)

The site sends three kinds of email: "confirm your subscription" to newsletter readers, "reset your password" to newsroom members, and a notice to you when someone uses the contact or "Envía tu historia" forms.

Email providers only send from an address at a domain you own. Until you have a domain, skip this step. **What that means meanwhile:**

- Messages from the forms are still saved. Read them in the admin under **Mensajes recibidos**.
- Nobody can confirm a newsletter subscription, so the list stays empty.
- "Olvidé mi contraseña" does not work. An administrator sets a new password by hand (Usuarios → the person → change password).

When you have a domain (step 8), the simplest option is **Resend** (free plan: about 3,000 emails a month, 100 a day, one domain):

1. Create an account at resend.com → **Domains** → **Add domain** → your domain.
2. Resend lists DNS records. Add each one where your domain is managed, then press **Verify**.
3. **API Keys** → **Create API key** with "Sending access" only. Save it as `RESEND_API_KEY`.

Any other provider that offers SMTP works too: fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` and `SMTP_PASS` instead.

> The site collects and confirms subscribers and exports them as a CSV file. It does not send the newsletter itself. When you start mailing the list, do it from a newsletter service, which handles unsubscribes and bulk limits.

---

## Step 5. Vercel: the website

1. Create an account at vercel.com with **Continue with GitHub**. Choose the **Hobby** plan.
2. **Add New… → Project** → import `la-pizarra`. Vercel asks permission to read that repository; grant it for that one repository only.
3. Leave the build settings alone. The file `vercel.json` in the project already tells Vercel what to run.
4. Open **Environment Variables** and add each row below. Names must match exactly.

| Name                             | Value                                                        |
| -------------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`                   | The Neon string **with** `-pooler` (step 2)                  |
| `PAYLOAD_SECRET`                 | Your first random secret                                     |
| `PREVIEW_SECRET`                 | Your second random secret                                    |
| `CRON_SECRET`                    | Your third random secret                                     |
| `NEXT_PUBLIC_SITE_URL`           | `https://la-pizarra.vercel.app` for now. No slash at the end |
| `R2_BUCKET`                      | `la-pizarra-media`                                           |
| `R2_ACCESS_KEY_ID`               | From step 3a                                                 |
| `R2_SECRET_ACCESS_KEY`           | From step 3a                                                 |
| `R2_ENDPOINT`                    | From step 3a                                                 |
| `R2_PUBLIC_URL`                  | The `https://pub-….r2.dev` address. No slash at the end      |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | From step 3b                                                 |
| `TURNSTILE_SECRET_KEY`           | From step 3b                                                 |
| `EMAIL_FROM_NAME`                | `La Pizarra`                                                 |
| `EMAIL_FROM_ADDRESS`             | Later, with a domain: for example `redaccion@your-domain`    |
| `EDITOR_EMAIL`                   | Later: the inbox that receives form notices                  |
| `RESEND_API_KEY`                 | Later (step 4)                                               |
| `NEXT_PUBLIC_ANALYTICS_ENABLED`  | `false` for now (step 9)                                     |

Do **not** add `SEED_PASSWORD` or `TEST_DATABASE_URL`. They belong to the laptop only.

5. Press **Deploy** and wait about five minutes. On this first deploy the site creates the database tables, the nine sections, the five fixed pages (Sobre Nosotros, Política Editorial, Contacto, Cómo Colaborar, Privacidad) and the menus. No sample articles and no accounts are created.
6. Check the real address. Vercel shows it when the deploy finishes, and under Settings → Domains. If it is not exactly `https://la-pizarra.vercel.app` (Vercel adds letters when a name is taken), then:
   - change `NEXT_PUBLIC_SITE_URL` in Vercel to the real address,
   - change the address in the R2 CORS policy (step 3a) and the Turnstile hostname (step 3b),
   - redeploy: **Deployments** → the **⋯** next to the latest one → **Redeploy**.

Changing an environment variable never takes effect until the next deploy.

---

## Step 6. Create your account right away

**Do this the minute the deploy finishes.** Until the first account exists, whoever opens `/admin` first becomes the administrator.

1. Open `https://your-address/admin`. A form asks you to create the first user. It may appear in English ("Create first user") if your browser is set to English.
2. Enter your email, your name and a strong password: 12 characters or more, combining at least three of: lowercase, capitals, numbers, symbols. The "Rol" box says Colaborador/a; ignore it. The first account always becomes **Administración**.
3. You are in. To use the panel in Spanish: the round icon at the bottom left → **Cuenta** → Idioma → Español.

Then:

- Create your author profile: **Autores → Crear**, and link it to your account in "Cuenta de usuario".
- Read the five fixed pages under **Páginas**. They hold starter text written for you. Rewrite them in your own words, especially Política Editorial and Privacidad, which make promises in La Pizarra's name.
- Upload one photo and publish a test article, then delete it. This is the first time the photo storage, the published page and the delete rule run on the real services.

`GUIA-EDITORIAL.md` explains the day-to-day work from here.

---

## Step 7. Turn on the clock for scheduled articles

Vercel's free plan runs timers only once a day, so GitHub does it every 10 minutes: it calls the site, and the site publishes whatever is due.

1. In your GitHub repository: **Settings → Secrets and variables → Actions**.
2. Tab **Secrets** → **New repository secret**: name `CRON_SECRET`, value the same `CRON_SECRET` you gave Vercel.
3. Tab **Variables** → **New repository variable**: name `SITE_URL`, value your site address with no slash at the end.
4. Test it: **Actions** tab → **Publicación programada** → **Run workflow**. A green check within a minute means the site answered.

Good to know:

- GitHub often starts timed runs 5 to 15 minutes late. An article scheduled for 8:00 may appear at 8:15. For an exact time, an editor publishes by hand.
- If the repository has no activity for 60 days, GitHub pauses timers and emails you. One click on **Enable workflow** in the Actions tab resumes them.
- If a run fails, GitHub emails you. The usual cause is that `CRON_SECRET` differs between GitHub and Vercel.

---

## Step 8. Your own domain (when you are ready)

1. Buy the domain from any registrar. Cloudflare Registrar sells at cost and keeps everything in the account you already have.
2. Vercel: **Settings → Domains → Add** → type the domain. Vercel shows one or two DNS records. Create them where the domain is managed. In Cloudflare DNS, set those records to **DNS only** (grey cloud), not "Proxied".
3. When Vercel shows the domain as valid, update the address in five places:
   - Vercel: `NEXT_PUBLIC_SITE_URL` → `https://your-domain`
   - GitHub: the `SITE_URL` variable (step 7)
   - Cloudflare Turnstile: add the domain to the widget's hostnames
   - Cloudflare R2: put the domain in the CORS policy's `AllowedOrigins`
   - Redeploy in Vercel
4. Give the photos their own address: R2 bucket → Settings → **Custom Domains** → add `media.your-domain` (the domain must use Cloudflare DNS). Then set `R2_PUBLIC_URL` to `https://media.your-domain` in Vercel, redeploy, and disable the `r2.dev` address. Photos already uploaded keep working because the stored address is rebuilt from this setting. The `r2.dev` address is meant for testing and is slowed down under heavy traffic, so do this before the site gets popular.
5. Set up email (step 4), add `EMAIL_FROM_ADDRESS`, `EDITOR_EMAIL` and `RESEND_API_KEY` in Vercel, and redeploy.

---

## Step 9. Visitor statistics without cookies

1. Vercel: your project → **Analytics** → **Enable**.
2. Set `NEXT_PUBLIC_ANALYTICS_ENABLED` to `true` and redeploy.

It counts visits and pages with no cookies and no advertising trackers, and does not identify anyone. The Privacidad page already describes it that way. The free plan has a monthly cap on recorded events; past it, counting pauses but the site is unaffected.

---

## Step 10. Backups

There are two things to protect: the database (everything written) and the photos.

**What happens by itself.** Neon lets you rewind the database to an earlier moment: project → **Backup & Restore**. On the free plan the window is short (about 6 hours), enough to undo an accident you notice the same day, not one you notice next week. R2 keeps photos on redundant storage and nothing deletes them unless someone deletes the image in the admin.

**What you do: a weekly copy to keep.** Once, create a file named `.env.respaldo` in the project folder with a single line, using the Neon **direct** connection (no `-pooler`) from step 2:

```
RESPALDO_DATABASE_URL=postgresql://…
```

That file never leaves the laptop (git ignores it). Then, with Docker Desktop open, run:

```bash
pnpm respaldo
```

It saves `respaldos/lapizarra-DATE.dump`. It only reads; it cannot change the site. The file holds subscriber emails and private messages, so store a copy somewhere safe and private (an encrypted drive, not a shared folder). Run it weekly, and before any big change.

**Restoring a copy.** This replaces what is in a database, so do it into a new, empty Neon branch first, never straight over the live one, and ask Claude Code to walk through it with you. The command, for reference (PowerShell, from the project folder; `$env:PGURL` is the direct connection string of the database to fill):

```
docker run --rm -e PGURL -v "${PWD}/respaldos:/respaldos" postgres:17-alpine sh -c 'pg_restore --dbname="$PGURL" --clean --if-exists --no-owner --no-privileges /respaldos/FILE.dump'
```

Then point Vercel's `DATABASE_URL` at the restored branch and redeploy. This procedure was tested on the laptop's database on 15 November 2026.

**Photos.** For an extra copy, download the bucket now and then from the R2 dashboard, or ask Claude Code to set up an automatic copy to a second bucket.

---

## Updating the site later

- **Content** (articles, pages, menus, portada) changes in the admin and appears on the site within seconds. No deploy.
- **Code** changes go: edit on the laptop → tests → commit → `git push`. GitHub runs the tests and Vercel publishes the new version by itself in about five minutes. If a deploy fails, the previous version stays online.
- **Going back:** Vercel → Deployments → pick an earlier one → **⋯ → Promote to Production** (instant rollback).
- **When the shape of the data changes** (a new field or collection), the change needs a migration file, or the deploy fails rather than touching the database blindly:

```bash
pnpm migrate:create nombre-del-cambio
```

Review the new file in `src/migrations/`, commit it with the code change, and push. The deploy applies it before building. Run `pnpm respaldo` first.

---

## Check after the first deploy

These could not be exercised on the laptop. Tick them off once on the real site.

- [ ] CI is green on GitHub (step 1).
- [ ] Uploading a photo in the admin works and the photo shows on the article (R2 + CORS).
- [ ] Publishing an article makes it appear on the portada within seconds; deleting removes it.
- [ ] The contact form shows the Turnstile check and the message arrives under Mensajes recibidos.
- [ ] "Publicación programada" runs green on GitHub; a test article scheduled 15 minutes ahead goes live.
- [ ] After step 8: a newsletter sign-up sends the confirmation email and the link confirms; "Olvidé mi contraseña" sends an email.
- [ ] Sharing an article link in WhatsApp shows the title and image.
- [ ] Ask Claude Code to run the Lighthouse check against the live home page and one article (the laptop scores were about 95 performance and 100 for accessibility, best practices and SEO).
- [ ] Write an article in the admin with the browser console open (F12): no red "Content Security Policy" lines.
- [ ] `pnpm respaldo` produces a file.

---

## Limits to keep an eye on

| Service | Free limit that matters (confirm on its pricing page)   | What happens at the limit                                                                                             |
| ------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Neon    | Storage around 0.5 GB; the database sleeps when idle    | First visit after a quiet spell takes a second or two longer; past the storage limit, writing stops until you upgrade |
| R2      | About 10 GB of photos                                   | Billed per extra GB (cents)                                                                                           |
| Vercel  | Monthly bandwidth and function time; non-commercial use | The site pauses until the next month, or you upgrade                                                                  |
| GitHub  | Unlimited for public repositories                       | Private: timers and tests stop for the month                                                                          |
| Resend  | About 100 emails a day                                  | Extra emails are not sent that day                                                                                    |

The site stores about 2,400-pixel photos converted to WebP, typically 200–400 KB each with their smaller versions, so 10 GB is a long way off.

---

## If something goes wrong

| What you see                                        | Likely cause and fix                                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Deploy fails during "migrate"                       | `DATABASE_URL` is missing or mistyped in Vercel. Paste it again, redeploy.                             |
| Site loads but `/admin` shows an error              | `PAYLOAD_SECRET` is missing. Add it, redeploy.                                                         |
| Photo upload fails in the admin                     | The CORS policy's address does not match the site address exactly, or an R2 value is wrong.            |
| Photos upload but appear broken                     | `R2_PUBLIC_URL` is wrong or public access is off on the bucket.                                        |
| Forms say the verification failed                   | The site's host name is not in the Turnstile widget's list, or the two Turnstile keys are swapped.     |
| Scheduled article never appears                     | GitHub → Actions → "Publicación programada": is it enabled and green? Does `CRON_SECRET` match Vercel? |
| Saving in the admin says the request is not allowed | `NEXT_PUBLIC_SITE_URL` does not match the address in your browser bar. Fix it, redeploy.               |
| A change in the admin does not show on the site     | Reload after a few seconds. If it persists, redeploy from Vercel, which rebuilds every page.           |
| You are locked out after 5 wrong passwords          | Wait 15 minutes, or another administrator unlocks the account under Usuarios.                          |

For anything else: open the project in Claude Code and describe what you see. Vercel's **Logs** tab and the failed run's page on GitHub hold the exact error text to paste.
