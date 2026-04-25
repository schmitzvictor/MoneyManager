'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/supabase/auth';
import { categorySchema, type CategoryFormValues } from '@/lib/validations';

export async function createCategory(values: CategoryFormValues) {
  const userId = await requireUserId();
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('categories').insert({
    user_id: userId,
    name: parsed.data.name,
    kind: parsed.data.kind,
    parent_id: parsed.data.parent_id || null,
    icon: parsed.data.icon || null,
    color: parsed.data.color || null,
    sort_order: parsed.data.sort_order,
  });

  if (error) {
    return { error: { _form: [error.message] } };
  }

  revalidatePath('/settings');
  revalidatePath('/transactions');
  revalidatePath('/budget');
  return { success: true };
}

export async function updateCategory(id: string, values: CategoryFormValues) {
  await requireUserId();
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('categories')
    .update({
      name: parsed.data.name,
      kind: parsed.data.kind,
      parent_id: parsed.data.parent_id || null,
      icon: parsed.data.icon || null,
      color: parsed.data.color || null,
      sort_order: parsed.data.sort_order,
    })
    .eq('id', id);

  if (error) {
    return { error: { _form: [error.message] } };
  }

  revalidatePath('/settings');
  revalidatePath('/transactions');
  revalidatePath('/budget');
  return { success: true };
}

export async function deleteCategory(id: string) {
  await requireUserId();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings');
  revalidatePath('/transactions');
  revalidatePath('/budget');
  return { success: true };
}
