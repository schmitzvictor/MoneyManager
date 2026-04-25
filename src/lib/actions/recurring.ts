'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/supabase/auth';
import { recurringSchema, type RecurringFormValues } from '@/lib/validations';

async function getAuthClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

function advanceDate(dateStr: string, frequency: string): string {
  const d = new Date(dateStr);
  switch (frequency) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'biweekly':
      d.setDate(d.getDate() + 14);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.toISOString().split('T')[0];
}

export async function createRecurring(values: RecurringFormValues) {
  const userId = await requireUserId();
  const parsed = recurringSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await getAuthClient();
  const { error } = await supabase.from('recurring_series').insert({
    user_id: userId,
    account_id: parsed.data.account_id,
    category_id: parsed.data.category_id || null,
    type: parsed.data.type,
    amount: parsed.data.amount,
    description: parsed.data.description,
    frequency: parsed.data.frequency,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date || null,
    next_occurrence: parsed.data.start_date,
    auto_create: parsed.data.auto_create,
  });

  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/recurring');
  return { success: true };
}

export async function updateRecurring(id: string, values: RecurringFormValues) {
  await requireUserId();
  const parsed = recurringSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await getAuthClient();
  const { error } = await supabase
    .from('recurring_series')
    .update({
      account_id: parsed.data.account_id,
      category_id: parsed.data.category_id || null,
      type: parsed.data.type,
      amount: parsed.data.amount,
      description: parsed.data.description,
      frequency: parsed.data.frequency,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date || null,
      auto_create: parsed.data.auto_create,
    })
    .eq('id', id);

  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/recurring');
  return { success: true };
}

export async function deleteRecurring(id: string) {
  await requireUserId();
  const supabase = await getAuthClient();

  const { error } = await supabase.from('recurring_series').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/recurring');
  return { success: true };
}

export async function markOccurrencePosted(id: string) {
  await requireUserId();
  const supabase = await getAuthClient();

  const { data: series, error: fetchErr } = await supabase
    .from('recurring_series')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !series) return { error: 'Recurring series not found.' };

  // Create a real transaction
  const { error: txErr } = await supabase.from('transactions').insert({
    user_id: series.user_id,
    account_id: series.account_id,
    category_id: series.category_id || null,
    type: series.type,
    status: 'posted',
    amount: series.amount,
    description: series.description,
    date: series.next_occurrence,
    recurring_series_id: series.id,
  });

  if (txErr) return { error: txErr.message };

  // Advance next_occurrence
  const nextDate = advanceDate(series.next_occurrence, series.frequency);

  const { error: updateErr } = await supabase
    .from('recurring_series')
    .update({ next_occurrence: nextDate })
    .eq('id', id);

  if (updateErr) return { error: updateErr.message };

  revalidatePath('/recurring');
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  return { success: true };
}
