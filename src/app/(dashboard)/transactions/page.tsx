import { getTransactions, getAccounts, getCategories } from '@/lib/db/queries';
import { TransactionFormDialog } from '@/components/transactions/transaction-form-dialog';
import { TransactionActions } from '@/components/transactions/transaction-actions';
import { TransactionFilters } from '@/components/transactions/transaction-filters';
import { formatCurrency } from '@/lib/utils/currency';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    account?: string;
    category?: string;
    type?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [{ data: transactions, count }, accounts, categories] = await Promise.all([
    getTransactions({
      search: params.search,
      accountId: params.account,
      categoryId: params.category,
      type: params.type,
      startDate: params.from,
      endDate: params.to,
      page: params.page ? parseInt(params.page) : 1,
    }),
    getAccounts(),
    getCategories(),
  ]);

  const TypeIcon = {
    income: ArrowDownLeft,
    expense: ArrowUpRight,
    transfer: ArrowLeftRight,
  };

  const typeColor = {
    income: 'text-emerald-600',
    expense: 'text-red-600',
    transfer: 'text-blue-600',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            {count ?? 0} transaction{(count ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <TransactionFormDialog accounts={accounts} categories={categories} />
      </div>

      <TransactionFilters accounts={accounts} categories={categories} />

      {!transactions || transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
          <p className="text-lg font-medium">No transactions found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {params.search || params.account || params.category || params.type
              ? 'Try adjusting your filters.'
              : 'Create your first transaction to get started.'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Account</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const Icon = TypeIcon[tx.type as keyof typeof TypeIcon] || ArrowUpRight;
                const color = typeColor[tx.type as keyof typeof typeColor] || '';

                return (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tx.description || tx.merchant_name || '—'}</p>
                        {tx.merchant_name && tx.description && (
                          <p className="text-xs text-muted-foreground">{tx.merchant_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {tx.categories ? (
                        <span className="text-sm">
                          {tx.categories.icon} {tx.categories.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: tx.accounts?.color || '#888' }}
                        />
                        <span className="text-sm">{tx.accounts?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono font-medium ${color}`}>
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                        {formatCurrency(tx.amount)}
                      </span>
                      {tx.status !== 'posted' && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {tx.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <TransactionActions
                        transaction={tx}
                        accounts={accounts}
                        categories={categories}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
