# TrustPoint Realty: website + Partners Portal

The hand-coded replacement for the WordPress site at [trustpointrealty.ng](https://trustpointrealty.ng):
the public website and the realtor (affiliate) portal, which replaces Ultimate Affiliate Pro.

## The website

Same pages and addresses as the WordPress site: `/`, `/projects`, `/services`, `/about`, `/careers`,
`/contact-us`, and the estate pages `/coconutview`, `/avocado-crest`, `/palm-oasis`, `/maple-nexus`.
"Realtors" in the menu leads to the portal below.

- **All copy, contact details, estates, FAQs and jobs live in `src/content/site.ts`.** Edit there; to add
  an estate page, add an entry to `estates`.
- **Request a Quote** submissions are saved to the database and appear in **Admin → Enquiries**. Set
  `ENQUIRY_NOTIFY_EMAIL` (with `RESEND_API_KEY`) to also get an email for each one.
- **Images and PDFs are still served from the WordPress server.** Before switching WordPress off, run
  `npm run fetch-wp-assets` on a machine that can reach the old site. It copies every file into
  `public/wp-content/uploads/`. Then set `NEXT_PUBLIC_ASSET_BASE=""` and commit `public/`.
- Marketing pages are pre-rendered static HTML; the portal and admin pages are dynamic.

### Switching the domain over

1. Run `npm run fetch-wp-assets`, set `NEXT_PUBLIC_ASSET_BASE=""`, commit.
2. Import realtors from WordPress (see "Coming from WordPress" below).
3. Point `trustpointrealty.ng` at the Cloudflare Worker and set `APP_URL=https://trustpointrealty.ng`.

## The partners portal

Realtors register clients and track sales, commissions and payouts. The office records sales and client
payments, approves commission and logs payouts. Realtors register clients and track sales, commissions and
payouts. The office records sales and client payments, approves commission and logs payouts.

**No money moves through the portal.** Payouts are made by bank transfer as before and only *logged* here.

## How the money works

1. Each **estate** has a realtor commission % and an optional upline (team) bonus %.
2. A realtor **registers a client** by phone number. The number is normalised (`0803…` = `+234803…`)
   and is unique, so a client can't be claimed twice.
3. Admin **records a sale** for the client. The realtor, their upline and the rates are *copied onto
   the sale*, so later rate or team changes don't rewrite history. Admin can override rates per sale.
4. Each **client payment** logged (deposit or instalment) creates **pending** commission:
   `payment × rate` for the realtor, `payment × upline rate` for their upline.
5. Admin **approves** commission once the payment has cleared. Approved commission goes into the balance.
6. Admin makes the bank transfer, then **logs the payout** with its reference. A payout can't exceed the
   available balance.
7. Mistakes are reversed, never deleted: a reversed client payment voids its pending commission, or
   adds a negative "clawback" if it was already approved. Payouts can be voided with a reason.
   Every change is in the **Activity log**.

`available balance = approved commission (incl. adjustments, clawbacks) − payouts`

Money is stored as integer kobo; rates as basis points (10% = 1000).

## Stack

- Next.js 16 (App Router, server actions), Tailwind CSS 4
- Postgres via Drizzle ORM (`postgres.js` driver). Neon in production
- Deploys to Cloudflare Workers with `@opennextjs/cloudflare`. Also runs on any Node host.

## Local development

```bash
cp .env.example .env.local      # point DATABASE_URL at a local Postgres
npm install
npm run db:migrate              # create tables
npm run seed:demo               # optional demo data (refuses to run against Neon)
npm run dev
```

Demo logins (password `Password1!`): `admin@demo.ng`, `ada@demo.ng`, `tunde@demo.ng` (Tunde's upline is Ada).

Other scripts: `npm test` (unit tests), `npm run typecheck`, `npm run lint`,
`npm run db:generate` (after editing `src/db/schema.ts`), `npm run cf:preview` (run in the Workers runtime locally;
put `DATABASE_URL` in `.dev.vars`).

## Deploying (Cloudflare Workers + Neon)

1. Create a Neon project and copy its connection string.
2. Run the migrations against it from your machine:
   ```bash
   DATABASE_URL="postgres://…neon.tech/…?sslmode=require" npm run db:migrate
   ```
3. Create the first admin:
   ```bash
   DATABASE_URL="…" npm run create-admin -- you@trustpointrealty.ng First Last 0803…
   ```
4. Set the Worker's secrets and deploy:
   ```bash
   npx wrangler login
   npx wrangler secret put DATABASE_URL
   npx wrangler secret put RESEND_API_KEY   # optional, for password-reset emails
   npm run cf:deploy
   ```
5. Point the domain at the Worker and set `APP_URL` in `wrangler.jsonc` to match (see "Switching the
   domain over" above). Optionally `npx wrangler secret put ENQUIRY_NOTIFY_EMAIL`.

Optional: create a [Hyperdrive](https://developers.cloudflare.com/hyperdrive/) config for the Neon database
and bind it as `HYPERDRIVE`. The app uses it automatically for faster connections.

**Plan note:** logins check bcrypt passwords, which can take more than the 10 ms of CPU per request that the
Workers *Free* plan allows. If logins fail with CPU-limit errors, move to Workers Paid ($5/month).

## Coming from WordPress

The schema is ready for the import: `users.legacy_wp_user_id`, and the login accepts WordPress password
hashes (`$wp$…` from WP 6.8+, `$P$…` phpass, bcrypt, and old md5). Imported realtors keep their existing
passwords and are moved to bcrypt on first login. Existing balances from Ultimate Affiliate Pro can be
brought over as **adjustments** ("Opening balance from old portal").

The import script itself needs a database export from the live site (`wp_users`, `wp_usermeta` and the
`wp_uap_*` tables) to map fields precisely.

## Project layout

```
src/db/schema.ts          tables (users, estates, clients, sales, sale_payments, commissions, payouts, audit_log, enquiries)
src/lib/ledger.ts         balances, commission creation and reversal
src/lib/auth/             sessions, password hashing (incl. WordPress formats), guards
src/content/site.ts       all website copy, images, estates, FAQs, jobs
src/app/(site)/           the public website pages + "Request a Quote" action
src/components/site/      website header, footer, sections, quote form
src/app/(public)/         /realtors, /become-a-realtor, /realtor-login, password reset
src/app/r/[code]          referral link (/r/TPXXXXX) → registration with code prefilled
src/app/portal/           realtor portal
src/app/admin/            admin panel (every page and action calls requireAdmin)
scripts/                  create-admin, seed-demo, fetch-wp-assets
```
