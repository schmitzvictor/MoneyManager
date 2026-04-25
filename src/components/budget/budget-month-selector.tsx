'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthLabel } from '@/lib/utils/budget';

interface BudgetMonthSelectorProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

function shiftMonth(monthKey: string, offset: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  const d = new Date(year, month - 1 + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function BudgetMonthSelector({ currentMonth, onMonthChange }: BudgetMonthSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onMonthChange(shiftMonth(currentMonth, -1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-lg font-semibold min-w-[180px] text-center">
        {formatMonthLabel(currentMonth)}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onMonthChange(shiftMonth(currentMonth, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
