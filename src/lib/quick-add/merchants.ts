/**
 * Smart Quick Add — Merchant profile utilities
 *
 * Server-side helpers to fetch recent merchants and their profiles.
 * These functions are used to populate the Quick Add sheet with suggestions.
 */
'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export interface MerchantProfile {
  id: string;
  normalized_name: string;
  display_name: string;
  default_category_id: string | null;
  default_account_id: string | null;
  last_amount: number | null;
  usage_count: number;
  last_used_at: string | null;
}

/**
 * Fetch the most frequently used merchant profiles for the current user.
 */
export async function getRecentMerchants(limit = 8): Promise<MerchantProfile[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase
    .from('merchant_profiles')
    .select('*')
    .order('usage_count', { ascending: false })
    .order('last_used_at', { ascending: false })
    .limit(limit);

  return (data ?? []) as MerchantProfile[];
}

/**
 * Look up a single merchant profile by normalized name.
 */
export async function getMerchantByNormalizedName(
  normalizedName: string
): Promise<MerchantProfile | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase
    .from('merchant_profiles')
    .select('*')
    .eq('normalized_name', normalizedName)
    .maybeSingle();

  return data as MerchantProfile | null;
}
