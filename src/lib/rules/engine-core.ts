/**
 * Rule engine — pure functions, no server dependencies.
 * Safe to import in both client and server components.
 */

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

// Compatibility aliases used by import-client and tests
export type CategorizationRule = Rule;
export type RuleTargetTransaction = RuleMatchInput & { id?: string; categoryId?: string };

// ─── Core matcher ─────────────────────────────────────────────────────────────

export function testRule(rule: Rule, input: RuleMatchInput): boolean {
  const fieldValue = (() => {
    switch (rule.field) {
      case 'description':   return (input.description ?? '').toLowerCase();
      case 'merchant_name': return (input.merchant_name ?? '').toLowerCase();
      case 'amount':        return String(input.amount ?? '');
    }
  })();

  const ruleValue = rule.value.toLowerCase();

  switch (rule.operator) {
    case 'contains':    return fieldValue.includes(ruleValue);
    case 'equals':      return fieldValue === ruleValue;
    case 'starts_with': return fieldValue.startsWith(ruleValue);
    default:            return false;
  }
}

export function applyRuleSet(rules: Rule[], input: RuleMatchInput): RuleMatchResult {
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

/** Apply rules to a single transaction. Returns matched category_id or null. */
export function applyRules(input: RuleMatchInput, rules: Rule[]): string | null {
  return applyRuleSet(rules, input).categoryId;
}

/** Apply rules to a batch, skipping transactions that already have a category. */
export function applyRulesBulk(
  transactions: (RuleMatchInput & { id?: string; categoryId?: string })[],
  rules: Rule[]
): (RuleMatchInput & { id?: string; categoryId?: string })[] {
  return transactions.map((tx) => {
    if (tx.categoryId) return tx;
    const result = applyRuleSet(rules, tx);
    return result.categoryId ? { ...tx, categoryId: result.categoryId } : tx;
  });
}
