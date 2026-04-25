'use server';

import { createClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/supabase/auth';
import { revalidatePath } from 'next/cache';
import { generateImportHash } from '@/lib/import/normalize';
import { cookies } from 'next/headers';

async function getClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

export async function checkDuplicatesAction(
  accountId: string,
  transactions: { date: string; amount: number; description: string }[]
) {
  const userId = await requireUserId();
  const supabase = await getClient();

  // Generate hashes for incoming transactions
  const incomingHashes = transactions.map((t) => 
    generateImportHash(accountId, t.date, t.amount, t.description)
  );

  // Instead of fetching all transactions (could be thousands),
  // we could just fetch transactions for this account in the min/max date range.
  const dates = transactions.map(t => t.date);
  if (dates.length === 0) return [];
  
  const minDate = dates.reduce((min, d) => (d < min ? d : min), dates[0]);
  const maxDate = dates.reduce((max, d) => (d > max ? d : max), dates[0]);

  const { data: existingTx } = await supabase
    .from('transactions')
    .select('date, amount, merchant_name, description')
    .eq('user_id', userId)
    .eq('account_id', accountId)
    .gte('date', minDate)
    .lte('date', maxDate);

  if (!existingTx) return [];

  // Re-generate hashes for existing transactions to match
  const existingHashes = new Set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    existingTx.map((tx: any) => 
      generateImportHash(accountId, tx.date, tx.amount, tx.merchant_name || tx.description)
    )
  );

  // Return the hashes that are duplicates
  return incomingHashes.filter((h) => existingHashes.has(h));
}

export async function finalizeImportAction(data: {
  accountId: string;
  filename: string;
  format: 'csv' | 'ofx';
  totalRows: number;
  transactions: {
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    categoryId?: string;
  }[];
}) {
  const userId = await requireUserId();
  const supabase = await getClient();

  // 1. Create Import Record
  const { data: importRecord, error: importError } = await supabase
    .from('imports')
    .insert({
      user_id: userId,
      account_id: data.accountId,
      filename: data.filename,
      format: data.format,
      total_rows: data.totalRows,
      imported_rows: data.transactions.length,
      status: 'completed'
    })
    .select('id')
    .single();

  if (importError) {
    return { error: 'Failed to create import record' };
  }

  // 2. Insert Transactions in bulk
  if (data.transactions.length > 0) {
    const txToInsert = data.transactions.map((tx) => ({
      user_id: userId,
      account_id: data.accountId,
      import_id: importRecord.id,
      date: tx.date,
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
      merchant_name: tx.description,
      category_id: tx.categoryId || null,
      status: 'posted' as const,
      source: data.format as 'csv' | 'ofx',
      external_hash: generateImportHash(data.accountId, tx.date, tx.amount, tx.description)
    }));

    const { error: txError } = await supabase
      .from('transactions')
      .insert(txToInsert);

    if (txError) {
      return { error: 'Failed to insert transactions' };
    }

    // 3. Update account balance
    // Calculate net change
    const netChange = data.transactions.reduce((sum, tx) => {
      return sum + (tx.type === 'income' ? tx.amount : -tx.amount);
    }, 0);

    const { data: account } = await supabase
      .from('accounts')
      .select('current_balance')
      .eq('id', data.accountId)
      .single();

    if (account) {
      await supabase
        .from('accounts')
        .update({ current_balance: Number(account.current_balance) + netChange })
        .eq('id', data.accountId);
    }
  }

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  
  return { success: true };
}
