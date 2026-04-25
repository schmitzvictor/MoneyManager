import Papa from 'papaparse';
import { normalizeAmount, normalizeDate, normalizeDescription } from './normalize';

export interface ParsedTransaction {
  id: string; // Temporary UI id
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'posted' | 'pending';
  raw: any; // Raw parsed row for debugging
}

export function parseCSV(file: File): Promise<ParsedTransaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const transactions = processCSVRows(results.data);
          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processCSVRows(rows: any[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  rows.forEach((row, index) => {
    // Attempt to guess columns dynamically.
    // Common date columns: Date, Data, Transaction Date
    // Common desc columns: Description, Descrição, Memo, Payee
    // Common amount columns: Amount, Valor, Debit/Credit
    
    const keys = Object.keys(row);
    const getVal = (possibleKeys: string[]) => {
      const key = keys.find((k) => 
        possibleKeys.some(pk => k.toLowerCase().includes(pk))
      );
      return key ? row[key] : null;
    };

    const rawDate = getVal(['date', 'data', 'posted']);
    const rawDesc = getVal(['description', 'descri', 'memo', 'payee', 'title']);
    
    // Amount can be in one column or split into debit/credit
    let rawAmount = getVal(['amount', 'valor', 'value']);
    let isExpense = true;

    if (!rawAmount) {
      const debit = getVal(['debit', 'débito', 'saída', 'out']);
      const credit = getVal(['credit', 'crédito', 'entrada', 'in']);
      
      if (debit) {
        rawAmount = debit;
        isExpense = true;
      } else if (credit) {
        rawAmount = credit;
        isExpense = false;
      }
    }

    if (!rawDate && !rawAmount && !rawDesc) return; // Skip completely empty recognized rows

    const date = normalizeDate(rawDate);
    const description = normalizeDescription(rawDesc);
    let amount = normalizeAmount(rawAmount);

    if (amount === 0) return; // Skip 0 amount transactions

    // Auto-detect type based on amount sign if not explicitly parsed as credit
    if (amount < 0) {
      isExpense = true;
      amount = Math.abs(amount);
    } else if (amount > 0 && !isExpense) {
      isExpense = false;
    } else if (amount > 0 && getVal(['amount', 'valor'])) {
      // In many CSVs (like Nubank), positive amount means expense, but negative can also mean expense.
      // Usually, income is explicitly marked or we assume positive is income unless it's a credit card.
      // We will assume standard: positive = income, negative = expense, UNLESS we can't tell.
      // But actually, for bank accounts, + is income, - is expense.
      // Let's standardise: if we found an 'amount' column, positive is income, negative is expense.
      isExpense = false;
    }

    if (date) {
      transactions.push({
        id: `csv-${index}-${Date.now()}`,
        date,
        description: description || 'Imported Transaction',
        amount,
        type: isExpense ? 'expense' : 'income',
        status: 'posted',
        raw: row,
      });
    }
  });

  return transactions;
}
