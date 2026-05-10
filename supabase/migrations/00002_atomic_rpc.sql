-- ============================================================
-- Migration 00002: Atomic account balance RPC
-- ============================================================
-- This function adjusts an account's current_balance atomically
-- using a single UPDATE statement (no separate SELECT needed).
-- It runs with SECURITY DEFINER so it executes as the table owner,
-- bypassing row-level security for the internal balance update while
-- still being callable only by authenticated users.
--
-- Usage (from Supabase JS client):
--   await supabase.rpc('adjust_account_balance', {
--     p_account_id: '...',
--     p_delta: 50.00   -- positive = credit, negative = debit
--   })
-- ============================================================

create or replace function public.adjust_account_balance(
  p_account_id uuid,
  p_delta      numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.accounts
  set
    current_balance = current_balance + p_delta,
    updated_at      = now()
  where id = p_account_id;

  if not found then
    raise exception 'Account % not found', p_account_id;
  end if;
end;
$$;

-- Revoke direct public access; only authenticated users may call it
revoke all on function public.adjust_account_balance(uuid, numeric) from public;
grant execute on function public.adjust_account_balance(uuid, numeric) to authenticated;

-- ============================================================
-- Migration 00002b: Atomic merchant profile upsert RPC
-- ============================================================
-- Combines the SELECT + INSERT/UPDATE merchant_profiles into a
-- single atomic operation using INSERT ... ON CONFLICT DO UPDATE.
-- ============================================================

create or replace function public.upsert_merchant_profile(
  p_user_id         uuid,
  p_normalized_name text,
  p_display_name    text,
  p_category_id     uuid  default null,
  p_account_id      uuid  default null,
  p_last_amount     numeric default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.merchant_profiles (
    user_id,
    normalized_name,
    display_name,
    default_category_id,
    default_account_id,
    last_amount,
    usage_count,
    last_used_at
  ) values (
    p_user_id,
    p_normalized_name,
    p_display_name,
    p_category_id,
    p_account_id,
    p_last_amount,
    1,
    now()
  )
  on conflict (user_id, normalized_name) do update
    set
      default_category_id = coalesce(excluded.default_category_id, merchant_profiles.default_category_id),
      default_account_id  = coalesce(excluded.default_account_id,  merchant_profiles.default_account_id),
      last_amount         = coalesce(excluded.last_amount,          merchant_profiles.last_amount),
      usage_count         = merchant_profiles.usage_count + 1,
      last_used_at        = now();
end;
$$;

revoke all on function public.upsert_merchant_profile(uuid, text, text, uuid, uuid, numeric) from public;
grant execute on function public.upsert_merchant_profile(uuid, text, text, uuid, uuid, numeric) to authenticated;
