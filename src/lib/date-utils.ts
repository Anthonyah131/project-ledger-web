const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const MONTH_KEY_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/

export interface FormatDateOptions {
  withYear?: boolean
  /** @deprecated Date-only strings (YYYY-MM-DD) are now always parsed as local midnight automatically. */
  fixTimezone?: boolean
  dayStyle?: "numeric" | "2-digit"
  fallback?: string
}

/** Returns today's date in local time as YYYY-MM-DD. */
export function getTodayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** Parses an ISO date-only string (YYYY-MM-DD) as local midnight. */
function parseIsoDate(value: string): Date | null {
  if (!ISO_DATE_REGEX.test(value)) return null

  const [yearStr, monthStr, dayStr] = value.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null
  }

  const parsed = new Date(year, month - 1, day)
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null
  }

  return parsed
}

/** Parses a month key (YYYY-MM) as UTC first day of month. */
function parseMonthKey(value: string): Date | null {
  if (!MONTH_KEY_REGEX.test(value)) return null

  const [yearStr, monthStr] = value.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr)
  if (!Number.isInteger(year) || !Number.isInteger(month)) return null

  const parsed = new Date(Date.UTC(year, month - 1, 1))
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1
  ) {
    return null
  }

  return parsed
}

/**
 * Format an ISO date string using the Spanish locale.
 * Pass `withYear: true` for the long variant (e.g. "25 ene 2025"),
 * or omit / set `false` for the short variant (e.g. "25 ene").
 *
 * Date-only strings (YYYY-MM-DD) are always parsed as local midnight to avoid
 * off-by-one-day shifts caused by UTC date parsing. Full timestamps use new Date().
 */
export function formatDate(
  iso: string | null,
  opts: FormatDateOptions = {},
): string {
  if (!iso) return opts.fallback ?? ""

  const { withYear = true, dayStyle = "numeric", fallback = "" } = opts
  // Auto-detect date-only strings and always parse as local midnight (no UTC shift).
  const parsedDate = ISO_DATE_REGEX.test(iso) ? parseIsoDate(iso) : new Date(iso)
  if (!parsedDate || Number.isNaN(parsedDate.getTime())) return fallback

  try {
    return parsedDate.toLocaleDateString("es", {
      day: dayStyle,
      month: "short",
      ...(withYear ? { year: "numeric" } : {}),
    })
  } catch {
    return fallback
  }
}

export function isMonthKeyString(value: string): boolean {
  return parseMonthKey(value) !== null
}

/** Formats YYYY-MM as "Mes YYYY" in Spanish locale. */
export function formatMonthKey(value: string, fallback = ""): string {
  const parsedDate = parseMonthKey(value)
  if (!parsedDate) return fallback || value

  try {
    const label = parsedDate.toLocaleDateString("es", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })

    return label.charAt(0).toUpperCase() + label.slice(1)
  } catch {
    return fallback || value
  }
}

export function isIsoDateString(value: string): boolean {
  return parseIsoDate(value) !== null
}

/** Validates that a date range has chronological order when both are present. */
function isValidDateRange(from: string, to: string): boolean {
  if (!from || !to) return true

  const fromDate = parseIsoDate(from)
  const toDate = parseIsoDate(to)
  if (!fromDate || !toDate) return false

  return fromDate.getTime() <= toDate.getTime()
}

export function getDateRangeError(from: string, to: string): string | null {
  if (!from || !to) return null
  if (!isValidDateRange(from, to)) {
    return "La fecha 'Desde' no puede ser mayor que 'Hasta'."
  }
  return null
}

export function isDateAfterToday(value: string): boolean {
  if (!isIsoDateString(value)) return false
  return value > getTodayIsoDate()
}
