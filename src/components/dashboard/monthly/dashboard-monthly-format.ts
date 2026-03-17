import { formatAmount } from "@/lib/format-utils"
import { formatDate, formatMonthKey, isIsoDateString } from "@/lib/date-utils"

export function formatMonthLabel(month: string): string {
  return formatMonthKey(month, month)
}

export function formatDateLabel(value: string): string {
  return formatDate(value, {
    withYear: false,
    dayStyle: "2-digit",
    fixTimezone: isIsoDateString(value),
    fallback: value,
  })
}

export function formatCurrency(value: number, currencyCode: string): string {
  if (!currencyCode) {
    return formatAmount(value, "0.00")
  }
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatSignedCurrency(value: number, currencyCode: string): string {
  const formatted = formatCurrency(Math.abs(value), currencyCode)
  if (value === 0) return formatted
  return `${value > 0 ? "+" : "-"}${formatted}`
}

export function formatSignedPercent(value: number): string {
  const absValue = Math.abs(value)
  return `${value > 0 ? "+" : value < 0 ? "-" : ""}${formatAmount(absValue)}%`
}

export function formatPercent(value: number): string {
  return `${formatAmount(value, "0.00")}%`
}

export function formatCompactCurrency(value: number, currencyCode: string): string {
  if (!currencyCode) {
    return formatAmount(value, "0.00")
  }
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: currencyCode,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}
