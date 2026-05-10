import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/currency';
import { ChevronRight } from 'lucide-react';

interface RecentTransactionsWidgetProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions: any[];
}

const TYPE_ICONS: Record<string, string> = {
  income:   '💳',
  expense:  '💸',
  transfer: '🔄',
};

export function RecentTransactionsWidget({ transactions }: RecentTransactionsWidgetProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl p-8 text-center text-sm"
        style={{ border: '1px dashed rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.3)' }}
      >
        <p>Nenhuma transação recente</p>
        <Link
          href="/transactions"
          className="mt-2 text-xs font-medium"
          style={{ color: 'oklch(0.75 0.18 140)' }}
        >
          Adicionar uma agora
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {transactions.map((tx, i) => {
        const isIncome = tx.type === 'income';
        const emoji = tx.categories?.icon || TYPE_ICONS[tx.type] || '💳';

        return (
          <div
            key={tx.id}
            className="flex items-center gap-3 py-2.5"
            style={{ borderBottom: i < transactions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
          >
            {/* Icon */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              {emoji}
            </div>

            {/* Description */}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {tx.description || tx.merchant_name || '—'}
              </div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {tx.categories?.name && `${tx.categories.name} · `}
                {new Date(tx.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </div>
            </div>

            {/* Amount */}
            <div
              className="shrink-0 text-sm font-bold"
              style={{ color: isIncome ? '#34d399' : 'rgba(255,255,255,0.9)' }}
            >
              {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
            </div>
          </div>
        );
      })}

      <Link
        href="/transactions"
        className="mt-3 flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold transition-colors hover:bg-white/5"
        style={{ color: 'oklch(0.75 0.18 140)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        Ver todas
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
      </Link>
    </div>
  );
}
