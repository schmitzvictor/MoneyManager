# Money Manager

A fast, clean, privacy-friendly personal finance app for tracking accounts, transactions, budgets, recurring expenses, savings goals, and daily spending.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Supabase (Postgres)
- **State Management**: Zustand (for Smart Quick Add)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Dates**: date-fns
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A [Supabase](https://supabase.com/) project (free tier works)
- npm

### 1. Clone and install

```bash
git clone <your-repo-url>
cd MoneyManager
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (server-only) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

### 3. Run database migrations

```bash
# Using Supabase CLI
supabase db push
```

### 4. Generate database types

```bash
npx supabase gen types typescript --local > src/types/database.ts
```

### 5. Seed development data (optional)

```bash
# Run seed.sql against your Supabase database
supabase db seed
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth route group (login)
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API routes (webhooks only)
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── layout/           # App shell, sidebar, nav
│   ├── dashboard/        # Dashboard widgets
│   ├── transactions/     # Transaction components
│   ├── budget/           # Budget components
│   ├── recurring/        # Recurring transaction components
│   ├── goals/            # Savings goal components
│   ├── accounts/         # Account components
│   ├── settings/         # Settings components
│   ├── quick-add/        # Smart Quick Add components
│   ├── charts/           # Chart components
│   └── forms/            # Reusable form components
├── lib/                   # Core logic and utilities
│   ├── actions/          # Next.js Server Actions
│   ├── supabase/         # Supabase client utilities
│   ├── db/               # Database query helpers
│   ├── import/           # CSV/OFX import pipeline
│   ├── rules/            # Rule engine
│   ├── quick-add/        # Parser and suggestion engine
│   ├── budget/           # Budget calculations
│   ├── recurring/        # Recurring transaction generator
│   └── utils/            # Shared utilities (currency, dates, hashes)
├── store/                 # Zustand stores
└── types/                 # TypeScript type definitions
supabase/
├── migrations/            # SQL schema migrations
└── seed.sql              # Development seed data
```

## Deployment (Vercel)

1. Create a Supabase project and run SQL migrations
2. Connect your GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## License

Private — personal use only.
