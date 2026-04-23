import { requireUser } from '@/lib/supabase/auth';

export default async function DashboardPage() {
  const user = await requireUser();
  const displayName = user.email?.split('@')[0] ?? 'User';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {displayName}. Here&apos;s your financial overview.
        </p>
      </div>

      {/* Summary cards — will be implemented in Phase 5 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Balance', value: 'R$ 0,00', sub: 'Across all accounts' },
          { label: 'Income (month)', value: 'R$ 0,00', sub: 'This month' },
          { label: 'Expenses (month)', value: 'R$ 0,00', sub: 'This month' },
          { label: 'Budget Usage', value: '0%', sub: 'Of planned budget' },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-bold">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts and recent transactions — will be implemented in Phase 5+ */}
      <div className="grid gap-4 lg:grid-cols-7">
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-4">
          <h2 className="text-base font-semibold">Spending Overview</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Charts will be added in Phase 5.
          </p>
          <div className="mt-4 flex h-48 items-center justify-center rounded-lg bg-muted/50">
            <span className="text-muted-foreground">📊 Chart area</span>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-3">
          <h2 className="text-base font-semibold">Recent Transactions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Transaction list will be added in Phase 6.
          </p>
          <div className="mt-4 flex h-48 items-center justify-center rounded-lg bg-muted/50">
            <span className="text-muted-foreground">📋 Transactions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
