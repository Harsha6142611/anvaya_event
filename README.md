# Anvaya Finance Tracker

Minimal premium tracker for the **Anvaya** event: sponsors, expenditures, and a live balance (`sponsors − expenditures`). Add and delete require a PIN; each entry stores who added it.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind
- **Turso** (libSQL / SQLite) — free tier, zero ops
- **Vercel** — fastest deploy for this stack

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Turso credentials, the app uses a local SQLite file (`file:local.db`). Default PIN is `1234` (override with `ANVAYA_PIN`).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TURSO_DATABASE_URL` | Prod: yes | Turso DB URL, or `file:local.db` locally |
| `TURSO_AUTH_TOKEN` | Prod: yes | Turso auth token (omit for local file DB) |
| `ANVAYA_PIN` | Recommended | PIN for add/delete (defaults to `1234` if unset) |

## Turso setup (production)

1. Install CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
2. Sign in: `turso auth login`
3. Create DB: `turso db create anvaya`
4. Get URL: `turso db show anvaya --url`
5. Create token: `turso db tokens create anvaya`

Paste URL and token into Vercel env (or `.env.local`).

## Deploy on Vercel (recommended)

Fastest path for Next.js:

1. Push this repo to GitHub
2. [Import the project on Vercel](https://vercel.com/new)
3. Add env vars: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ANVAYA_PIN`
4. Deploy

Or from the CLI:

```bash
npx vercel
```

Then set production env vars in the Vercel dashboard and redeploy.

## Usage

- **Balance** at the top updates automatically
- **Sponsors** / **Expenditures** columns list reason, amount, and who added
- **Add entry** (right): name, reason, amount (digits only), type, PIN
- **Delete**: hover a row → Delete → enter PIN → Confirm

## API

- `GET /api/entries` — list entries
- `POST /api/entries` — `{ name, reason, amount, type, pin }`
- `DELETE /api/entries/[id]` — `{ pin }`
# anvaya_event
