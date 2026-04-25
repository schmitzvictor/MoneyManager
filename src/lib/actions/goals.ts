'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/supabase/auth';
import { goalSchema, contributeSchema, type GoalFormValues, type ContributeFormValues } from '@/lib/validations';

async function getAuthClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

export async function createGoal(values: GoalFormValues) {
  const userId = await requireUserId();
  const parsed = goalSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await getAuthClient();
  const { error } = await supabase.from('goals').insert({
    user_id: userId,
    name: parsed.data.name,
    target_amount: parsed.data.target_amount,
    current_amount: 0,
    target_date: parsed.data.target_date || null,
    icon: parsed.data.icon || null,
    color: parsed.data.color || null,
  });

  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/goals');
  return { success: true };
}

export async function updateGoal(id: string, values: GoalFormValues) {
  await requireUserId();
  const parsed = goalSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await getAuthClient();
  const { error } = await supabase
    .from('goals')
    .update({
      name: parsed.data.name,
      target_amount: parsed.data.target_amount,
      target_date: parsed.data.target_date || null,
      icon: parsed.data.icon || null,
      color: parsed.data.color || null,
    })
    .eq('id', id);

  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/goals');
  return { success: true };
}

export async function deleteGoal(id: string) {
  await requireUserId();
  const supabase = await getAuthClient();

  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/goals');
  return { success: true };
}

export async function contributeToGoal(id: string, values: ContributeFormValues) {
  await requireUserId();
  const parsed = contributeSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await getAuthClient();

  const { data: goal, error: fetchErr } = await supabase
    .from('goals')
    .select('current_amount, target_amount')
    .eq('id', id)
    .single();

  if (fetchErr || !goal) return { error: { _form: ['Goal not found.'] } };

  const newAmount = Math.min(
    Number(goal.current_amount) + parsed.data.amount,
    Number(goal.target_amount)
  );

  const { error } = await supabase
    .from('goals')
    .update({ current_amount: newAmount })
    .eq('id', id);

  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/goals');
  return { success: true };
}
