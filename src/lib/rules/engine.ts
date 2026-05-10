/**
 * Rule engine — server-side functions.
 * For pure/client-safe helpers, import from ./engine-core instead.
 */
'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

// Re-export everything from engine-core so existing server-side callers
// don't need to change their import paths.
export type {
  RuleOperator,
  RuleField,
  Rule,
  RuleMatchInput,
  RuleMatchResult,
  CategorizationRule,
  RuleTargetTransaction,
} from './engine-core';
export { testRule, applyRuleSet, applyRules, applyRulesBulk } from './engine-core';

import type { Rule, RuleMatchInput } from './engine-core';
import { applyRuleSet } from './engine-core';

// ─── Server-side helpers ──────────────────────────────────────────────────────

export async function getRulesForUser(): Promise<Rule[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('rules')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: true });

  if (error) return [];
  return (data ?? []) as Rule[];
}

export async function categorizeTransaction(
  input: RuleMatchInput
): Promise<string | null> {
  const rules = await getRulesForUser();
  const result = applyRuleSet(rules, input);
  return result.categoryId;
}

export async function categorizeBatch(
  transactions: RuleMatchInput[]
): Promise<(string | null)[]> {
  const rules = await getRulesForUser();
  return transactions.map((tx) => applyRuleSet(rules, tx).categoryId);
}
