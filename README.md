# MoneyManager

A production-ready personal finance web application for single-user use. Track accounts, transactions, budgets, recurring expenses, and savings goals — with a fast, frictionless daily experience.

> **Stack:** Next.js 16 · Supabase · TypeScript · Tailwind CSS · shadcn/ui · Zustand · Recharts

---

## Features

- 📊 **Dashboard** — Balance cards, expense charts, upcoming recurring, budget alerts, goal snapshots
- 💳 **Accounts** — Checking, savings, cash, and credit card accounts with detail pages
- 📝 **Transactions** — Full CRUD with filters, search, duplicate, and rule-based auto-categorization
- ⚡ **Smart Quick Add** — One-line natural-language entry ("starbucks 18", "R$ 45 ifood")
- 🔁 **Recurring** — Schedule daily/weekly/biweekly/monthly/yearly transactions
- 📅 **Budget** — Monthly budgets per category with utilization tracking
- 🎯 **Goals** — Savings goals with progress tracking
- 📥 **Import** — CSV and OFX file import with deduplication
- 🤖 **Rule Engine** — Auto-categorize transactions by description pattern
- 🌙 **Dark Mode** — System-aware light/dark theme

---

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) account (free tier is enough)
- A [Vercel](https://vercel.com) account (for deployment)

---

## Local Development Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/money-manager.git
cd money-manager
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Note your **Project URL** and **API keys** (anon/public and service_role)

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

`.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Used only in server-side actions — never expose to client
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Public URL of your deployment
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Set to 'true' ONLY during initial account creation, then remove
# ALLOW_SIGNUP=true
```

> **Security note:** `ALLOW_SIGNUP` controls whether new users can register.
> Leave it unset (or set to `false`) after creating your account to lock registration.

### 4. Run SQL migrations

In the Supabase dashboard → **SQL Editor**, run:

```sql
-- Paste the contents of:
supabase/migrations/00001_initial_schema.sql
supabase/migrations/00002_atomic_rpc.sql
```

Or using the Supabase CLI:

```bash
npx supabase db push
```

### 5. (Optional) Load demo data

In the Supabase SQL Editor, run `supabase/seed.sql` to populate Brazilian demo data.

### 6. Create your user account

1. Temporarily add `ALLOW_SIGNUP=true` to `.env.local`
2. Start the dev server: `npm run dev`
3. Visit [http://localhost:3000/login](http://localhost:3000/login)
4. Click **Sign up**, create your account
5. Remove `ALLOW_SIGNUP=true` from `.env.local` to lock registration

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/dashboard`.

---

## Generating TypeScript types

After running migrations, regenerate the Supabase types:

```bash
npx supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

Or using the local Supabase CLI:

```bash
npx supabase gen types typescript --local > src/types/database.ts
```

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Set the following **Environment Variables** in Vercel:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |

> Do **not** set `ALLOW_SIGNUP` in Vercel production — leave it unset to keep registration closed.

### 3. Configure Supabase Auth

In the Supabase dashboard → **Auth → URL Configuration**:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** `https://your-app.vercel.app/auth/callback`

### 4. Deploy

Click **Deploy** in Vercel. The app will be live at your Vercel URL.

---

## Supabase Auth Rate Limiting

To protect against brute-force login attempts:

1. Supabase dashboard → **Auth → Rate Limits**
2. Enable rate limiting for sign-in attempts (recommended: 5 requests per 5 minutes)
3. Optionally enable hCaptcha/Turnstile: **Auth → Attack Protection**

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   └── (dashboard)/           # Protected dashboard routes
│       ├── dashboard/
│       ├── transactions/
│       ├── accounts/[id]/     # Account detail page
│       ├── budget/
│       ├── recurring/
│       ├── goals/
│       ├── settings/
│       └── import/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── layout/                # Sidebar, header, Quick Add
│   ├── accounts/
│   ├── transactions/
│   ├── budget/
│   ├── goals/
│   └── recurring/
├── lib/
│   ├── actions/               # Next.js Server Actions (CRUD)
│   ├── supabase/              # Supabase client setup
│   ├── db/queries.ts          # Read queries
│   ├── import/                # CSV/OFX pipeline
│   ├── rules/engine.ts        # Rule engine
│   ├── quick-add/             # Parser + suggestions
│   ├── budget/calculations.ts # Budget math
│   ├── recurring/generator.ts # Occurrence generator
│   └── utils/                 # currency, dates, hashes
├── store/
│   └── quick-add-store.ts     # Zustand (Quick Add state)
└── types/
    ├── database.ts            # Supabase-generated types
    └── finance.ts             # Domain types
supabase/
├── migrations/
│   ├── 00001_initial_schema.sql
│   └── 00002_atomic_rpc.sql
└── seed.sql
```

---

## Security Notes

- All write operations include both application-level `user_id` checks and database RLS policies (defense-in-depth)
- Account balance updates are atomic (Postgres RPC, no SELECT+UPDATE race condition)
- Import hashes use SHA-256 (not plaintext)
- HTTP security headers: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy
- Signup is closed by default (`ALLOW_SIGNUP` env guard)
- Error messages never expose internal Supabase/database details

---

## License

MIT
