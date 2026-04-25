'use server';

import { createClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/supabase/auth';
import { revalidatePath } from 'next/cache';
import { RuleFormValues, ruleSchema } from '@/lib/validations';
import { cookies } from 'next/headers';

async function getAuthClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

export async function createRule(values: RuleFormValues) {
  const userId = await requireUserId();
  const supabase = await getAuthClient();

  const validated = ruleSchema.safeParse(values);
  if (!validated.success) {
    return { error: 'Invalid data', details: validated.error.flatten() };
  }

  // Get max priority
  const { data: rules } = await supabase
    .from('rules')
    .select('priority')
    .eq('user_id', userId)
    .order('priority', { ascending: false })
    .limit(1);
    
  const nextPriority = rules && rules.length > 0 ? rules[0].priority + 1 : 1;

  const { error } = await supabase.from('rules').insert({
    user_id: userId,
    ...validated.data,
    priority: nextPriority,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings');
  return { success: true };
}

export async function updateRule(id: string, values: RuleFormValues) {
  const userId = await requireUserId();
  const supabase = await getAuthClient();

  const validated = ruleSchema.safeParse(values);
  if (!validated.success) {
    return { error: 'Invalid data', details: validated.error.flatten() };
  }

  const { error } = await supabase
    .from('rules')
    .update({
      ...validated.data,
    })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings');
  return { success: true };
}

export async function deleteRule(id: string) {
  const userId = await requireUserId();
  const supabase = await getAuthClient();

  const { error } = await supabase
    .from('rules')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings');
  return { success: true };
}

export async function reorderRules(updates: { id: string; priority: number }[]) {
  const userId = await requireUserId();
  const supabase = await getAuthClient();

  // Supabase doesn't support bulk updates natively using standard supabase-js without an RPC,
  // but we can do a Promise.all for a reasonable amount of rules (e.g. < 50)
  
  const promises = updates.map((update) => 
    supabase
      .from('rules')
      .update({ priority: update.priority })
      .eq('id', update.id)
      .eq('user_id', userId)
  );

  await Promise.all(promises);

  revalidatePath('/settings');
  return { success: true };
}
