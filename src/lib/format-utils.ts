// lib/format-utils.ts
// Shared formatting helpers used across list/shelf views.

/**
 * Format an ISO date string using the Spanish locale.
 * Pass `withYear: true` for the long variant (e.g. "25 ene 2025"),
 * or omit / set `false` for the short variant (e.g. "25 ene").
 *
 * `fixTimezone` appends `T00:00:00` to the ISO string to avoid
 * off-by-one-day issues caused by UTC parsing of date-only strings.
 */
export function formatDate(
  iso: string | null,
  opts: { withYear?: boolean; fixTimezone?: boolean; fallback?: string } = {},
): string {
  if (!iso) return opts.fallback ?? "";

  const { withYear = true, fixTimezone = false, fallback = "" } = opts;
  const raw = fixTimezone ? `${iso}T00:00:00` : iso;

  try {
    return new Date(raw).toLocaleDateString("es", {
      day: "numeric",
      month: "short",
      ...(withYear ? { year: "numeric" } : {}),
    });
  } catch {
    return fallback;
  }
}

/**
 * Format a numeric amount as a 2-decimal string in Spanish (e.g. "1.234,56").
 * Returns `fallback` when `amount` is null or undefined.
 */
export function formatAmount(
  amount: number | null | undefined,
  fallback = "Sin límite",
): string {
  if (amount === null || amount === undefined) return fallback;
  return new Intl.NumberFormat("es", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
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
  };
  return symbols[code] || code;
}
