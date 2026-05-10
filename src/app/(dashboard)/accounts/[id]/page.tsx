import { notFound } from 'next/navigation';
import { getAccount, getTransactions } from '@/lib/db/queries';
import { formatCurrency } from '@/lib/utils/currency';
import { AccountFormDialog } from '@/components/accounts/account-form-dialog';
import { TransactionActions } from '@/components/transactions/transaction-actions';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  Wallet,
  Banknote,
  PiggyBank,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
} from 'lucide-react';
import Link from 'next/link';

const ACCOUNT_ICONS = {
  checking: Wallet,
  savings: PiggyBank,
  cash: Banknote,
  credit_card: CreditCard,
} as const;

const TYPE_ICON = {
  income: ArrowDownLeft,
  expense: ArrowUpRight,
  transfer: ArrowLeftRight,
} as const;

const TYPE_COLOR = {
  income: 'text-emerald-600 dark:text-emerald-400',
  expense: 'text-red-600 dark:text-red-400',
  transfer: 'text-blue-600 dark:text-blue-400',
} as const;

interface AccountDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function AccountDetailPage({
  params,
  searchParams,
}: AccountDetailPageProps) {
  const { id } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page ?? 1);
  const pageSize = 20;

  const [account, { data: transactions, count }] = await Promise.all([
    getAccount(id).catch(() => null),
    getTransactions({ accountId: id, page: currentPage, pageSize }),
  ]);

  if (!account) notFound();

  const Icon =
    ACCOUNT_ICONS[account.type as keyof typeof ACCOUNT_ICONS] ?? Wallet;

  const typeLabel: Record<string, string> = {
    checking: 'Checking Account',
    savings: 'Savings Account',
    cash: 'Cash',
    credit_card: 'Credit Card',
  };

  // Monthly stats for this account
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0];

  const { data: monthlyTx } = await getTransactions({
    accountId: id,
    startDate: firstDay,
    endDate: lastDay,
    pageSize: 500,
  });

  let monthlyIncome = 0;
  let monthlyExpense = 0;
  monthlyTx?.forEach((tx) => {
    if (tx.type === 'income') monthlyIncome += Number(tx.amount);
    if (tx.type === 'expense') monthlyExpense += Number(tx.amount);
  });

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link
        href="/accounts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Accounts
      </Link>

      {/* Account header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-white shrink-0"
            style={{ backgroundColor: account.color ?? '#6366f1' }}
          >
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{account.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              {typeLabel[account.type] ?? account.type}
              {account.is_archived && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">Archived</span>
              )}
            </p>
          </div>
        </div>
        <AccountFormDialog account={account} />
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Balance</p>
          <p className="text-2xl font-bold tabular-nums">
            {formatCurrency(Number(account.current_balance))}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Initial Balance</p>
          <p className="text-2xl font-bold tabular-nums">
            {formatCurrency(Number(account.initial_balance))}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            This Month In
          </p>
          <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatCurrency(monthlyIncome)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            This Month Out
          </p>
          <p className="text-2xl font-bold tabular-nums text-destructive">
            {formatCurrency(monthlyExpense)}
          </p>
        </div>

        {account.type === 'credit_card' && account.credit_limit && (
          <div className="rounded-xl border bg-card p-5 space-y-2 sm:col-span-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Credit Limit — {formatCurrency(Number(account.credit_limit))}
            </p>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min(
                    (Math.abs(Number(account.current_balance)) / Number(account.credit_limit)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              {account.closing_day && <span>Closes day <strong>{account.closing_day}</strong></span>}
              {account.due_day && <span>Due day <strong>{account.due_day}</strong></span>}
            </div>
          </div>
        )}
      </div>

      {/* Transaction list */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Transactions
          {count !== null && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({count})</span>
          )}
        </h2>

        {!transactions || transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">No transactions for this account yet.</p>
          </div>
        ) : (
          <>
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Description</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => {
                    const TxIcon = TYPE_ICON[tx.type as keyof typeof TYPE_ICON] ?? ArrowUpRight;
                    const color = TYPE_COLOR[tx.type as keyof typeof TYPE_COLOR] ?? '';
                    return (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <TxIcon className={`h-4 w-4 ${color}`} />
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {tx.description || tx.merchant_name || '—'}
                          </p>
                          {tx.merchant_name && tx.description && (
                            <p className="text-xs text-muted-foreground">{tx.merchant_name}</p>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {tx.categories ? (
                            <span className="text-sm">{tx.categories.icon} {tx.categories.name}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {new Date(tx.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-mono font-medium ${color}`}>
                            {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                            {formatCurrency(Number(tx.amount))}
                          </span>
                          {tx.status !== 'posted' && (
                            <Badge variant="outline" className="ml-2 text-xs">{tx.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <TransactionActions
                            transaction={tx}
                            accounts={[account]}
                            categories={[]}
                            rules={[]}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                {currentPage > 1 && (
                  <Link
                    href={`/accounts/${id}?page=${currentPage - 1}`}
                    className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                  >
                    Previous
                  </Link>
                )}
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Link
                    href={`/accounts/${id}?page=${currentPage + 1}`}
                    className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
