import { requireUser } from '@/lib/supabase/auth';
import {
  getDashboardMetrics,
  getMonthlyStats,
  getRecentTransactions,
  getAccounts,
  getUpcomingRecurring,
} from '@/lib/db/queries';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { CashFlowChart } from '@/components/dashboard/cash-flow-chart';
import { RecentTransactionsWidget } from '@/components/dashboard/recent-transactions-widget';
import { formatCurrency } from '@/lib/utils/currency';

// ─── Glass card wrapper (server-safe, no backdrop-filter state) ───────────────
function GCard({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(28,28,52,0.95)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 20,
        padding: 22,
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 16px rgba(0,0,0,0.3)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default async function DashboardPage() {
  await requireUser();

  const [metrics, stats, recentTransactions, accounts, upcoming] = await Promise.all([
    getDashboardMetrics(),
    getMonthlyStats(),
    getRecentTransactions(5),
    getAccounts(),
    getUpcomingRecurring(),
  ]);

  const upcomingTotal = upcoming?.reduce((s: number, r: { amount: number }) => s + Number(r.amount), 0) ?? 0;

  return (
    <div className="flex flex-col gap-3.5">

      {/* TOP ROW: Hero balance + 2 stats + accounts mini */}
      <SummaryCards
        totalBalance={metrics.totalBalance}
        monthlyIncome={metrics.monthlyIncome}
        monthlyExpense={metrics.monthlyExpense}
        accounts={accounts}
      />

      {/* MID ROW: Cash flow chart + "This month" headline */}
      <div className="grid gap-3.5" style={{ gridTemplateColumns: '1fr 340px' }}>

        {/* Bar chart */}
        <GCard>
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Neste mês você gastou</div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, lineHeight: 1.1, color: '#f43f5e' }}>
              {formatCurrency(metrics.monthlyExpense)}
            </div>
          </div>
          <div className="mb-3 flex gap-3.5">
            {[['oklch(0.75 0.18 140)', 'Receita'], ['#f43f5e', 'Despesa']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <span className="inline-block h-2 w-2 rounded-sm" style={{ background: c }} />
                {l}
              </span>
            ))}
          </div>
          <CashFlowChart data={stats} />
        </GCard>

        {/* Upcoming recurring */}
        <GCard style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.95)', marginBottom: 14 }}>Próximos</div>

          {/* Summary pill */}
          <div
            className="mb-3 rounded-xl px-3 py-2.5"
            style={{
              background: 'rgba(244,63,94,0.10)',
              border: '1px solid rgba(244,63,94,0.18)',
            }}
          >
            <div style={{ fontSize: 11, color: 'rgba(244,63,94,0.85)', fontWeight: 600, marginBottom: 2 }}>
              Este mês você agendou
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.5 }}>
              {formatCurrency(upcomingTotal)}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
              {upcoming?.length ?? 0} pagamentos
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between">
            {(upcoming ?? []).slice(0, 5).map((r: {
              id: string;
              description?: string;
              amount: number;
              next_date?: string;
              categories?: { icon?: string };
            }, i: number, arr: unknown[]) => (
              <div
                key={r.id}
                className="flex items-center gap-2.5 py-2"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
              >
                <span className="text-base">{r.categories?.icon ?? '🔄'}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {r.description ?? '—'}
                  </div>
                  {r.next_date && (
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {new Date(r.next_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-xs font-bold" style={{ color: '#f43f5e' }}>
                  -{formatCurrency(r.amount)}
                </div>
              </div>
            ))}
            {(!upcoming || upcoming.length === 0) && (
              <div className="flex items-center justify-center py-4 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Nenhum recorrente próximo
              </div>
            )}
          </div>
        </GCard>
      </div>

      {/* BOTTOM ROW: Recent transactions */}
      <GCard>
        <div className="mb-4 flex items-center justify-between">
          <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>Transações Recentes</div>
        </div>
        <RecentTransactionsWidget transactions={recentTransactions} />
      </GCard>
    </div>
  );
}
