'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/supabase/auth';
import { transactionSchema, type TransactionFormValues } from '@/lib/validations';
import { normalizeMerchantName } from '@/lib/utils/hashes';

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
    return { error: { _form: [error.message] } };
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
  await requireUserId();
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
    .eq('id', id);

  if (error) {
    return { error: { _form: [error.message] } };
  }

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  return { success: true };
}

export async function deleteTransaction(id: string) {
  await requireUserId();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('transactions').delete().eq('id', id);

  if (error) {
    return { error: error.message };
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

  // Fetch original transaction
  const { data: original, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !original) {
    return { error: 'Transaction not found' };
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
    return { error: error.message };
  }

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  return { success: true };
}

// ============================================================
// HELPERS
// ============================================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateAccountBalance(supabase: any, accountId: string, type: string, amount: number) {
  const delta = type === 'income' ? amount : -amount;

  const { data: account } = await supabase
    .from('accounts')
    .select('current_balance')
    .eq('id', accountId)
    .single();

  if (account) {
    await supabase
      .from('accounts')
      .update({ current_balance: Number(account.current_balance) + delta })
      .eq('id', accountId);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertMerchantProfile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  data: {
    normalizedName: string;
    displayName: string;
    categoryId: string | null;
    accountId: string;
    amount: number;
  }
) {
  const { data: existing } = await supabase
    .from('merchant_profiles')
    .select('id, usage_count')
    .eq('user_id', userId)
    .eq('normalized_name', data.normalizedName)
    .single();

  if (existing) {
    await supabase
      .from('merchant_profiles')
      .update({
        default_category_id: data.categoryId,
        default_account_id: data.accountId,
        last_amount: data.amount,
        usage_count: existing.usage_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('merchant_profiles').insert({
      user_id: userId,
      normalized_name: data.normalizedName,
      display_name: data.displayName,
      default_category_id: data.categoryId,
      default_account_id: data.accountId,
      last_amount: data.amount,
      usage_count: 1,
      last_used_at: new Date().toISOString(),
    });
  }
}
