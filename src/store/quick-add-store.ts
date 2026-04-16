// Zustand store for Smart Quick Add modal
// Will be implemented in Phase 12

import { create } from 'zustand';

interface QuickAddState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useQuickAddStore = create<QuickAddState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
