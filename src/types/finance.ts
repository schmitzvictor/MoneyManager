// Frontend-specific domain types for the Money Manager app
// Database types will be auto-generated via `supabase gen types typescript`

export type AccountType = 'checking' | 'savings' | 'cash' | 'credit_card';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type TransactionStatus = 'posted' | 'pending' | 'planned';

export type TransactionSource = 'manual' | 'csv' | 'ofx' | 'recurring';

export type CategoryKind = 'income' | 'expense' | 'transfer';

export type RecurringFrequency = 'weekly' | 'monthly' | 'yearly';

export type RuleOperator = 'contains' | 'equals' | 'starts_with';

export type BudgetStatus = 'safe' | 'near_limit' | 'over_limit';

export interface CurrencyAmount {
  value: number;
  formatted: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface FilterParams {
  search?: string;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  dateRange?: DateRange;
}
