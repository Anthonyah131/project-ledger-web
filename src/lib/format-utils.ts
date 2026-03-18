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

// Cache formatters per currency to avoid reconstructing Intl.NumberFormat on every call.
const currencyFormatters = new Map<string, Intl.NumberFormat>()

/**
 * Format a numeric amount with currency symbol using the runtime locale.
 * Works correctly for any ISO currency (USD, EUR, CRC, MXN, …).
 */
export function formatCurrencyAmount(amount: number, currency: string): string {
  let formatter = currencyFormatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    currencyFormatters.set(currency, formatter)
  }
  return formatter.format(amount)
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