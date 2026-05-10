'use client';

import { Plus } from 'lucide-react';
import { useQuickAddStore } from '@/store/quick-add-store';

export function QuickAddFab() {
  const { toggle } = useQuickAddStore();

  return (
    <button
      onClick={toggle}
      aria-label="Quick add transaction"
      className="fixed bottom-7 right-7 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white transition-transform hover:scale-105 active:scale-95 md:bottom-8 md:right-8"
      style={{
        background: 'linear-gradient(135deg, oklch(0.75 0.18 140), oklch(0.65 0.18 200))',
        boxShadow: '0 6px 28px oklch(0.75 0.18 140 / 0.35), 0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      <Plus className="h-6 w-6" strokeWidth={2.5} />
    </button>
  );
}
