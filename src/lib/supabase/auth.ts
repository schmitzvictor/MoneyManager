import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Get the current authenticated user.
 * Returns null if not authenticated.
 */
export async function getUser() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/**
 * Get the current authenticated user or redirect to login.
 * Use this in protected server components to ensure auth.
 */
export async function requireUser() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

/**
 * Get the current user ID or redirect to login.
 * Convenience helper for data queries.
 */
export async function requireUserId(): Promise<string> {
  const user = await requireUser();
  return user.id;
}
