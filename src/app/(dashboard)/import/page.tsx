import { getAccounts } from '@/lib/db/queries';
import { ImportClient } from './import-client';

export default async function ImportPage() {
  const accounts = await getAccounts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import Transactions</h1>
        <p className="text-muted-foreground">
          Upload a bank statement to automatically add multiple transactions.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <ImportClient accounts={accounts} />
      </div>
    </div>
  );
}
