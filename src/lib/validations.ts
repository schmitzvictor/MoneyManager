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

// ============================================================
// RULES
// ============================================================
export const ruleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  field: z.string().default('description'),
  operator: z.enum(['contains', 'equals', 'starts_with']),
  value: z.string().min(1, 'Value is required').max(255),
  category_id: z.string().uuid('Select a category'),
  priority: z.number().default(0),
  is_active: z.boolean().default(true),
});

export type RuleFormValues = z.input<typeof ruleSchema>;

// ============================================================
// BUDGET ITEMS
// ============================================================
export const budgetItemSchema = z.object({
  category_id: z.string().uuid('Select a category'),
  planned_amount: z.number().min(0, 'Amount must be non-negative'),
});

export type BudgetItemFormValues = z.input<typeof budgetItemSchema>;

// ============================================================
// GOALS
// ============================================================
export const goalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  target_amount: z.number().positive('Target must be positive'),
  target_date: z.string().nullable().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type GoalFormValues = z.input<typeof goalSchema>;

export const contributeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
});

export type ContributeFormValues = z.input<typeof contributeSchema>;

// ============================================================
// RECURRING TRANSACTIONS
// ============================================================
export const recurringSchema = z.object({
  account_id: z.string().uuid('Select an account'),
  category_id: z.string().uuid('Select a category').nullable().optional(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().max(255).default(''),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'yearly']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().nullable().optional(),
  auto_create: z.boolean().default(false),
});

export type RecurringFormValues = z.input<typeof recurringSchema>;
