/**
 * Smart Quick Add — Suggestion Engine
 *
 * Determines category and account suggestions for a transaction based on:
 * 1. Explicit rules (highest priority)
 * 2. Merchant profile history
 * 3. Recent category usage pattern
 * 4. Fallback: no suggestion
 *
 * All logic is deterministic — no paid AI APIs.
 */

import { normalizeMerchantName } from '@/lib/utils/hashes';

// ─── Domain types ────────────────────────────────────────────────────────────

export interface RuleRecord {
  id: string;
  field: string;
  operator: 'contains' | 'equals' | 'starts_with';
  value: string;
  category_id: string | null;
  priority: number;
  is_active: boolean;
}

export interface MerchantRecord {
  normalized_name: string;
  default_category_id: string | null;
  default_account_id: string | null;
  last_amount: number | null;
  usage_count: number;
}

export interface CategoryRecord {
  id: string;
  kind: string;
}

export interface Suggestion {
  categoryId: string | null;
  accountId: string | null;
  amount: number | null;
  /** How the suggestion was derived */
  source: 'rule' | 'merchant' | 'recent' | 'none';
  confidence: 'high' | 'medium' | 'low';
}

// ─── Rule matching ────────────────────────────────────────────────────────────

/**
 * Apply the rule engine against a description string.
 * Rules are evaluated in ascending priority order (lower number = higher priority).
 * Returns the first matching rule's category_id, or null.
 */
export function applyRules(
  description: string,
  rules: RuleRecord[]
): string | null {
  const text = description.toLowerCase();

  const sorted = [...rules]
    .filter((r) => r.is_active && r.category_id)
    .sort((a, b) => a.priority - b.priority);

  for (const rule of sorted) {
    const value = rule.value.toLowerCase();
    let match = false;

    switch (rule.operator) {
      case 'contains':
        match = text.includes(value);
        break;
      case 'equals':
        match = text === value;
        break;
      case 'starts_with':
        match = text.startsWith(value);
        break;
    }

    if (match) return rule.category_id;
  }

  return null;
}

// ─── Main suggestion function ─────────────────────────────────────────────────

export interface SuggestionInput {
  /** Raw description / merchant text from the user */
  description: string;
  /** Parsed amount (used to check merchant's last_amount) */
  amount?: number | null;
  rules: RuleRecord[];
  merchants: MerchantRecord[];
  /** Recent category IDs ordered by recency (most recent first) */
  recentCategoryIds: string[];
  /** All available categories */
  categories: CategoryRecord[];
  /** Transaction type (to filter category by kind) */
  type: 'income' | 'expense' | 'transfer';
}

/**
 * Build a suggestion for the given description and context.
 *
 * Priority order:
 *  1. Explicit rule match (high confidence)
 *  2. Merchant profile match (high confidence)
 *  3. Recent category usage for the same type (medium confidence)
 *  4. No suggestion (low confidence)
 */
export function buildSuggestion(input: SuggestionInput): Suggestion {
  const { description, rules, merchants, recentCategoryIds, categories, type } = input;

  const noSuggestion: Suggestion = {
    categoryId: null,
    accountId: null,
    amount: null,
    source: 'none',
    confidence: 'low',
  };

  if (!description.trim()) return noSuggestion;

  // 1. Explicit rule match
  const ruleCategory = applyRules(description, rules);
  if (ruleCategory) {
    return {
      categoryId: ruleCategory,
      accountId: null,
      amount: null,
      source: 'rule',
      confidence: 'high',
    };
  }

  // 2. Merchant history match
  const normalized = normalizeMerchantName(description);
  const merchant = merchants.find((m) => m.normalized_name === normalized);
  if (merchant) {
    return {
      categoryId: merchant.default_category_id,
      accountId: merchant.default_account_id,
      amount: merchant.last_amount,
      source: 'merchant',
      confidence: 'high',
    };
  }

  // Partial merchant match (name starts with or contains normalized text)
  if (normalized.length >= 3) {
    const partial = merchants.find(
      (m) =>
        m.normalized_name.includes(normalized) ||
        normalized.includes(m.normalized_name)
    );
    if (partial) {
      return {
        categoryId: partial.default_category_id,
        accountId: partial.default_account_id,
        amount: partial.last_amount,
        source: 'merchant',
        confidence: 'medium',
      };
    }
  }

  // 3. Recent category usage for this transaction type
  const compatibleKind = type === 'transfer' ? 'transfer' : type;
  for (const catId of recentCategoryIds) {
    const cat = categories.find((c) => c.id === catId && c.kind === compatibleKind);
    if (cat) {
      return {
        categoryId: catId,
        accountId: null,
        amount: null,
        source: 'recent',
        confidence: 'low',
      };
    }
  }

  return noSuggestion;
}
