/**
 * Generate a normalized hash for duplicate detection during imports.
 * Hash is based on: account + date + amount + normalized description
 */
export function generateTransactionHash(
  accountId: string,
  date: string,
  amount: number,
  description: string
): string {
  const normalizedDescription = description
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

  const raw = `${accountId}|${date}|${amount.toFixed(2)}|${normalizedDescription}`;

  // Simple hash function (FNV-1a inspired)
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }

  return hash.toString(16).padStart(8, '0');
}

/**
 * Normalize a merchant name for matching.
 */
export function normalizeMerchantName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}
