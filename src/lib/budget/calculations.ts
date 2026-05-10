/**
 * Budget Calculation Utilities
 *
 * Pure functions for computing budget status, utilization, and summaries.
 * All functions are deterministic and have no side effects.
 */

import type { BudgetStatus } from '@/types/finance';

// ─── Threshold constants ──────────────────────────────────────────────────────

/** Fraction of planned amount at which a budget is considered "near limit" */
const NEAR_LIMIT_THRESHOLD = 0.8;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BudgetItemCalc {
  categoryId: string;
  categoryName: string;
  categoryIcon?: string | null;
  categoryColor?: string | null;
  parentId?: string | null;
  planned: number;
  actual: number;
}

export interface BudgetItemResult extends BudgetItemCalc {
  remaining: number;
  overspent: number;
  utilizationPct: number;
  status: BudgetStatus;
}

export interface BudgetSummary {
  totalPlanned: number;
  totalActual: number;
  totalRemaining: number;
  totalOverspent: number;
  netUtilizationPct: number;
  /** Items grouped by status */
  overLimitCount: number;
  nearLimitCount: number;
  safeCount: number;
}

// ─── Item-level calculations ──────────────────────────────────────────────────

/**
 * Compute remaining, overspent, utilization %, and status for a single budget item.
 */
export function calculateBudgetItem(item: BudgetItemCalc): BudgetItemResult {
  const remaining = Math.max(0, item.planned - item.actual);
  const overspent = Math.max(0, item.actual - item.planned);
  const utilizationPct =
    item.planned > 0 ? Math.min((item.actual / item.planned) * 100, 999) : 0;

  let status: BudgetStatus = 'safe';
  if (item.actual > item.planned) {
    status = 'over_limit';
  } else if (item.planned > 0 && item.actual / item.planned >= NEAR_LIMIT_THRESHOLD) {
    status = 'near_limit';
  }

  return {
    ...item,
    remaining,
    overspent,
    utilizationPct,
    status,
  };
}

/**
 * Calculate results for all budget items given their planned amounts
 * and actual spending from transactions.
 *
 * @param items   Budget items with planned amounts
 * @param actuals Map of category_id → total actual spending
 */
export function calculateBudgetItems(
  items: BudgetItemCalc[],
  actuals: Map<string, number>
): BudgetItemResult[] {
  return items.map((item) =>
    calculateBudgetItem({
      ...item,
      actual: actuals.get(item.categoryId) ?? 0,
    })
  );
}

// ─── Rollup with parent/child ─────────────────────────────────────────────────

/**
 * Roll up child category actuals into their parent for summary display.
 * Returns a new Map with both direct spending and children's spending merged.
 */
export function rollupActualsByParent(
  items: BudgetItemCalc[],
  actuals: Map<string, number>
): Map<string, number> {
  const rolled = new Map(actuals);

  for (const item of items) {
    if (!item.parentId) continue;
    const childActual = actuals.get(item.categoryId) ?? 0;
    const parentActual = rolled.get(item.parentId) ?? 0;
    rolled.set(item.parentId, parentActual + childActual);
  }

  return rolled;
}

// ─── Summary ──────────────────────────────────────────────────────────────────

/**
 * Compute an aggregate summary across all budget item results.
 */
export function summarizeBudget(results: BudgetItemResult[]): BudgetSummary {
  let totalPlanned = 0;
  let totalActual = 0;
  let overLimitCount = 0;
  let nearLimitCount = 0;
  let safeCount = 0;

  for (const r of results) {
    totalPlanned += r.planned;
    totalActual += r.actual;
    if (r.status === 'over_limit') overLimitCount++;
    else if (r.status === 'near_limit') nearLimitCount++;
    else safeCount++;
  }

  const totalRemaining = Math.max(0, totalPlanned - totalActual);
  const totalOverspent = Math.max(0, totalActual - totalPlanned);
  const netUtilizationPct =
    totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  return {
    totalPlanned,
    totalActual,
    totalRemaining,
    totalOverspent,
    netUtilizationPct,
    overLimitCount,
    nearLimitCount,
    safeCount,
  };
}

// ─── Cash flow utilities ──────────────────────────────────────────────────────

export interface MonthlyTotals {
  income: number;
  expense: number;
  netCashFlow: number;
}

/**
 * Compute income, expense, and net cash flow from a list of transactions.
 */
export function calculateMonthlyTotals(
  transactions: { type: string; amount: number }[]
): MonthlyTotals {
  let income = 0;
  let expense = 0;

  for (const tx of transactions) {
    if (tx.type === 'income') income += Number(tx.amount);
    else if (tx.type === 'expense') expense += Number(tx.amount);
  }

  return { income, expense, netCashFlow: income - expense };
}

/**
 * Calculate account balance utilization for credit card accounts.
 * Returns a percentage of credit limit used (0–100+).
 */
export function calculateCreditUtilization(
  currentBalance: number,
  creditLimit: number | null
): number | null {
  if (!creditLimit || creditLimit <= 0) return null;
  return (Math.abs(currentBalance) / creditLimit) * 100;
}

/**
 * Format a budget status into a user-facing label.
 */
export function budgetStatusLabel(status: BudgetStatus): string {
  switch (status) {
    case 'over_limit':
      return 'Over budget';
    case 'near_limit':
      return 'Near limit';
    case 'safe':
      return 'On track';
  }
}

/**
 * Returns the Tailwind CSS color class for a budget status.
 */
export function budgetStatusColor(status: BudgetStatus): string {
  switch (status) {
    case 'over_limit':
      return 'text-destructive';
    case 'near_limit':
      return 'text-amber-500';
    case 'safe':
      return 'text-emerald-500';
  }
}
