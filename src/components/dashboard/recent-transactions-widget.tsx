import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/currency';
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecentTransactionsWidgetProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions: any[];
}

export function RecentTransactionsWidget({ transactions }: RecentTransactionsWidgetProps) {
  const TypeIcon = {
    income: ArrowDownLeft,
    expense: ArrowUpRight,
    transfer: ArrowLeftRight,
  };

  const typeColor = {
    income: 'text-emerald-600 bg-emerald-500/10',
    expense: 'text-red-600 bg-red-500/10',
    transfer: 'text-blue-600 bg-blue-500/10',
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        <p>No recent transactions</p>
        <Button variant="link" className="mt-2" render={<Link href="/transactions" />} nativeButton={false}>
          Add one now
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        {transactions.map((tx) => {
          const Icon = TypeIcon[tx.type as keyof typeof TypeIcon] || ArrowUpRight;
          const colorClass = typeColor[tx.type as keyof typeof typeColor] || '';

          return (
            <div key={tx.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {tx.description || tx.merchant_name || '—'}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <span>{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                    {tx.accounts?.name && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <div 
                            className="h-1.5 w-1.5 rounded-full" 
                            style={{ backgroundColor: tx.accounts.color || '#888' }}
                          />
                          <span>{tx.accounts.name}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${colorClass.split(' ')[0]}`}>
                  {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      <Button variant="outline" className="w-full" render={<Link href="/transactions" />} nativeButton={false}>
        View all transactions
      </Button>
    </div>
  );
}
