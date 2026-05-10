/**
 * Rule Engine — server-side standalone module
 *
 * Fetches and applies categorization rules for a given description.
 * Designed to be used in Server Actions and import pipeline.
 *
 * Operators supported: contains | equals | starts_with
 * Fields supported: description | merchant_name | amount
 *
 * Rules are sorted by priority (ascending: lower number = first applied).
 */
'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RuleOperator = 'contains' | 'equals' | 'starts_with';
export type RuleField = 'description' | 'merchant_name' | 'amount';

export interface Rule {
  id: string;
  field: RuleField;
  operator: RuleOperator;
  value: string;
  category_id: string | null;
  priority: number;
  is_active: boolean;
}

export interface RuleMatchInput {
  description?: string;
  merchant_name?: string;
  amount?: number;
}

export interface RuleMatchResult {
  matched: boolean;
  categoryId: string | null;
  ruleId: string | null;
}

// ─── Core matcher (pure, no DB) ───────────────────────────────────────────────

/**
 * Test a single rule against a transaction's fields.
 * Returns true if the rule condition is satisfied.
 */
export function testRule(rule: Rule, input: RuleMatchInput): boolean {
  const fieldValue = (() => {
    switch (rule.field) {
      case 'description':
        return (input.description ?? '').toLowerCase();
      case 'merchant_name':
        return (input.merchant_name ?? '').toLowerCase();
      case 'amount':
        return String(input.amount ?? '');
    }
  })();

  const ruleValue = rule.value.toLowerCase();

  switch (rule.operator) {
    case 'contains':
      return fieldValue.includes(ruleValue);
    case 'equals':
      return fieldValue === ruleValue;
    case 'starts_with':
      return fieldValue.startsWith(ruleValue);
    default:
      return false;
  }
}

/**
 * Apply an ordered list of rules against input.
 * Returns the first matching rule's category_id.
 *
 * Rules MUST be pre-sorted by priority ascending (lower = higher priority).
 */
export function applyRuleSet(
  rules: Rule[],
  input: RuleMatchInput
): RuleMatchResult {
  const activeRules = rules
    .filter((r) => r.is_active && r.category_id)
    .sort((a, b) => a.priority - b.priority);

  for (const rule of activeRules) {
    if (testRule(rule, input)) {
      return { matched: true, categoryId: rule.category_id, ruleId: rule.id };
    }
  }

  return { matched: false, categoryId: null, ruleId: null };
}

// ─── Server-side helpers ──────────────────────────────────────────────────────

/**
 * Fetch all active rules for the current user, sorted by priority.
 */
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

/**
 * Categorize a single transaction using the user's active rules.
 * Returns the matched category_id or null if no rule matches.
 */
export async function categorizeTransaction(
  input: RuleMatchInput
): Promise<string | null> {
  const rules = await getRulesForUser();
  const result = applyRuleSet(rules, input);
  return result.categoryId;
}

/**
 * Apply rules to a batch of transactions.
 * Fetches rules once and evaluates each transaction.
 * Returns an array of category IDs (null = no match) in the same order.
 */
export async function categorizeBatch(
  transactions: RuleMatchInput[]
): Promise<(string | null)[]> {
  const rules = await getRulesForUser();
  return transactions.map((tx) => applyRuleSet(rules, tx).categoryId);
}

// ─── Compatibility aliases ────────────────────────────────────────────────────
// These aliases preserve backward-compatibility with import-client.tsx and
// engine.test.ts which were written before this module was finalized.

/** @alias Rule */
export type CategorizationRule = Rule;

/** @alias RuleMatchInput */
export type RuleTargetTransaction = RuleMatchInput & { id?: string; categoryId?: string };

/**
 * Apply rules to a single transaction.
 * Accepts args in (input, rules) order for test compatibility.
 * Returns the matched category_id or null.
 */
export function applyRules(
  input: RuleMatchInput,
  rules: Rule[]
): string | null {
  return applyRuleSet(rules, input).categoryId;
}

/**
 * Apply rules to a batch — skipping transactions that already have a category.
 * Returns a new array with categoryId assigned where applicable.
 */
export function applyRulesBulk(
  transactions: (RuleMatchInput & { id?: string; categoryId?: string })[],
  rules: Rule[]
): (RuleMatchInput & { id?: string; categoryId?: string })[] {
  return transactions.map((tx) => {
    // Don't overwrite existing category
    if (tx.categoryId) return tx;
    const result = applyRuleSet(rules, tx);
    return result.categoryId ? { ...tx, categoryId: result.categoryId } : tx;
  });
}
