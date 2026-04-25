import { getAccounts } from '@/lib/db/queries';
import { AccountCard } from '@/components/accounts/account-card';
import { AccountFormDialog } from '@/components/accounts/account-form-dialog';
import { formatCurrency } from '@/lib/utils/currency';

export default async function AccountsPage() {
  const accounts = await getAccounts();

  const totalBalance = accounts
    .filter((a) => !a.is_archived)
    .reduce((sum, a) => sum + Number(a.current_balance), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Total balance: {formatCurrency(totalBalance)}
          </p>
        </div>
        <AccountFormDialog />
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
          <p className="text-lg font-medium">No accounts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first account to start tracking your finances.
          </p>
          <div className="mt-4">
            <AccountFormDialog />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  );
}
