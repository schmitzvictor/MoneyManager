'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function login(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signup(formData: FormData) {
  // ── Single-user guard ─────────────────────────────────────────────────────
  // MoneyManager is designed for single-user use.
  // Signup is disabled unless ALLOW_SIGNUP=true is explicitly set.
  // Set this only during initial setup, then remove it from env.
  if (process.env.ALLOW_SIGNUP !== 'true') {
    return {
      error:
        'Registration is closed. Contact the administrator if you need access.',
    };
  }
  // ─────────────────────────────────────────────────────────────────────────

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logout() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  redirect('/login');
}
