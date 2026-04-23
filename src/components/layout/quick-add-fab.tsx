'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuickAddStore } from '@/store/quick-add-store';

export function QuickAddFab() {
  const { toggle } = useQuickAddStore();

  return (
    <Button
      onClick={toggle}
      size="icon"
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95 md:bottom-8 md:right-8"
      aria-label="Quick add transaction"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
