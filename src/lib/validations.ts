import { z } from 'zod';

// ============================================================
// ACCOUNTS
// ============================================================
export const accountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['checking', 'savings', 'cash', 'credit_card']),
  initial_balance: z.number().default(0),
  color: z.string().optional(),
  icon: z.string().optional(),
  credit_limit: z.number().optional(),
  closing_day: z.number().min(1).max(31).optional(),
  due_day: z.number().min(1).max(31).optional(),
});

export type AccountFormValues = z.input<typeof accountSchema>;

// ============================================================
// CATEGORIES
// ============================================================
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  kind: z.enum(['income', 'expense', 'transfer']),
  parent_id: z.string().uuid().nullable().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  sort_order: z.number().default(0),
});

export type CategoryFormValues = z.input<typeof categorySchema>;

// ============================================================
// TRANSACTIONS
// ============================================================
export const transactionSchema = z.object({
  account_id: z.string().uuid('Select an account'),
  category_id: z.string().uuid('Select a category').nullable().optional(),
  type: z.enum(['income', 'expense', 'transfer']),
  status: z.enum(['posted', 'pending', 'planned']).default('posted'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().max(255).default(''),
  merchant_name: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
  date: z.string().min(1, 'Date is required'),
  transfer_account_id: z.string().uuid().nullable().optional(),
});

export type TransactionFormValues = z.input<typeof transactionSchema>;
