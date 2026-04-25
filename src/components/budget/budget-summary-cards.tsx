'use client';

import { formatCurrency } from '@/lib/utils/currency';
import { type BudgetStatus } from '@/lib/utils/budget';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';

interface BudgetSummaryCardsProps {
  totalPlanned: number;
  totalActual: number;
  totalRemaining: number;
  overallPercentage: number;
  overallStatus: BudgetStatus;
  overBudgetCount: number;
  nearLimitCount: number;
}

const statusColors: Record<BudgetStatus, string> = {
  safe: 'text-emerald-600',
  near_limit: 'text-amber-500',
  over_limit: 'text-red-600',
};

export function BudgetSummaryCards({
  totalPlanned,
  totalActual,
  totalRemaining,
  overallPercentage,
  overallStatus,
  overBudgetCount,
  nearLimitCount,
}: BudgetSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Budget */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Planned</p>
            <p className="text-lg font-bold">{formatCurrency(totalPlanned)}</p>
          </div>
        </div>
      </div>

      {/* Spent */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <p className="text-lg font-bold">{formatCurrency(totalActual)}</p>
            <p className="text-xs text-muted-foreground">{Math.round(overallPercentage)}% of budget</p>
          </div>
        </div>
      </div>

      {/* Remaining */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            totalRemaining >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
          }`}>
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {totalRemaining >= 0 ? 'Remaining' : 'Over Budget'}
            </p>
            <p className={`text-lg font-bold ${statusColors[overallStatus]}`}>
              {formatCurrency(Math.abs(totalRemaining))}
            </p>
            {(overBudgetCount > 0 || nearLimitCount > 0) && (
              <p className="text-xs text-muted-foreground">
                {overBudgetCount > 0 && <span className="text-red-500">{overBudgetCount} over</span>}
                {overBudgetCount > 0 && nearLimitCount > 0 && ', '}
                {nearLimitCount > 0 && <span className="text-amber-500">{nearLimitCount} near limit</span>}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
