'use server';

import { createClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/supabase/auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

async function getAuthClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

/**
 * Upsert a single budget item for a given month.
 */
export async function upsertBudgetItem(
  month: string,
  categoryId: string,
  plannedAmount: number
) {
  const userId = await requireUserId();
  const supabase = await getAuthClient();

  // 1. Get or create budget_month
  let { data: budgetMonth } = await supabase
    .from('budget_months')
    .select('id')
    .eq('month', month)
    .eq('user_id', userId)
    .maybeSingle();

  if (!budgetMonth) {
    const { data: created, error: createErr } = await supabase
      .from('budget_months')
      .insert({ user_id: userId, month })
      .select('id')
      .single();

    if (createErr) return { error: createErr.message };
    budgetMonth = created;
  }

  if (!budgetMonth) return { error: 'Failed to get budget month.' };

  // 2. Upsert budget item
  // Check if it exists already
  const { data: existing } = await supabase
    .from('budget_items')
    .select('id')
    .eq('budget_month_id', budgetMonth.id)
    .eq('category_id', categoryId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('budget_items')
      .update({ planned_amount: plannedAmount })
      .eq('id', existing.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('budget_items').insert({
      budget_month_id: budgetMonth.id,
      category_id: categoryId,
      planned_amount: plannedAmount,
    });

    if (error) return { error: error.message };
  }

  revalidatePath('/budget');
  return { success: true };
}

/**
 * Delete a budget item.
 */
export async function deleteBudgetItem(id: string) {
  await requireUserId();
  const supabase = await getAuthClient();

  const { error } = await supabase
    .from('budget_items')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/budget');
  return { success: true };
}

/**
 * Copy all budget items from one month to another.
 */
export async function copyBudgetFromMonth(sourceMonth: string, targetMonth: string) {
  const userId = await requireUserId();
  const supabase = await getAuthClient();

  // 1. Get source budget month
  const { data: sourceBM } = await supabase
    .from('budget_months')
    .select('id')
    .eq('month', sourceMonth)
    .eq('user_id', userId)
    .maybeSingle();

  if (!sourceBM) return { error: 'Source month has no budget.' };

  // 2. Get source items
  const { data: sourceItems } = await supabase
    .from('budget_items')
    .select('category_id, planned_amount')
    .eq('budget_month_id', sourceBM.id);

  if (!sourceItems || sourceItems.length === 0) {
    return { error: 'Source month has no budget items.' };
  }

  // 3. Get or create target budget month
  let { data: targetBM } = await supabase
    .from('budget_months')
    .select('id')
    .eq('month', targetMonth)
    .eq('user_id', userId)
    .maybeSingle();

  if (!targetBM) {
    const { data: created, error: createErr } = await supabase
      .from('budget_months')
      .insert({ user_id: userId, month: targetMonth })
      .select('id')
      .single();

    if (createErr) return { error: createErr.message };
    targetBM = created;
  }

  if (!targetBM) return { error: 'Failed to create target budget month.' };

  // 4. Delete existing target items (full overwrite)
  await supabase
    .from('budget_items')
    .delete()
    .eq('budget_month_id', targetBM.id);

  // 5. Insert copied items
  const newItems = sourceItems.map((item) => ({
    budget_month_id: targetBM!.id,
    category_id: item.category_id,
    planned_amount: item.planned_amount,
  }));

  const { error } = await supabase.from('budget_items').insert(newItems);

  if (error) return { error: error.message };

  revalidatePath('/budget');
  return { success: true };
}
