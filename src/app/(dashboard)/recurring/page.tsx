import { getRecurringSeries, getUpcomingRecurring, getAccounts, getCategories } from '@/lib/db/queries';
import { RecurringList } from '@/components/recurring/recurring-list';
import { RecurringFormDialog } from '@/components/recurring/recurring-form-dialog';
import { RepeatIcon } from 'lucide-react';

export default async function RecurringPage() {
  const [series, upcoming, accounts, categories] = await Promise.all([
    getRecurringSeries(),
    getUpcomingRecurring(),
    getAccounts(),
    getCategories(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recurring</h1>
          <p className="text-sm text-muted-foreground">Manage recurring income and expenses</p>
        </div>
        <RecurringFormDialog accounts={accounts} categories={categories} />
      </div>

      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Due in the next 30 days
          </h2>
          <RecurringList items={upcoming} accounts={accounts} categories={categories} />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          All recurring series
        </h2>
        {series.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
            <RepeatIcon className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">No recurring transactions</p>
            <p className="mt-1 text-sm text-muted-foreground">Set up a recurring series for bills, salaries, or subscriptions.</p>
            <div className="mt-4">
              <RecurringFormDialog accounts={accounts} categories={categories} />
            </div>
          </div>
        ) : (
          <RecurringList items={series} accounts={accounts} categories={categories} />
        )}
      </section>
    </div>
  );
}
