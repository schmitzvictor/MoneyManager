Read this entire document before writing any code. We are going to build this strictly in the phases outlined in section 14. Acknowledge that you understand the architecture, and then execute ONLY Phase 1. Wait for my approval before moving to Phase 2.

Build a production-ready personal finance web application for single-user use.

Primary goal:
Create a fast, clean, privacy-friendly personal finance app that helps me track accounts, transactions, budgets, recurring expenses, savings goals, and daily spending with a very fast entry experience.

Deployment target:
- Vercel

Backend/database:
- Supabase Postgres

Framework and stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Zustand (for global client-side state, specifically Smart Quick Add)
- Recharts
- React Hook Form
- Zod
- date-fns

Important constraints:
- Use React Server Components (RSC) for data fetching and Next.js Server Actions for all database mutations (CRUD). Only use Route Handlers (/api) if absolutely necessary for external webhooks.
- Do NOT use Open Finance
- Do NOT use Plaid or any paid banking API
- Do NOT use Prisma
- Do NOT require any paid AI API
- Keep the app free-friendly to build and deploy
- Use deterministic logic, rules, and heuristics instead of paid LLM features
- Keep the codebase maintainable and modular
- Prefer secure server-side patterns for writes and protected reads

Authentication:
- Use lightweight Supabase Auth so the app is not publicly open
- Start as a single-user app, but keep the schema user-based
- Protect all dashboard routes
- Keep auth simple: login page + protected application area
- Do not over-engineer roles, teams, or organizations

Product scope:
This is a personal finance app for manual tracking and import-based tracking.
The app should support:
- accounts
- transactions
- categories and subcategories
- transfers
- recurring transactions
- monthly budgets
- savings goals
- CSV and OFX import
- rules-based transaction categorization
- a Smart Quick Add experience for extremely fast expense entry

Core product principles:
- fast daily use
- minimal friction for adding expenses
- clean product-style UI
- responsive on desktop and mobile
- light and dark mode
- accessible forms and navigation
- great empty states, loading states, and error states
- clear information hierarchy
- no unnecessary complexity

Main navigation:
- Dashboard
- Transactions
- Budget
- Recurring
- Goals
- Accounts
- Settings

Build the app in clear phases and produce a working result incrementally.

==================================================
1. APPLICATION FEATURES
==================================================
Implement these core features:

A. Dashboard
- total balance card
- monthly income card
- monthly expenses card
- net cash flow card
- expenses by category chart
- monthly cash flow chart
- recent transactions list
- upcoming recurring transactions widget
- budget alerts
- goals progress snapshot

B. Transactions
- transaction list/table
- filters by period, account, category, type, and search text
- add transaction
- edit transaction
- delete transaction
- duplicate transaction
- transfer support
- import CSV/OFX entry point

C. Budget
- monthly selector
- planned vs actual per category
- remaining vs overspent state
- progress bars
- copy previous month budget
- parent/child category rollups

D. Recurring
- recurring income and expense series
- weekly, monthly, yearly frequencies
- next occurrence tracking
- generate planned transactions
- create, edit, archive recurring entries

E. Goals
- savings goals
- target amount
- current amount
- optional target date
- progress percentage
- archive goal

F. Accounts
- checking
- savings
- cash
- credit card
- current balance
- initial balance
- credit limit
- closing day
- due day
- account detail view

G. Settings
- category management
- rules management
- import/export tools
- theme toggle
- session/account settings
- seed/reset demo data if useful in development

==================================================
2. SMART QUICK ADD
==================================================
Add a major feature area called Smart Quick Add.

Goal:
Make adding expenses extremely fast, with assistant-like behavior but without paid AI APIs.
**Use Zustand** to manage the global state of the Quick Add modal to ensure it is highly performant and accessible from anywhere without prop-drilling or Context re-renders.

Smart Quick Add must include:

1. Quick Add modal or bottom sheet
- globally accessible from a floating action button and keyboard shortcut
- opens instantly from anywhere in the app
- autofocuses the primary input
- state managed via Zustand

2. Rules-based category suggestions
- use stored rules first
- then fall back to merchant history
- then fall back to recent category usage
- suggest category automatically when confidence is reasonable

3. Recent merchants and recent amounts
- show recent merchants as quick-pick chips or list
- show typical/recent amounts for repeated spends
- support merchant memory

4. One-line text parser
- parse short text into transaction fields using deterministic heuristics
- no external AI services

5. Fast-entry modes
- Minimal text mode:
  - examples: "starbucks 18", "uber 24.50", "groceries 89"
- Natural style mode:
  - examples: "spent 42 on groceries", "paid 65 for internet", "lunch at restaurant 78"
- Repeat last mode:
  - tap a previous spend and save with today’s date
- Merchant-first mode:
  - choose from recent merchants, then edit amount only

Smart Quick Add behavior:
- default date = today
- default account = last-used account
- amount-first or smart-text entry should both be supported
- save common expenses in 1 to 2 taps
- after saving, optionally offer:
  - create rule from this merchant
  - add another transaction
  - mark as recurring

Structured mode fields:
- amount
- description/merchant
- category
- account
- date
- optional "more options" area for notes and recurring toggle

==================================================
3. PARSER AND SUGGESTION ENGINE
==================================================
Implement a deterministic parser module for one-line transaction entry.

Requirements:
- detect amount from the last valid numeric token when appropriate
- support BRL-style and common decimal formats
- accept:
  - 18
  - 18,50
  - 18.50
  - R$18
  - R$ 18,50
- remove helper verbs such as:
  - spent
  - paid
  - bought
- detect separators such as:
  - on
  - for
  - at
- use remaining text as merchant/description
- if a known category keyword exists, use it as a suggestion
- if uncertain, keep original text and ask only for missing fields

Implement a suggestion engine with this order:
1. explicit rules
2. normalized merchant match from history
3. recent transaction pattern match
4. recent category defaults
5. fallback manual selection

==================================================
4. DATABASE DESIGN
==================================================
Use Supabase Postgres directly with SQL migrations.

Create the following tables:
- users
- accounts
- categories
- transactions
- recurring_series
- budget_months
- budget_items
- goals
- rules
- imports
- merchant_profiles

Requirements:
- implement strict Row Level Security (RLS) policies for all tables ensuring users can only SELECT, INSERT, UPDATE, and DELETE their own data based on user_id. RLS must be included in the initial SQL migrations.
- do not manually write the Supabase database types. Generate the database.ts types using the Supabase CLI (`supabase gen types typescript`) based on the migrations, and only write manual types for frontend-specific domain logic.
- use UUID primary keys
- add foreign keys, indexes, timestamps, and constraints
- use user_id across all user-owned data
- design for a single-user app but keep schema multi-user capable
- include created_at and updated_at where appropriate

Domain requirements:
accounts
- types: checking, savings, cash, credit_card

categories
- hierarchical via parent_id
- kinds: income, expense, transfer

transactions
- types: income, expense, transfer
- status: posted, pending, planned
- source: manual, csv, ofx, recurring
- support transfer_account_id
- support merchant_name and normalized_merchant_name
- support external_hash for deduplication
- support recurring_series_id

recurring_series
- frequencies: weekly, monthly, yearly
- stores next_occurrence and auto_create

budget_months
- month format YYYY-MM

rules
- operators: contains, equals, starts_with
- field defaults to description
- priority-based execution

merchant_profiles
- normalized_name
- display_name
- default_category_id
- default_account_id
- last_amount
- usage_count
- last_used_at
- unique index on (user_id, normalized_name)

Also:
- include helpful indexes for transaction queries
- include a seed SQL file with realistic demo data

==================================================
5. SEED DATA
==================================================
Create development seed data including:
- one test user
- realistic Brazilian-style categories
- sample checking, savings, cash, and credit card accounts
- at least 10 sample transactions
- at least 3 recurring series
- at least 3 goals
- sample monthly budget data
- sample categorization rules
- sample merchant_profiles such as:
  - Uber
  - iFood
  - Netflix
  - Starbucks
  - Grocery store

Suggested category groups:
- Income: Salary, Freelance, Refunds, Interest
- Housing: Rent, Utilities, Internet
- Food: Groceries, Restaurants, Coffee
- Transport: Uber, Fuel, Public Transport
- Health: Pharmacy, Doctor, Insurance
- Lifestyle: Shopping, Entertainment, Travel
- Financial: Fees, Credit Card Payment, Transfers
- Savings: Emergency Fund, Investments

==================================================
6. AUTHENTICATION
==================================================
Implement lightweight Supabase Auth.

Requirements:
- login page
- protected app area
- middleware or equivalent route protection
- server-side session-aware utilities
- simple UX
- no advanced permissions model
- structure code so auth can evolve later if needed

==================================================
7. IMPORT SYSTEM
==================================================
Implement CSV and OFX import.

Requirements:
- upload CSV and OFX files
- parse and normalize imported rows
- use a proven, lightweight open-source library for OFX parsing (e.g., node-ofx-parser) rather than writing an OFX XML parser from scratch. You may write the CSV parser manually or use papaparse.
- support common CSV columns such as:
  - date
  - description
  - amount
  - debit
  - credit
  - type
- normalize values and dates for BRL-oriented usage
- preview rows before saving
- detect duplicates using a normalized hash of:
  - account
  - date
  - amount
  - normalized description
- apply categorization suggestions before final confirmation
- allow user to confirm, reject, or edit rows before insert
- store import metadata

Create:
- CSV parser utility
- OFX parser utility
- normalization utilities
- duplicate detection utility
- import preview UI
- import confirmation flow
- basic tests for parser/normalization logic

==================================================
8. RULE ENGINE
==================================================
Implement a rule-based categorization engine.

Requirements:
- operators:
  - contains
  - equals
  - starts_with
- priority-based execution
- active/inactive toggle
- create/edit/delete/reorder rules
- apply to imported and manually entered transactions
- after manual recategorization, offer to create a new rule from the transaction
- isolate rule engine logic in a dedicated, testable module

==================================================
9. BUDGET AND CALCULATIONS
==================================================
Implement monthly budgeting.

Requirements:
- user sets planned amount per category for a given month
- system calculates actual spent amount from transactions
- show planned, actual, remaining, and overspent
- classify status:
  - safe
  - near limit
  - over limit
- support copy previous month
- support category rollups

Implement utility modules for:
- cash flow summaries
- monthly totals
- category totals
- budget utilization
- account balance calculations
- recurring forecast summaries

==================================================
10. UI / UX REQUIREMENTS
==================================================
Design requirements:
- modern, calm, product-style interface
- desktop-first but fully responsive
- strong mobile usability
- light and dark mode
- consistent spacing and typography
- accessible color contrast
- clear hierarchy
- intuitive empty states
- polished loading and error states

Specific UX expectations:
- Quick Add should be the fastest path in the app
- common actions should be reachable within one tap/click
- recent merchants should reduce repeated typing
- forms should feel lightweight, not heavy
- transaction editing should be smooth and fast
- dashboard should answer “What happened, what is next, and where am I overspending?”

Use reusable components for:
- charts
- cards
- filter bars
- form sheets/modals
- transaction rows
- merchant chips
- budget progress rows
- recurring widgets
- goal cards

==================================================
11. FOLDER STRUCTURE
==================================================
Use a clean structure similar to this:

/app
  /(auth)
    /login
      page.tsx
  /(dashboard)
    /dashboard
      page.tsx
    /transactions
      page.tsx
    /budget
      page.tsx
    /recurring
      page.tsx
    /goals
      page.tsx
    /accounts
      page.tsx
    /settings
      page.tsx
  /api
    /webhooks
      route.ts
  /layout.tsx
  /page.tsx

/components
  /ui
  /layout
  /dashboard
  /transactions
  /budget
  /recurring
  /goals
  /accounts
  /settings
  /quick-add
  /charts
  /forms

/lib
  /actions
    transactions.ts
    accounts.ts
    budget.ts
  /supabase
    client.ts
    server.ts
    middleware.ts
  /db
    queries.ts
  /import
    csv.ts
    ofx.ts
    normalize.ts
    dedupe.ts
  /rules
    engine.ts
  /quick-add
    parser.ts
    suggestions.ts
    merchants.ts
  /budget
    calculations.ts
  /recurring
    generator.ts
  /utils
    currency.ts
    dates.ts
    hashes.ts

/store
  quick-add-store.ts

/supabase
  /migrations
  /seed.sql

/types
  database.ts
  finance.ts

==================================================
12. ENVIRONMENT VARIABLES
==================================================
Document and use these environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL

Rules:
- do not expose service role key to client code
- use public keys only where appropriate
- document setup for local development and Vercel deployment

==================================================
13. DEPLOYMENT
==================================================
Prepare the app for Vercel deployment.

Requirements:
- compatible with Next.js App Router deployment
- no filesystem-based local persistence
- all data stored in Supabase
- include deployment instructions:
  - create Supabase project
  - run SQL migrations
  - generate TypeScript types using Supabase CLI
  - seed data
  - configure Vercel environment variables
  - connect GitHub repo to Vercel
  - deploy

==================================================
14. IMPLEMENTATION ORDER
==================================================
Build in this order:
1. project scaffold
2. Supabase setup, auth, RLS, and type generation
3. SQL schema and seeds
4. app layout and navigation shell
5. accounts, categories, and transactions CRUD (using Server Actions)
6. dashboard summaries and charts
7. CSV/OFX import
8. rule engine
9. recurring transactions
10. budgets
11. goals
12. Smart Quick Add (Zustand integration)
13. mobile polish
14. deployment readiness

At the end of each phase:
- explain what was implemented
- list changed files
- provide any setup steps needed
- keep the app runnable
- ask for user approval before proceeding to the next phase

==================================================
15. DELIVERABLES
==================================================
Deliver:
1. working folder structure
2. Supabase SQL migrations with RLS policies
3. seed SQL
4. auth flow
5. protected routes
6. main screens
7. reusable UI components
8. import pipeline
9. rule engine
10. budget logic
11. recurring logic
12. Smart Quick Add with global Zustand state
13. deployment instructions
14. brief README with setup and run steps

When making implementation choices:
- prefer simplicity
- prefer maintainability
- prefer practical UX over flashy features
- avoid overengineering
- optimize for daily personal use