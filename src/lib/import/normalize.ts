import { normalizeMerchantName } from '@/lib/utils/hashes';

/**
 * Normalizes an amount string to a valid float.
 * Handles BRL formats (e.g., "1.234,56") and standard formats (e.g., "1234.56").
 */
export function normalizeAmount(amountStr: string | number | undefined | null): number {
  if (!amountStr) return 0;
  if (typeof amountStr === 'number') return amountStr;

  const cleanStr = amountStr.toString().trim();
  
  const hasComma = cleanStr.includes(',');
  const hasDot = cleanStr.includes('.');

  if (hasComma && hasDot) {
    const lastCommaIndex = cleanStr.lastIndexOf(',');
    const lastDotIndex = cleanStr.lastIndexOf('.');
    
    if (lastCommaIndex > lastDotIndex) {
      // BRL format: 1.234,56
      let noDots = cleanStr.replace(/\./g, '');
      noDots = noDots.replace(/,/g, '.');
      return parseFloat(noDots) || 0;
    } else {
      // US format: 1,234.56
      const noCommas = cleanStr.replace(/,/g, '');
      return parseFloat(noCommas) || 0;
    }
  } else if (hasComma && !hasDot) {
    // If it has only comma, it could be BRL decimal "12,34" or US thousands "1,234"
    // Usually, 2 decimal places mean decimal. Let's check characters after last comma
    const parts = cleanStr.split(',');
    const lastPart = parts[parts.length - 1];
    if (lastPart.length !== 3) {
      // Safe to assume it's a decimal (e.g. 12,34 or 12,3)
      return parseFloat(cleanStr.replace(/,/g, '.')) || 0;
    }
    // If exactly 3 digits after comma, it's ambiguous. But for money, US thousands without decimal is less common than BRL decimals?
    // Actually, "1,000" is US thousand. "1,00" is BRL.
    // If length == 3, assume US thousands.
    return parseFloat(cleanStr.replace(/,/g, '')) || 0;
  }

  // Standard US format without commas or just integers
  const numeric = cleanStr.replace(/[^\d.-]/g, '');
  return parseFloat(numeric) || 0;
}

/**
 * Normalizes a date string to YYYY-MM-DD format.
 * Handles DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD, YYYY-MM-DD.
 */
export function normalizeDate(dateStr: string | undefined | null): string | null {
  if (!dateStr) return null;
  const str = dateStr.trim();

  // YYYY-MM-DD or YYYY/MM/DD
  const yyyyMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (yyyyMatch) {
    const [, y, m, d] = yyyyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const ddMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (ddMatch) {
    const [, d, m, y] = ddMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // If it's a valid Date string but not matching above, fallback to JS parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
}

/**
 * Normalizes description
 */
export function normalizeDescription(desc: string | undefined | null): string {
  if (!desc) return '';
  return desc.trim();
}

/**
 * Normalizes description for duplicate detection
 */
export function generateImportHash(account_id: string, date: string, amount: number, description: string): string {
  const normDesc = normalizeMerchantName(description);
  // Ensure consistent 2 decimal places for amount
  const amountStr = amount.toFixed(2);
  const raw = `${account_id}|${date}|${amountStr}|${normDesc}`;
  
  // We don't have crypto.subtle in some client environments synchronously,
  // so we'll just use a simple string hash for UI-side deduplication, 
  // or use the server side hashing later.
  return raw;
}
