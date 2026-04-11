/**
 * Format a number as Indonesian Rupiah currency
 * e.g., 150000 → "Rp 150.000"
 */
export function formatRupiah(value: number, withPrefix: boolean = true): string {
  const formatted = Math.abs(value)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (withPrefix) {
    return `Rp ${formatted}`;
  }
  return formatted;
}

/**
 * Parse a Rupiah string back to number
 * e.g., "150.000" → 150000
 */
export function parseRupiah(value: string): number {
  const digits = value.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/**
 * Format a number as a compact representation
 * e.g., 1500000 → 1,5 Jt
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1).replace('.0', '')} M`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace('.0', '')} Jt`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)} Rb`;
  }
  return value.toString();
}

/**
 * Format quantity with satuan (unit)
 */
export function formatQty(qty: number, satuan: string): string {
  return `${qty.toLocaleString('id-ID')} ${satuan}`;
}
