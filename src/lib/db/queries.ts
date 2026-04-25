import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Helper to get an authenticated Supabase client
async function getClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

// ============================================================
// ACCOUNTS
// ============================================================
export async function getAccounts() {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAccount(id: string) {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// ============================================================
// CATEGORIES
// ============================================================
export async function getCategories() {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getCategoriesByKind(kind: 'income' | 'expense' | 'transfer') {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('kind', kind)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

// ============================================================
// TRANSACTIONS
// ============================================================
export interface TransactionFilters {
  search?: string;
  accountId?: string;
  categoryId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export async function getTransactions(filters: TransactionFilters = {}) {
  const supabase = await getClient();
  const { page = 1, pageSize = 50 } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('transactions')
    .select('*, accounts!account_id(name, type, color), categories(name, icon, kind)', { count: 'exact' })
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters.accountId) {
    query = query.eq('account_id', filters.accountId);
  }
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  if (filters.type) {
    query = query.eq('type', filters.type);
  }
  if (filters.startDate) {
    query = query.gte('date', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('date', filters.endDate);
  }
  if (filters.search) {
    query = query.or(
      `description.ilike.%${filters.search}%,merchant_name.ilike.%${filters.search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { data, count };
}

export async function getTransaction(id: string) {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('*, accounts!account_id(name, type, color), categories(name, icon, kind)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getDashboardMetrics() {
  const supabase = await getClient();
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

  // Get total balance from all active accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('current_balance')
    .eq('is_archived', false);

  const totalBalance = accounts?.reduce((sum, a) => sum + Number(a.current_balance), 0) || 0;

  // Get current month income & expenses
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, type')
    .gte('date', firstDay)
    .lte('date', lastDay)
    .in('type', ['income', 'expense'])
    .neq('status', 'planned'); // exclude planned from current actuals

  let monthlyIncome = 0;
  let monthlyExpense = 0;

  transactions?.forEach((tx) => {
    if (tx.type === 'income') monthlyIncome += Number(tx.amount);
    if (tx.type === 'expense') monthlyExpense += Number(tx.amount);
  });

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
  };
}

export async function getMonthlyStats() {
  const supabase = await getClient();
  // Get last 6 months
  const date = new Date();
  date.setMonth(date.getMonth() - 5);
  date.setDate(1);
  const startDate = date.toISOString().split('T')[0];

  const { data } = await supabase
    .from('transactions')
    .select('amount, type, date')
    .gte('date', startDate)
    .in('type', ['income', 'expense'])
    .neq('status', 'planned');

  // Group by YYYY-MM
  const stats: Record<string, { month: string; income: number; expense: number }> = {};
  
  // Pre-fill last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const shortMonth = d.toLocaleString('en-US', { month: 'short' });
    stats[monthStr] = { month: shortMonth, income: 0, expense: 0 };
  }

  data?.forEach((tx) => {
    const monthStr = tx.date.substring(0, 7); // YYYY-MM
    if (stats[monthStr]) {
      if (tx.type === 'income') stats[monthStr].income += Number(tx.amount);
      if (tx.type === 'expense') stats[monthStr].expense += Number(tx.amount);
    }
  });

  return Object.values(stats);
}

export async function getRecentTransactions(limit = 5) {
  const supabase = await getClient();
  const { data } = await supabase
    .from('transactions')
    .select('*, accounts!account_id(name, color), categories(name, icon)')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
    
  return data || [];
}

// ============================================================
// RULES
// ============================================================

export async function getRules() {
  const supabase = await getClient();
  const { data } = await supabase
    .from('rules')
    .select('*, categories(name, color, icon)')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false });

  return data || [];
}
