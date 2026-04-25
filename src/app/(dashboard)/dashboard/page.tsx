import { requireUser } from '@/lib/supabase/auth';
import {
  getDashboardMetrics,
  getMonthlyStats,
  getRecentTransactions,
} from '@/lib/db/queries';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { CashFlowChart } from '@/components/dashboard/cash-flow-chart';
import { RecentTransactionsWidget } from '@/components/dashboard/recent-transactions-widget';

export default async function DashboardPage() {
  const user = await requireUser();
  const displayName = user.email?.split('@')[0] ?? 'User';

  const [metrics, stats, recentTransactions] = await Promise.all([
    getDashboardMetrics(),
    getMonthlyStats(),
    getRecentTransactions(5),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {displayName}. Here&apos;s your financial overview.
        </p>
      </div>

      <SummaryCards
        totalBalance={metrics.totalBalance}
        monthlyIncome={metrics.monthlyIncome}
        monthlyExpense={metrics.monthlyExpense}
      />

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-4">
          <h2 className="text-base font-semibold mb-4">Cash Flow (Last 6 Months)</h2>
          <CashFlowChart data={stats} />
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-3">
          <h2 className="text-base font-semibold mb-4">Recent Transactions</h2>
          <RecentTransactionsWidget transactions={recentTransactions} />
        </div>
      </div>
    </div>
  );
}
