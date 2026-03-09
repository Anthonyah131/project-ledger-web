// lib/format-utils.ts
// Shared formatting helpers used across list/shelf views.

/**
 * Format a numeric amount as a 2-decimal string in Spanish (e.g. "1.234,56").
 * Returns `fallback` when `amount` is null or undefined.
 */
export function formatAmount(
  amount: number | null | undefined,
  fallback = "Sin límite",
): string {
  if (amount === null || amount === undefined) return fallback
  return new Intl.NumberFormat("es", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Map a currency ISO code to its symbol.
 */
export function formatCurrencySymbol(code: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "\u20AC",
    CRC: "\u20A1",
    MXN: "$",
    GBP: "\u00A3",
    JPY: "\u00A5",
  }
  return symbols[code] || code
}
