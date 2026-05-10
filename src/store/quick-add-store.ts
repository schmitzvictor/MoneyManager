/**
 * Zustand store for Smart Quick Add
 *
 * Manages modal open/close state AND the parsed Quick Add text state,
 * including last-used account memory and pre-filled values from parser.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ParsedTransaction } from '@/lib/quick-add/parser';

interface QuickAddPreFill {
  /** Pre-parsed amount from text parser */
  amount?: number | null;
  /** Pre-filled description/merchant */
  description?: string;
  /** Suggested category ID */
  categoryId?: string | null;
  /** Suggested account ID */
  accountId?: string | null;
}

interface QuickAddState {
  // ── Modal state ────────────────────────────────────────────────────────────
  isOpen: boolean;
  open: (prefill?: QuickAddPreFill) => void;
  close: () => void;
  toggle: () => void;

  // ── Pre-fill state (from parser or "repeat last") ─────────────────────────
  prefill: QuickAddPreFill;
  setPrefill: (prefill: QuickAddPreFill) => void;
  clearPrefill: () => void;

  // ── Memory: last used account (persisted to localStorage) ─────────────────
  lastAccountId: string | null;
  setLastAccountId: (id: string) => void;

  // ── Parser helpers ─────────────────────────────────────────────────────────
  /** Apply a parsed transaction as the current prefill */
  applyParsed: (parsed: ParsedTransaction, extra?: { categoryId?: string | null; accountId?: string | null }) => void;
}

export const useQuickAddStore = create<QuickAddState>()(
  persist(
    (set, get) => ({
      // Modal state
      isOpen: false,
      open: (prefill = {}) =>
        set({ isOpen: true, prefill: { ...get().prefill, ...prefill } }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),

      // Pre-fill state
      prefill: {},
      setPrefill: (prefill) => set({ prefill }),
      clearPrefill: () => set({ prefill: {} }),

      // Last account memory
      lastAccountId: null,
      setLastAccountId: (id) => set({ lastAccountId: id }),

      // Apply parsed result
      applyParsed: (parsed, extra = {}) =>
        set({
          isOpen: true,
          prefill: {
            amount: parsed.amount,
            description: parsed.merchant || parsed.description,
            categoryId: extra.categoryId ?? null,
            accountId: extra.accountId ?? get().lastAccountId,
          },
        }),
    }),
    {
      name: 'quick-add-store',
      // Only persist last-used account across sessions; never persist open state
      partialize: (state) => ({ lastAccountId: state.lastAccountId }),
    }
  )
);
