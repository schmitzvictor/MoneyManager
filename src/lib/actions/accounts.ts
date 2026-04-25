'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/supabase/auth';
import { accountSchema, type AccountFormValues } from '@/lib/validations';

export async function createAccount(values: AccountFormValues) {
  const userId = await requireUserId();
  const parsed = accountSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('accounts').insert({
    user_id: userId,
    name: parsed.data.name,
    type: parsed.data.type,
    initial_balance: parsed.data.initial_balance,
    current_balance: parsed.data.initial_balance,
    color: parsed.data.color || null,
    icon: parsed.data.icon || null,
    credit_limit: parsed.data.credit_limit || null,
    closing_day: parsed.data.closing_day || null,
    due_day: parsed.data.due_day || null,
  });

  if (error) {
    return { error: { _form: [error.message] } };
  }

  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateAccount(id: string, values: AccountFormValues) {
  await requireUserId();
  const parsed = accountSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('accounts')
    .update({
      name: parsed.data.name,
      type: parsed.data.type,
      color: parsed.data.color || null,
      icon: parsed.data.icon || null,
      credit_limit: parsed.data.credit_limit || null,
      closing_day: parsed.data.closing_day || null,
      due_day: parsed.data.due_day || null,
    })
    .eq('id', id);

  if (error) {
    return { error: { _form: [error.message] } };
  }

  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteAccount(id: string) {
  await requireUserId();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('accounts').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function archiveAccount(id: string, archived: boolean) {
  await requireUserId();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('accounts')
    .update({ is_archived: archived })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/accounts');
  return { success: true };
}
