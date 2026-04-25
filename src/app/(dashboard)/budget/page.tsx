import { getBudgetItems, getActualSpendingByCategory, getCategories } from '@/lib/db/queries';
import { buildBudgetLines, getMonthKey } from '@/lib/utils/budget';
import { BudgetClient } from './budget-client';

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function BudgetPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const month = params.month || getMonthKey();

  const [budgetItems, actualSpending, categories] = await Promise.all([
    getBudgetItems(month),
    getActualSpendingByCategory(month),
    getCategories(),
  ]);

  // Build a categories map for the utility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoriesMap = new Map<string, any>();
  categories.forEach((c) => categoriesMap.set(c.id, c));

  // Build enriched budget lines
  const lines = buildBudgetLines(budgetItems, actualSpending, categoriesMap);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Budget</h1>
        <p className="text-muted-foreground">
          Plan your monthly spending and track progress against your goals.
        </p>
      </div>

      <BudgetClient
        initialMonth={month}
        lines={lines}
        budgetItems={budgetItems}
        allCategories={categories}
      />
    </div>
  );
}
