import { TrendingUp, TrendingDown, PieChart, Landmark } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

interface Account {
  id: string;
  name: string;
  balance: number;
  color?: string | null;
}

interface SummaryCardsProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  accounts?: Account[];
}

// ─── Glass card shell ─────────────────────────────────────────────────────────
function GCard({
  children,
  style,
  glow,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  glow?: boolean;
}) {
  return (
    <div
      style={{
        background: 'rgba(28,28,52,0.95)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 20,
        padding: 22,
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        boxShadow: glow
          ? '0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 16px rgba(0,0,0,0.3)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Sparkline mini bars ──────────────────────────────────────────────────────
function Sparkline({ color }: { color: string }) {
  const heights = [0.3, 0.55, 0.4, 0.7, 0.85, 1];
  return (
    <div className="flex items-end gap-1 mt-2.5" style={{ height: 20 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${h * 100}%`,
            background: color,
            opacity: 0.2 + h * 0.55,
          }}
        />
      ))}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="mt-2.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)', height: 4 }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, pct)}%`, background: color }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function SummaryCards({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  accounts = [],
}: SummaryCardsProps) {
  const netFlow = monthlyIncome - monthlyExpense;
  const netFlowPct = monthlyIncome > 0 ? Math.round((netFlow / monthlyIncome) * 100) : 0;
  const isPositive = netFlow >= 0;

  return (
    <div
      className="grid gap-3.5"
      style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
    >
      {/* ── Hero balance card (2 cols) ── */}
      <GCard
        glow
        style={{
          gridColumn: 'span 2',
          background: 'linear-gradient(135deg, rgba(40,40,72,0.98) 0%, rgba(28,28,52,0.95) 100%)',
          border: '1px solid rgba(255,255,255,0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow orb */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: -40, right: -40, width: 180, height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, oklch(0.75 0.18 140 / 0.2), transparent 70%)',
          }}
        />
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Saldo Total
        </div>
        <div style={{ fontSize: 36, fontWeight: 900, color: 'rgba(255,255,255,0.95)', letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 12 }}>
          {formatCurrency(totalBalance)}
        </div>
        <div className="flex gap-5">
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>Receitas</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#34d399' }}>+{formatCurrency(monthlyIncome)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>Despesas</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f43f5e' }}>-{formatCurrency(monthlyExpense)}</div>
          </div>
        </div>
      </GCard>

      {/* ── Net flow stat card ── */}
      <GCard style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="flex items-start justify-between">
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Fluxo Líquido</div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{
              background: isPositive ? 'rgba(52,211,153,0.14)' : 'rgba(244,63,94,0.14)',
            }}
          >
            {isPositive
              ? <TrendingUp  className="h-4 w-4" style={{ color: '#34d399' }} strokeWidth={2} />
              : <TrendingDown className="h-4 w-4" style={{ color: '#f43f5e' }} strokeWidth={2} />}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 26, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1,
              color: isPositive ? '#34d399' : '#f43f5e',
            }}
          >
            {formatCurrency(Math.abs(netFlow))}
          </div>
          <div className="mt-1.5 flex items-center gap-1" style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            {isPositive
              ? <TrendingUp  className="h-3 w-3" style={{ color: '#34d399' }} strokeWidth={2.5} />
              : <TrendingDown className="h-3 w-3" style={{ color: '#f43f5e' }} strokeWidth={2.5} />}
            {netFlowPct > 0 ? '+' : ''}{netFlowPct}% da renda
          </div>
        </div>
        <Sparkline color={isPositive ? '#34d399' : '#f43f5e'} />
      </GCard>

      {/* ── Expense ratio stat card ── */}
      <GCard style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="flex items-start justify-between">
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Despesas/Renda</div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: 'rgba(251,191,36,0.14)' }}
          >
            <PieChart className="h-4 w-4" style={{ color: '#fbbf24' }} strokeWidth={2} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1, color: '#fbbf24' }}>
            {monthlyIncome > 0 ? Math.round((monthlyExpense / monthlyIncome) * 100) : 0}%
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
            {formatCurrency(monthlyExpense)} de {formatCurrency(monthlyIncome)}
          </div>
        </div>
        <Bar
          pct={monthlyIncome > 0 ? (monthlyExpense / monthlyIncome) * 100 : 0}
          color="#fbbf24"
        />
      </GCard>

      {/* ── Accounts mini card ── */}
      <GCard style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="mb-3.5 flex items-center justify-between">
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
            <Landmark className="mb-0.5 inline h-3.5 w-3.5 mr-1.5" strokeWidth={1.75} />
            Contas
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-xs"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}
          >
            {accounts.length}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-between gap-2.5">
          {accounts.slice(0, 4).map((a) => (
            <div key={a.id} className="flex items-center gap-2.5">
              <div
                className="shrink-0 rounded-full"
                style={{ width: 4, minHeight: 18, alignSelf: 'stretch', background: a.color ?? '#6366f1' }}
              />
              <div className="min-w-0 flex-1">
                <div
                  className="truncate font-medium"
                  style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}
                >
                  {a.name}
                </div>
              </div>
              <div
                className="whitespace-nowrap font-bold"
                style={{ fontSize: 12, color: a.balance < 0 ? '#f43f5e' : 'rgba(255,255,255,0.9)' }}
              >
                {formatCurrency(a.balance)}
              </div>
            </div>
          ))}
          {accounts.length === 0 && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Nenhuma conta</div>
          )}
        </div>
      </GCard>
    </div>
  );
}
