'use client';

import { PageError } from '@/components/ui/page-error';

export default function TransactionsError({ reset }: { reset: () => void }) {
  return <PageError reset={reset} />;
}
