export type RuleOperator = 'contains' | 'equals' | 'starts_with';

export interface CategorizationRule {
  id: string;
  field: string;
  operator: RuleOperator;
  value: string;
  category_id: string;
  priority: number;
  is_active: boolean;
}

export interface RuleTargetTransaction {
  description: string;
  merchant_name?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow other fields to be checked if needed
}

/**
 * Checks if a single transaction matches a single rule.
 */
export function evaluateRule(transaction: RuleTargetTransaction, rule: CategorizationRule): boolean {
  if (!rule.is_active) return false;

  const targetValue = String(transaction[rule.field] || '').toLowerCase();
  const ruleValue = rule.value.toLowerCase();

  switch (rule.operator) {
    case 'equals':
      return targetValue === ruleValue;
    case 'starts_with':
      return targetValue.startsWith(ruleValue);
    case 'contains':
      return targetValue.includes(ruleValue);
    default:
      return false;
  }
}

/**
 * Evaluates a transaction against a list of rules (evaluated in order).
 * Returns the category_id of the FIRST matching rule, or null if none match.
 * Ensure the rules array is already sorted by priority (lowest number = highest priority).
 */
export function applyRules(transaction: RuleTargetTransaction, rules: CategorizationRule[]): string | null {
  for (const rule of rules) {
    if (evaluateRule(transaction, rule)) {
      return rule.category_id;
    }
  }
  return null;
}

/**
 * Evaluates an array of transactions against a list of rules.
 * Mutates the transactions by assigning the `categoryId` field if a rule matches.
 */
export function applyRulesBulk<T extends RuleTargetTransaction & { categoryId?: string }>(
  transactions: T[],
  rules: CategorizationRule[]
): T[] {
  // Filter active rules and ensure they are sorted by priority ascending
  const activeRules = rules
    .filter((r) => r.is_active)
    .sort((a, b) => a.priority - b.priority);

  if (activeRules.length === 0) return transactions;

  return transactions.map((tx) => {
    // Only apply if it doesn't already have a category (or if we want to overwrite)
    if (!tx.categoryId) {
      const matchedCategoryId = applyRules(tx, activeRules);
      if (matchedCategoryId) {
        tx.categoryId = matchedCategoryId;
      }
    }
    return tx;
  });
}
