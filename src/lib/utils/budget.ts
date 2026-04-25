/**
 * Budget utilization status calculation utilities.
 */

export type BudgetStatus = 'safe' | 'near_limit' | 'over_limit';

export interface BudgetLineItem {
  categoryId: string;
  categoryName: string;
  categoryIcon?: string | null;
  categoryColor?: string | null;
  planned: number;
  actual: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
}

/**
 * Determine the status of a single budget line.
 */
export function getBudgetStatus(planned: number, actual: number): BudgetStatus {
  if (planned <= 0) return 'safe';
  const ratio = actual / planned;
  if (ratio > 1) return 'over_limit';
  if (ratio >= 0.85) return 'near_limit';
  return 'safe';
}

/**
 * Build enriched budget line items by combining planned amounts with actual spending.
 */
export function buildBudgetLines(
  budgetItems: { category_id: string; planned_amount: number }[],
  actualsByCategory: Map<string, number>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categoriesMap: Map<string, any>
): BudgetLineItem[] {
  return budgetItems.map((item) => {
    const planned = Number(item.planned_amount);
    const actual = actualsByCategory.get(item.category_id) || 0;
    const remaining = planned - actual;
    const percentage = planned > 0 ? (actual / planned) * 100 : 0;
    const cat = categoriesMap.get(item.category_id);

    return {
      categoryId: item.category_id,
      categoryName: cat?.name || 'Unknown',
      categoryIcon: cat?.icon || null,
      categoryColor: cat?.color || null,
      planned,
      actual,
      remaining,
      percentage,
      status: getBudgetStatus(planned, actual),
    };
  });
}

/**
 * Get summary totals from budget lines.
 */
export function getBudgetSummary(lines: BudgetLineItem[]) {
  const totalPlanned = lines.reduce((sum, l) => sum + l.planned, 0);
  const totalActual = lines.reduce((sum, l) => sum + l.actual, 0);
  const totalRemaining = totalPlanned - totalActual;
  const overBudgetCount = lines.filter((l) => l.status === 'over_limit').length;
  const nearLimitCount = lines.filter((l) => l.status === 'near_limit').length;

  return {
    totalPlanned,
    totalActual,
    totalRemaining,
    overBudgetCount,
    nearLimitCount,
    overallPercentage: totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0,
    overallStatus: getBudgetStatus(totalPlanned, totalActual),
  };
}

/**
 * Get the YYYY-MM string for the current month or offset.
 */
export function getMonthKey(offset = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Format a YYYY-MM key to a human-readable month name.
 */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
