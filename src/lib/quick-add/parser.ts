/**
 * Smart Quick Add — One-line text parser
 *
 * Parses natural-language expense strings into structured transaction fields.
 * Uses deterministic heuristics — no external AI.
 *
 * Supported formats:
 *   "starbucks 18"
 *   "uber 24,50"
 *   "R$ 18,50 ifood"
 *   "spent 42 on groceries"
 *   "paid 65 for internet"
 *   "lunch at restaurant 78"
 */

export interface ParsedTransaction {
  amount: number | null;
  description: string;
  /** Raw text after removing amount and helper words */
  merchant: string;
}

// Helper verb prefixes to strip
const HELPER_VERBS = /^(spent|paid|bought|gastei|paguei|comprei)\s+/i;

// Separator words to strip (between merchant and amount)
const SEPARATORS = /\s+(on|for|at|em|para|no|na|de)\s+/i;

// BRL/generic amount patterns
// Matches: R$18 | R$ 18,50 | 18 | 18.50 | 18,50 | 1.234,56
const AMOUNT_PATTERN =
  /(?:R\$\s?)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)/g;

/**
 * Normalize a BRL-style or US-style amount string to a float.
 * Examples: "18,50" → 18.5 | "1.234,56" → 1234.56 | "18.50" → 18.5
 */
export function parseAmount(raw: string): number | null {
  if (!raw) return null;
  const str = raw.replace(/R\$\s?/, '').trim();

  const hasComma = str.includes(',');
  const hasDot = str.includes('.');

  let normalized: string;

  if (hasComma && hasDot) {
    // Both: determine which is decimal separator
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    if (lastComma > lastDot) {
      // BRL: 1.234,56
      normalized = str.replace(/\./g, '').replace(',', '.');
    } else {
      // US: 1,234.56
      normalized = str.replace(/,/g, '');
    }
  } else if (hasComma) {
    // Only comma: treat as decimal separator (BRL style)
    const parts = str.split(',');
    const decimals = parts[parts.length - 1];
    if (decimals.length === 3 && parts.length === 2) {
      // Ambiguous: "1,000" — treat as US thousand separator
      normalized = str.replace(',', '');
    } else {
      normalized = str.replace(',', '.');
    }
  } else {
    normalized = str;
  }

  const value = parseFloat(normalized);
  return isNaN(value) ? null : value;
}

/**
 * Parse a one-line text entry into structured transaction fields.
 *
 * Priority:
 * 1. Strip helper verbs (spent, paid, etc.)
 * 2. Strip separator words (on, for, at)
 * 3. Extract amount — tries last token first, then first token
 * 4. Remaining text = merchant/description
 */
export function parseQuickAddText(input: string): ParsedTransaction {
  if (!input.trim()) {
    return { amount: null, description: '', merchant: '' };
  }

  let text = input.trim();

  // 1. Strip helper verbs at the start
  text = text.replace(HELPER_VERBS, '');

  // 2. Replace separator words with a single space
  text = text.replace(SEPARATORS, ' ');

  // 3. Extract all numeric tokens
  const matches = [...text.matchAll(AMOUNT_PATTERN)];

  if (matches.length === 0) {
    return { amount: null, description: text.trim(), merchant: text.trim() };
  }

  // Try the last numeric token as the amount
  let amountMatch = matches[matches.length - 1];
  let amount = parseAmount(amountMatch[0]);

  // If last token fails, try first
  if (amount === null && matches.length > 1) {
    amountMatch = matches[0];
    amount = parseAmount(amountMatch[0]);
  }

  // Remove the matched amount token (and surrounding "R$" prefix) from text
  const amountIndex = amountMatch.index ?? 0;
  const fullMatchStr = amountMatch[0];

  // Also strip any "R$" prefix immediately before the amount
  const prefix = text.slice(0, amountIndex);
  const hasRPrefix = /R\$\s?$/.test(prefix);
  const startRemove = hasRPrefix ? prefix.lastIndexOf('R') : amountIndex;
  const endRemove = amountIndex + fullMatchStr.length;

  const merchant = (text.slice(0, startRemove) + text.slice(endRemove))
    .trim()
    .replace(/\s{2,}/g, ' ')
    .trim();

  return {
    amount,
    description: merchant || input.trim(),
    merchant,
  };
}
