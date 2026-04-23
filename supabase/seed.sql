-- ============================================================
-- Money Manager — Seed Data
-- ============================================================
-- Run AFTER the migration and AFTER creating a user via the app.
-- Replace 'YOUR_USER_ID' with your actual auth.users UUID.
--
-- To find your user ID:
--   SELECT id FROM auth.users LIMIT 1;
--
-- Then run:
--   Find & Replace 'YOUR_USER_ID' -> your actual UUID
-- ============================================================

-- NOTE: This seed uses a placeholder. You MUST replace it.
-- Example: do $$ declare uid uuid := 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'; ...

do $$
declare
  uid uuid;

  -- Account IDs
  acc_checking uuid := uuid_generate_v4();
  acc_savings uuid := uuid_generate_v4();
  acc_cash uuid := uuid_generate_v4();
  acc_credit uuid := uuid_generate_v4();

  -- Parent category IDs
  cat_income uuid := uuid_generate_v4();
  cat_housing uuid := uuid_generate_v4();
  cat_food uuid := uuid_generate_v4();
  cat_transport uuid := uuid_generate_v4();
  cat_health uuid := uuid_generate_v4();
  cat_lifestyle uuid := uuid_generate_v4();
  cat_financial uuid := uuid_generate_v4();
  cat_savings uuid := uuid_generate_v4();

  -- Subcategory IDs (we'll need some for transactions)
  sub_salary uuid := uuid_generate_v4();
  sub_freelance uuid := uuid_generate_v4();
  sub_refunds uuid := uuid_generate_v4();
  sub_interest uuid := uuid_generate_v4();
  sub_rent uuid := uuid_generate_v4();
  sub_utilities uuid := uuid_generate_v4();
  sub_internet uuid := uuid_generate_v4();
  sub_groceries uuid := uuid_generate_v4();
  sub_restaurants uuid := uuid_generate_v4();
  sub_coffee uuid := uuid_generate_v4();
  sub_uber uuid := uuid_generate_v4();
  sub_fuel uuid := uuid_generate_v4();
  sub_public_transport uuid := uuid_generate_v4();
  sub_pharmacy uuid := uuid_generate_v4();
  sub_doctor uuid := uuid_generate_v4();
  sub_insurance uuid := uuid_generate_v4();
  sub_shopping uuid := uuid_generate_v4();
  sub_entertainment uuid := uuid_generate_v4();
  sub_travel uuid := uuid_generate_v4();
  sub_fees uuid := uuid_generate_v4();
  sub_cc_payment uuid := uuid_generate_v4();
  sub_transfers uuid := uuid_generate_v4();
  sub_emergency uuid := uuid_generate_v4();
  sub_investments uuid := uuid_generate_v4();

  -- Recurring IDs
  rec_salary uuid := uuid_generate_v4();
  rec_rent uuid := uuid_generate_v4();
  rec_internet uuid := uuid_generate_v4();
  rec_netflix uuid := uuid_generate_v4();

  -- Budget month ID
  bm_current uuid := uuid_generate_v4();

begin
  -- Get the first user (you must have signed up first)
  select id into uid from auth.users limit 1;

  if uid is null then
    raise exception 'No user found in auth.users. Sign up first, then run this seed.';
  end if;

  -- Make sure user profile exists
  insert into public.users (id, email, display_name)
  select uid, u.email, split_part(u.email, '@', 1)
  from auth.users u where u.id = uid
  on conflict (id) do update set display_name = excluded.display_name;

  -- ========================================================
  -- ACCOUNTS
  -- ========================================================
  insert into public.accounts (id, user_id, name, type, initial_balance, current_balance, color) values
    (acc_checking, uid, 'Nubank Conta', 'checking', 5000.00, 4250.75, '#8B5CF6'),
    (acc_savings,  uid, 'Nubank Caixinha', 'savings', 10000.00, 12500.00, '#10B981'),
    (acc_cash,     uid, 'Carteira', 'cash', 200.00, 150.00, '#F59E0B'),
    (acc_credit,   uid, 'Nubank Crédito', 'credit_card', 0, -1850.00, '#EF4444');

  update public.accounts set credit_limit = 8000.00, closing_day = 3, due_day = 10
  where id = acc_credit;

  -- ========================================================
  -- CATEGORIES (parent + children)
  -- ========================================================

  -- Income
  insert into public.categories (id, user_id, name, kind, parent_id, icon, sort_order, is_system) values
    (cat_income, uid, 'Renda', 'income', null, '💰', 1, true),
    (sub_salary, uid, 'Salário', 'income', cat_income, '💼', 1, true),
    (sub_freelance, uid, 'Freelance', 'income', cat_income, '💻', 2, false),
    (sub_refunds, uid, 'Reembolsos', 'income', cat_income, '🔄', 3, false),
    (sub_interest, uid, 'Rendimentos', 'income', cat_income, '📈', 4, false);

  -- Housing
  insert into public.categories (id, user_id, name, kind, parent_id, icon, sort_order, is_system) values
    (cat_housing, uid, 'Moradia', 'expense', null, '🏠', 2, true),
    (sub_rent, uid, 'Aluguel', 'expense', cat_housing, '🏡', 1, true),
    (sub_utilities, uid, 'Contas (Luz/Água/Gás)', 'expense', cat_housing, '💡', 2, true),
    (sub_internet, uid, 'Internet', 'expense', cat_housing, '📡', 3, true);

  -- Food
  insert into public.categories (id, user_id, name, kind, parent_id, icon, sort_order, is_system) values
    (cat_food, uid, 'Alimentação', 'expense', null, '🍽️', 3, true),
    (sub_groceries, uid, 'Supermercado', 'expense', cat_food, '🛒', 1, true),
    (sub_restaurants, uid, 'Restaurantes', 'expense', cat_food, '🍕', 2, true),
    (sub_coffee, uid, 'Café', 'expense', cat_food, '☕', 3, false);

  -- Transport
  insert into public.categories (id, user_id, name, kind, parent_id, icon, sort_order, is_system) values
    (cat_transport, uid, 'Transporte', 'expense', null, '🚗', 4, true),
    (sub_uber, uid, 'Uber / 99', 'expense', cat_transport, '🚕', 1, true),
    (sub_fuel, uid, 'Combustível', 'expense', cat_transport, '⛽', 2, false),
    (sub_public_transport, uid, 'Transporte Público', 'expense', cat_transport, '🚌', 3, false);

  -- Health
  insert into public.categories (id, user_id, name, kind, parent_id, icon, sort_order, is_system) values
    (cat_health, uid, 'Saúde', 'expense', null, '❤️', 5, true),
    (sub_pharmacy, uid, 'Farmácia', 'expense', cat_health, '💊', 1, true),
    (sub_doctor, uid, 'Médico', 'expense', cat_health, '🩺', 2, false),
    (sub_insurance, uid, 'Plano de Saúde', 'expense', cat_health, '🏥', 3, false);

  -- Lifestyle
  insert into public.categories (id, user_id, name, kind, parent_id, icon, sort_order, is_system) values
    (cat_lifestyle, uid, 'Estilo de Vida', 'expense', null, '🎯', 6, true),
    (sub_shopping, uid, 'Compras', 'expense', cat_lifestyle, '🛍️', 1, true),
    (sub_entertainment, uid, 'Entretenimento', 'expense', cat_lifestyle, '🎬', 2, true),
    (sub_travel, uid, 'Viagens', 'expense', cat_lifestyle, '✈️', 3, false);

  -- Financial
  insert into public.categories (id, user_id, name, kind, parent_id, icon, sort_order, is_system) values
    (cat_financial, uid, 'Financeiro', 'expense', null, '🏦', 7, true),
    (sub_fees, uid, 'Taxas / Tarifas', 'expense', cat_financial, '📋', 1, false),
    (sub_cc_payment, uid, 'Fatura Cartão', 'expense', cat_financial, '💳', 2, true),
    (sub_transfers, uid, 'Transferências', 'transfer', cat_financial, '🔀', 3, true);

  -- Savings
  insert into public.categories (id, user_id, name, kind, parent_id, icon, sort_order, is_system) values
    (cat_savings, uid, 'Poupança', 'expense', null, '🐷', 8, true),
    (sub_emergency, uid, 'Reserva de Emergência', 'expense', cat_savings, '🆘', 1, false),
    (sub_investments, uid, 'Investimentos', 'expense', cat_savings, '📊', 2, false);

  -- ========================================================
  -- TRANSACTIONS (15 realistic transactions)
  -- ========================================================
  insert into public.transactions (user_id, account_id, category_id, type, status, source, amount, description, merchant_name, normalized_merchant_name, date) values
    -- Salary
    (uid, acc_checking, sub_salary, 'income', 'posted', 'manual', 8500.00, 'Salário Abril', 'Empresa LTDA', 'empresa ltda', current_date - interval '15 days'),
    -- Rent
    (uid, acc_checking, sub_rent, 'expense', 'posted', 'manual', 2200.00, 'Aluguel Abril', 'Imobiliária XYZ', 'imobiliaria xyz', current_date - interval '14 days'),
    -- Groceries
    (uid, acc_credit, sub_groceries, 'expense', 'posted', 'manual', 456.78, 'Compras do mês', 'Pão de Açúcar', 'pao de acucar', current_date - interval '12 days'),
    -- Uber rides
    (uid, acc_credit, sub_uber, 'expense', 'posted', 'manual', 24.50, 'Uber para o trabalho', 'Uber', 'uber', current_date - interval '10 days'),
    (uid, acc_credit, sub_uber, 'expense', 'posted', 'manual', 18.90, 'Uber volta', 'Uber', 'uber', current_date - interval '10 days'),
    -- Coffee
    (uid, acc_credit, sub_coffee, 'expense', 'posted', 'manual', 22.00, 'Café e pão de queijo', 'Starbucks', 'starbucks', current_date - interval '9 days'),
    -- Restaurant
    (uid, acc_credit, sub_restaurants, 'expense', 'posted', 'manual', 89.90, 'Almoço com amigos', 'Outback', 'outback', current_date - interval '8 days'),
    -- Internet
    (uid, acc_checking, sub_internet, 'expense', 'posted', 'manual', 119.90, 'Internet Fibra', 'Vivo Fibra', 'vivo fibra', current_date - interval '7 days'),
    -- iFood
    (uid, acc_credit, sub_restaurants, 'expense', 'posted', 'manual', 45.00, 'Jantar via iFood', 'iFood', 'ifood', current_date - interval '5 days'),
    -- Pharmacy
    (uid, acc_cash, sub_pharmacy, 'expense', 'posted', 'manual', 67.50, 'Remédios', 'Drogasil', 'drogasil', current_date - interval '4 days'),
    -- Netflix
    (uid, acc_credit, sub_entertainment, 'expense', 'posted', 'manual', 55.90, 'Netflix Premium', 'Netflix', 'netflix', current_date - interval '3 days'),
    -- Groceries again
    (uid, acc_credit, sub_groceries, 'expense', 'posted', 'manual', 234.50, 'Feira da semana', 'Extra', 'extra', current_date - interval '2 days'),
    -- Freelance income
    (uid, acc_checking, sub_freelance, 'income', 'posted', 'manual', 2000.00, 'Projeto freelance', 'Cliente ABC', 'cliente abc', current_date - interval '1 day'),
    -- Gas
    (uid, acc_credit, sub_fuel, 'expense', 'posted', 'manual', 250.00, 'Gasolina', 'Posto Shell', 'posto shell', current_date),
    -- Shopping
    (uid, acc_credit, sub_shopping, 'expense', 'posted', 'manual', 189.90, 'Camiseta + shorts', 'Renner', 'renner', current_date);

  -- ========================================================
  -- RECURRING SERIES (4 entries)
  -- ========================================================
  insert into public.recurring_series (id, user_id, account_id, category_id, type, amount, description, merchant_name, frequency, start_date, next_occurrence, auto_create) values
    (rec_salary, uid, acc_checking, sub_salary, 'income', 8500.00, 'Salário', 'Empresa LTDA', 'monthly', '2024-01-05', (date_trunc('month', current_date) + interval '1 month' + interval '4 days')::date, false),
    (rec_rent, uid, acc_checking, sub_rent, 'expense', 2200.00, 'Aluguel', 'Imobiliária XYZ', 'monthly', '2024-01-01', (date_trunc('month', current_date) + interval '1 month')::date, true),
    (rec_internet, uid, acc_checking, sub_internet, 'expense', 119.90, 'Internet Fibra', 'Vivo Fibra', 'monthly', '2024-01-10', (date_trunc('month', current_date) + interval '1 month' + interval '9 days')::date, true),
    (rec_netflix, uid, acc_credit, sub_entertainment, 'expense', 55.90, 'Netflix Premium', 'Netflix', 'monthly', '2024-01-15', (date_trunc('month', current_date) + interval '1 month' + interval '14 days')::date, true);

  -- ========================================================
  -- GOALS (3 savings goals)
  -- ========================================================
  insert into public.goals (user_id, name, target_amount, current_amount, target_date, icon, color) values
    (uid, 'Reserva de Emergência', 30000.00, 12500.00, '2025-12-31', '🆘', '#EF4444'),
    (uid, 'Viagem Europa', 15000.00, 3200.00, '2025-06-01', '✈️', '#3B82F6'),
    (uid, 'MacBook Pro', 12000.00, 4800.00, null, '💻', '#8B5CF6');

  -- ========================================================
  -- BUDGET MONTH (current month)
  -- ========================================================
  insert into public.budget_months (id, user_id, month) values
    (bm_current, uid, to_char(current_date, 'YYYY-MM'));

  insert into public.budget_items (budget_month_id, category_id, planned_amount) values
    (bm_current, cat_housing, 2500.00),
    (bm_current, cat_food, 1200.00),
    (bm_current, cat_transport, 500.00),
    (bm_current, cat_health, 300.00),
    (bm_current, cat_lifestyle, 600.00),
    (bm_current, cat_financial, 200.00),
    (bm_current, cat_savings, 2000.00);

  -- ========================================================
  -- RULES (categorization rules)
  -- ========================================================
  insert into public.rules (user_id, name, field, operator, value, category_id, priority) values
    (uid, 'Uber → Transporte', 'description', 'contains', 'uber', sub_uber, 10),
    (uid, '99 → Transporte', 'description', 'contains', '99', sub_uber, 9),
    (uid, 'iFood → Restaurantes', 'description', 'contains', 'ifood', sub_restaurants, 8),
    (uid, 'Netflix → Entretenimento', 'description', 'contains', 'netflix', sub_entertainment, 7),
    (uid, 'Starbucks → Café', 'description', 'contains', 'starbucks', sub_coffee, 6),
    (uid, 'Farmácia → Saúde', 'description', 'contains', 'farmacia', sub_pharmacy, 5),
    (uid, 'Drogasil → Farmácia', 'description', 'contains', 'drogasil', sub_pharmacy, 5),
    (uid, 'Shell → Combustível', 'description', 'contains', 'shell', sub_fuel, 4),
    (uid, 'Pão de Açúcar → Supermercado', 'description', 'contains', 'pao de acucar', sub_groceries, 3),
    (uid, 'Extra → Supermercado', 'description', 'contains', 'extra', sub_groceries, 2);

  -- ========================================================
  -- MERCHANT PROFILES
  -- ========================================================
  insert into public.merchant_profiles (user_id, normalized_name, display_name, default_category_id, default_account_id, last_amount, usage_count, last_used_at) values
    (uid, 'uber', 'Uber', sub_uber, acc_credit, 24.50, 12, now()),
    (uid, 'ifood', 'iFood', sub_restaurants, acc_credit, 45.00, 8, now()),
    (uid, 'netflix', 'Netflix', sub_entertainment, acc_credit, 55.90, 6, now()),
    (uid, 'starbucks', 'Starbucks', sub_coffee, acc_credit, 22.00, 5, now()),
    (uid, 'pao de acucar', 'Pão de Açúcar', sub_groceries, acc_credit, 456.78, 4, now()),
    (uid, 'extra', 'Extra', sub_groceries, acc_credit, 234.50, 3, now()),
    (uid, 'posto shell', 'Posto Shell', sub_fuel, acc_credit, 250.00, 2, now()),
    (uid, 'drogasil', 'Drogasil', sub_pharmacy, acc_cash, 67.50, 2, now()),
    (uid, 'vivo fibra', 'Vivo Fibra', sub_internet, acc_checking, 119.90, 6, now());

  raise notice 'Seed data inserted for user %', uid;
end $$;
