import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

interface SummaryCardsProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

export function SummaryCards({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
}: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Balance Card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Balance
            </p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(totalBalance)}
            </h3>
          </div>
        </div>
      </div>

      {/* Income Card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Income (This Month)
            </p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(monthlyIncome)}
            </h3>
          </div>
        </div>
      </div>

      {/* Expense Card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Expenses (This Month)
            </p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(monthlyExpense)}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
