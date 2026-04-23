-- ============================================================
-- Money Manager — Initial Schema Migration
-- ============================================================
-- Run this against your Supabase project:
--   supabase db push
-- Or paste it into the Supabase SQL Editor.
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. USERS (profile mirror of auth.users)
-- ============================================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  default_currency text not null default 'BRL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 2. ACCOUNTS
-- ============================================================
create type public.account_type as enum ('checking', 'savings', 'cash', 'credit_card');

create table public.accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  type public.account_type not null,
  initial_balance numeric(14,2) not null default 0,
  current_balance numeric(14,2) not null default 0,
  credit_limit numeric(14,2),
  closing_day smallint check (closing_day between 1 and 31),
  due_day smallint check (due_day between 1 and 31),
  color text,
  icon text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_accounts_user on public.accounts(user_id);

-- ============================================================
-- 3. CATEGORIES
-- ============================================================
create type public.category_kind as enum ('income', 'expense', 'transfer');

create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  kind public.category_kind not null,
  parent_id uuid references public.categories(id) on delete set null,
  icon text,
  color text,
  sort_order smallint not null default 0,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_categories_user on public.categories(user_id);
create index idx_categories_parent on public.categories(parent_id);
create index idx_categories_kind on public.categories(user_id, kind);

-- ============================================================
-- 4. TRANSACTIONS
-- ============================================================
create type public.transaction_type as enum ('income', 'expense', 'transfer');
create type public.transaction_status as enum ('posted', 'pending', 'planned');
create type public.transaction_source as enum ('manual', 'csv', 'ofx', 'recurring');

create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type public.transaction_type not null,
  status public.transaction_status not null default 'posted',
  source public.transaction_source not null default 'manual',
  amount numeric(14,2) not null,
  description text not null default '',
  merchant_name text,
  normalized_merchant_name text,
  notes text,
  date date not null default current_date,
  transfer_account_id uuid references public.accounts(id) on delete set null,
  recurring_series_id uuid,
  import_id uuid,
  external_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_transactions_user on public.transactions(user_id);
create index idx_transactions_account on public.transactions(account_id);
create index idx_transactions_category on public.transactions(category_id);
create index idx_transactions_date on public.transactions(user_id, date desc);
create index idx_transactions_type on public.transactions(user_id, type);
create index idx_transactions_merchant on public.transactions(user_id, normalized_merchant_name);
create index idx_transactions_external_hash on public.transactions(user_id, external_hash);
create index idx_transactions_recurring on public.transactions(recurring_series_id);
create index idx_transactions_import on public.transactions(import_id);

-- ============================================================
-- 5. RECURRING SERIES
-- ============================================================
create type public.recurring_frequency as enum ('weekly', 'monthly', 'yearly');

create table public.recurring_series (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type public.transaction_type not null,
  amount numeric(14,2) not null,
  description text not null default '',
  merchant_name text,
  frequency public.recurring_frequency not null,
  start_date date not null,
  end_date date,
  next_occurrence date not null,
  auto_create boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_recurring_user on public.recurring_series(user_id);
create index idx_recurring_next on public.recurring_series(user_id, next_occurrence);

-- Add FK from transactions to recurring_series now that both tables exist
alter table public.transactions
  add constraint fk_transactions_recurring
  foreign key (recurring_series_id)
  references public.recurring_series(id)
  on delete set null;

-- ============================================================
-- 6. BUDGET MONTHS
-- ============================================================
create table public.budget_months (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  month text not null, -- YYYY-MM format
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month)
);

create index idx_budget_months_user on public.budget_months(user_id, month);

-- ============================================================
-- 7. BUDGET ITEMS
-- ============================================================
create table public.budget_items (
  id uuid primary key default uuid_generate_v4(),
  budget_month_id uuid not null references public.budget_months(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  planned_amount numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (budget_month_id, category_id)
);

create index idx_budget_items_month on public.budget_items(budget_month_id);

-- ============================================================
-- 8. GOALS
-- ============================================================
create table public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  target_amount numeric(14,2) not null,
  current_amount numeric(14,2) not null default 0,
  target_date date,
  icon text,
  color text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_goals_user on public.goals(user_id);

-- ============================================================
-- 9. RULES
-- ============================================================
create type public.rule_operator as enum ('contains', 'equals', 'starts_with');

create table public.rules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  field text not null default 'description',
  operator public.rule_operator not null default 'contains',
  value text not null,
  category_id uuid references public.categories(id) on delete cascade,
  priority smallint not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_rules_user on public.rules(user_id, priority);

-- ============================================================
-- 10. IMPORTS
-- ============================================================
create table public.imports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  filename text not null,
  format text not null, -- 'csv' or 'ofx'
  total_rows integer not null default 0,
  imported_rows integer not null default 0,
  duplicate_rows integer not null default 0,
  skipped_rows integer not null default 0,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

create index idx_imports_user on public.imports(user_id);

-- Add FK from transactions to imports now that the table exists
alter table public.transactions
  add constraint fk_transactions_import
  foreign key (import_id)
  references public.imports(id)
  on delete set null;

-- ============================================================
-- 11. MERCHANT PROFILES
-- ============================================================
create table public.merchant_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  normalized_name text not null,
  display_name text not null,
  default_category_id uuid references public.categories(id) on delete set null,
  default_account_id uuid references public.accounts(id) on delete set null,
  last_amount numeric(14,2),
  usage_count integer not null default 0,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_merchant_profiles_unique on public.merchant_profiles(user_id, normalized_name);
create index idx_merchant_profiles_user on public.merchant_profiles(user_id);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables with updated_at
create trigger set_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.accounts
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.categories
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.transactions
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.recurring_series
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.budget_months
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.budget_items
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.goals
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.rules
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.merchant_profiles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- TRIGGER: auto-create user profile on auth signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Users
alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Accounts
alter table public.accounts enable row level security;

create policy "Users can view their own accounts"
  on public.accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own accounts"
  on public.accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own accounts"
  on public.accounts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own accounts"
  on public.accounts for delete
  using (auth.uid() = user_id);

-- Categories
alter table public.categories enable row level security;

create policy "Users can view their own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Transactions
alter table public.transactions enable row level security;

create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Recurring Series
alter table public.recurring_series enable row level security;

create policy "Users can view their own recurring series"
  on public.recurring_series for select
  using (auth.uid() = user_id);

create policy "Users can insert their own recurring series"
  on public.recurring_series for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recurring series"
  on public.recurring_series for update
  using (auth.uid() = user_id);

create policy "Users can delete their own recurring series"
  on public.recurring_series for delete
  using (auth.uid() = user_id);

-- Budget Months
alter table public.budget_months enable row level security;

create policy "Users can view their own budget months"
  on public.budget_months for select
  using (auth.uid() = user_id);

create policy "Users can insert their own budget months"
  on public.budget_months for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own budget months"
  on public.budget_months for update
  using (auth.uid() = user_id);

create policy "Users can delete their own budget months"
  on public.budget_months for delete
  using (auth.uid() = user_id);

-- Budget Items (access through budget_months ownership)
alter table public.budget_items enable row level security;

create policy "Users can view their own budget items"
  on public.budget_items for select
  using (
    exists (
      select 1 from public.budget_months bm
      where bm.id = budget_month_id and bm.user_id = auth.uid()
    )
  );

create policy "Users can insert their own budget items"
  on public.budget_items for insert
  with check (
    exists (
      select 1 from public.budget_months bm
      where bm.id = budget_month_id and bm.user_id = auth.uid()
    )
  );

create policy "Users can update their own budget items"
  on public.budget_items for update
  using (
    exists (
      select 1 from public.budget_months bm
      where bm.id = budget_month_id and bm.user_id = auth.uid()
    )
  );

create policy "Users can delete their own budget items"
  on public.budget_items for delete
  using (
    exists (
      select 1 from public.budget_months bm
      where bm.id = budget_month_id and bm.user_id = auth.uid()
    )
  );

-- Goals
alter table public.goals enable row level security;

create policy "Users can view their own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- Rules
alter table public.rules enable row level security;

create policy "Users can view their own rules"
  on public.rules for select
  using (auth.uid() = user_id);

create policy "Users can insert their own rules"
  on public.rules for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own rules"
  on public.rules for update
  using (auth.uid() = user_id);

create policy "Users can delete their own rules"
  on public.rules for delete
  using (auth.uid() = user_id);

-- Imports
alter table public.imports enable row level security;

create policy "Users can view their own imports"
  on public.imports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own imports"
  on public.imports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own imports"
  on public.imports for delete
  using (auth.uid() = user_id);

-- Merchant Profiles
alter table public.merchant_profiles enable row level security;

create policy "Users can view their own merchant profiles"
  on public.merchant_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own merchant profiles"
  on public.merchant_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own merchant profiles"
  on public.merchant_profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete their own merchant profiles"
  on public.merchant_profiles for delete
  using (auth.uid() = user_id);
