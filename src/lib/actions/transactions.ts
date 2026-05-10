'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/supabase/auth';
import { transactionSchema, type TransactionFormValues } from '@/lib/validations';
import { normalizeMerchantName } from '@/lib/utils/hashes';

// Use the inferred return type so we never need `any` for the client
type SupabaseServerClient = ReturnType<typeof createClient>;

export async function createTransaction(values: TransactionFormValues) {
  const userId = await requireUserId();
  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const normalizedMerchant = parsed.data.merchant_name
    ? normalizeMerchantName(parsed.data.merchant_name)
    : null;

  // Determine amount sign: expenses stored as positive, type determines direction
  const amount = parsed.data.amount;

  const { error } = await supabase.from('transactions').insert({
    user_id: userId,
    account_id: parsed.data.account_id,
    category_id: parsed.data.category_id || null,
    type: parsed.data.type,
    status: parsed.data.status,
    source: 'manual' as const,
    amount,
    description: parsed.data.description,
    merchant_name: parsed.data.merchant_name || null,
    normalized_merchant_name: normalizedMerchant,
    notes: parsed.data.notes || null,
    date: parsed.data.date,
    transfer_account_id: parsed.data.transfer_account_id || null,
  });

  if (error) {
    return { error: { _form: ['Failed to create transaction. Please try again.'] } };
  }

  // Update account balance
  await updateAccountBalance(supabase, parsed.data.account_id, parsed.data.type, amount);

  // Update merchant profile
  if (normalizedMerchant) {
    await upsertMerchantProfile(supabase, userId, {
      normalizedName: normalizedMerchant,
      displayName: parsed.data.merchant_name!,
      categoryId: parsed.data.category_id || null,
      accountId: parsed.data.account_id,
      amount,
    });
  }

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  return { success: true };
}

export async function updateTransaction(id: string, values: TransactionFormValues) {
  const userId = await requireUserId();
  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const normalizedMerchant = parsed.data.merchant_name
    ? normalizeMerchantName(parsed.data.merchant_name)
    : null;

  const { error } = await supabase
    .from('transactions')
    .update({
      account_id: parsed.data.account_id,
      category_id: parsed.data.category_id || null,
      type: parsed.data.type,
      status: parsed.data.status,
      amount: parsed.data.amount,
      description: parsed.data.description,
      merchant_name: parsed.data.merchant_name || null,
      normalized_merchant_name: normalizedMerchant,
      notes: parsed.data.notes || null,
      date: parsed.data.date,
      transfer_account_id: parsed.data.transfer_account_id || null,
    })
    .eq('id', id)
    .eq('user_id', userId); // ownership check

  if (error) {
    return { error: { _form: ['Failed to update transaction. Please try again.'] } };
  }

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const userId = await requireUserId();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId); // ownership check

  if (error) {
    return { error: 'Failed to delete transaction. Please try again.' };
  }

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  return { success: true };
}

export async function duplicateTransaction(id: string) {
  const userId = await requireUserId();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch original transaction — scoped to the current user for ownership check
  const { data: original, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId) // ownership check
    .single();

  if (fetchError || !original) {
    return { error: 'Transaction not found.' };
  }

  // Insert duplicate with today's date
  const today = new Date().toISOString().split('T')[0];
  const { error } = await supabase.from('transactions').insert({
    user_id: userId,
    account_id: original.account_id,
    category_id: original.category_id,
    type: original.type,
    status: 'posted' as const,
    source: 'manual' as const,
    amount: original.amount,
    description: original.description,
    merchant_name: original.merchant_name,
    normalized_merchant_name: original.normalized_merchant_name,
    notes: original.notes,
    date: today,
    transfer_account_id: original.transfer_account_id,
  });

  if (error) {
    return { error: 'Failed to duplicate transaction. Please try again.' };
  }

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  return { success: true };
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Atomically adjust an account's current_balance by a signed delta.
 *
 * Delegates to the `adjust_account_balance` Postgres RPC function
 * (migration 00002_atomic_rpc.sql) which performs a single UPDATE,
 * eliminating the SELECT → UPDATE race condition.
 *
 * delta > 0 = credit (income),  delta < 0 = debit (expense)
 */
async function updateAccountBalance(
  supabase: SupabaseServerClient,
  accountId: string,
  type: string,
  amount: number
): Promise<void> {
  const delta = type === 'income' ? amount : -amount;
  await supabase.rpc('adjust_account_balance', {
    p_account_id: accountId,
    p_delta: delta,
  });
}

/**
 * Atomically upsert a merchant profile using INSERT ... ON CONFLICT.
 * Delegates to `upsert_merchant_profile` Postgres RPC function.
 */
async function upsertMerchantProfile(
  supabase: SupabaseServerClient,
  userId: string,
  data: {
    normalizedName: string;
    displayName: string;
    categoryId: string | null;
    accountId: string;
    amount: number;
  }
): Promise<void> {
  await supabase.rpc('upsert_merchant_profile', {
    p_user_id: userId,
    p_normalized_name: data.normalizedName,
    p_display_name: data.displayName,
    p_category_id: data.categoryId ?? null,
    p_account_id: data.accountId,
    p_last_amount: data.amount,
  });
}
