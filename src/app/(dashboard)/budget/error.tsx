'use client';

import { PageError } from '@/components/ui/page-error';

export default function BudgetError({ reset }: { reset: () => void }) {
  return <PageError reset={reset} />;
}
