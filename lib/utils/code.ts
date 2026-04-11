/**
 * Auto-generate a unique item code
 * Format: BRG-YYYYMMDD-XXXX (4 random alphanumeric chars)
 */
export function generateItemCode(): string {
  const now = new Date();
  const ymd = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BRG-${ymd}-${random}`;
}

/**
 * Auto-generate a transaction reference number
 * Format: TRX-IN-YYYYMMDD-XXXX or TRX-OUT-YYYYMMDD-XXXX
 */
export function generateTrxCode(type: 'IN' | 'OUT'): string {
  const now = new Date();
  const ymd = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TRX-${type}-${ymd}-${random}`;
}

/**
 * Slugify a string to create safe identifiers
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
