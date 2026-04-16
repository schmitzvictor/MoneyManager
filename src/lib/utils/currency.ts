/**
 * Format a number as BRL currency.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Parse a currency string (BRL-style) to a number.
 * Handles: 18 | 18,50 | 18.50 | R$18 | R$ 18,50
 */
export function parseCurrency(input: string): number | null {
  // Remove R$ prefix and whitespace
  let cleaned = input.replace(/R\$\s*/g, '').trim();

  // If it has both . and , decide which is the decimal separator
  if (cleaned.includes('.') && cleaned.includes(',')) {
    // BRL style: 1.234,56
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    // Comma as decimal: 18,50
    cleaned = cleaned.replace(',', '.');
  }

  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
}

/**
 * Format a number as a compact percentage.
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}
