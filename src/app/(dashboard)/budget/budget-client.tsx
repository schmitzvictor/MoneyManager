'use client';

import { useState, useTransition } from 'react';
import { BudgetMonthSelector } from '@/components/budget/budget-month-selector';
import { BudgetSummaryCards } from '@/components/budget/budget-summary-cards';
import { BudgetTable } from '@/components/budget/budget-table';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { type BudgetLineItem } from '@/lib/utils/budget';
import { getBudgetSummary, getMonthKey } from '@/lib/utils/budget';
import { copyBudgetFromMonth } from '@/lib/actions/budgets';
import { useRouter } from 'next/navigation';

interface BudgetClientProps {
  initialMonth: string;
  lines: BudgetLineItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  budgetItems: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allCategories: any[];
}

export function BudgetClient({
  initialMonth,
  lines,
  budgetItems,
  allCategories,
}: BudgetClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const summary = getBudgetSummary(lines);

  const handleMonthChange = (month: string) => {
    startTransition(() => {
      router.push(`/budget?month=${month}`);
    });
  };

  const handleCopyPrevious = async () => {
    const prevMonth = (() => {
      const [y, m] = initialMonth.split('-').map(Number);
      const d = new Date(y, m - 2, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    })();

    if (!confirm(`Copy budget from ${prevMonth} to ${initialMonth}? This will overwrite current items.`)) {
      return;
    }

    await copyBudgetFromMonth(prevMonth, initialMonth);
  };

  return (
    <div className={`space-y-6 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Header with month selector and actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <BudgetMonthSelector
          currentMonth={initialMonth}
          onMonthChange={handleMonthChange}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyPrevious}
          className="gap-1.5"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Previous Month
        </Button>
      </div>

      {/* Summary cards */}
      <BudgetSummaryCards {...summary} />

      {/* Budget table */}
      <BudgetTable
        month={initialMonth}
        lines={lines}
        budgetItems={budgetItems}
        allCategories={allCategories}
      />
    </div>
  );
}
