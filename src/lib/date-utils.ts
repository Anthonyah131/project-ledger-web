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

export interface FormatDateLocaleOptions extends FormatDateOptions {
  locale?: string
}

/**
 * Format an ISO date string using the given locale (default: "es").
 * Pass `withYear: true` for the long variant (e.g. "25 ene 2025"),
 * or omit / set `false` for the short variant (e.g. "25 ene").
 *
 * Date-only strings (YYYY-MM-DD) are always parsed as local midnight to avoid
 * off-by-one-day shifts caused by UTC date parsing. Full timestamps use new Date().
 */
export function formatDate(
  iso: string | null,
  opts: FormatDateLocaleOptions = {},
): string {
  if (!iso) return opts.fallback ?? ""

  const { withYear = true, dayStyle = "numeric", fallback = "", locale } = opts
  // Auto-detect date-only strings and always parse as local midnight (no UTC shift).
  const parsedDate = ISO_DATE_REGEX.test(iso) ? parseIsoDate(iso) : new Date(iso)
  if (!parsedDate || Number.isNaN(parsedDate.getTime())) return fallback

  try {
    return parsedDate.toLocaleDateString(locale, {
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

/** Formats YYYY-MM as "Mes YYYY" in the given locale. */
export function formatMonthKey(value: string, fallback = "", locale?: string): string {
  const parsedDate = parseMonthKey(value)
  if (!parsedDate) return fallback || value

  try {
    const label = parsedDate.toLocaleDateString(locale, {
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

type TFn = (key: string, params?: Record<string, string | number>) => string

export function getDateRangeError(from: string, to: string, t?: TFn): string | null {
  if (!from || !to) return null
  if (!isValidDateRange(from, to)) {
    return t ? t("common.errors.invalidDateRange") : "La fecha 'Desde' no puede ser mayor que 'Hasta'."
  }
  return null
}

export function isDateAfterToday(value: string): boolean {
  if (!isIsoDateString(value)) return false
  return value > getTodayIsoDate()
}

export function formatMonthLabel(month: string, locale?: string): string {
  return formatMonthKey(month, month, locale)
}

export function formatDateLabel(value: string, locale?: string): string {
  return formatDate(value, {
    withYear: false,
    dayStyle: "2-digit",
    fallback: value,
    locale,
  })
}

/** Returns current month as YYYY-MM. */
export function getCurrentMonthKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

/** Add/subtract months from a month key (YYYY-MM). Returns new YYYY-MM. */
export function addMonths(monthKey: string, delta: number): string {
  const parsed = parseMonthKey(monthKey)
  if (!parsed) return monthKey

  const newDate = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth() + delta, 1))
  const year = newDate.getUTCFullYear()
  const month = String(newDate.getUTCMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

/** Returns first and last day of month as YYYY-MM-DD. */
export function getMonthBounds(monthKey: string): { from: string; to: string } {
  const parsed = parseMonthKey(monthKey)
  if (!parsed) return { from: "", to: "" }

  const year = parsed.getUTCFullYear()
  const month = parsed.getUTCMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const formatYmd = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }

  return {
    from: formatYmd(firstDay),
    to: formatYmd(lastDay),
  }
}

/** Format month key (YYYY-MM) as "Mes YYYY" long format. */
export function formatMonthLong(monthKey: string, locale?: string): string {
  return formatMonthKey(monthKey, monthKey, locale)
}

/** Get names of weekdays (short) in given locale. Mon-Sun. */
export function getWeekdayNamesShort(locale?: string): string[] {
  const baseDate = new Date(Date.UTC(2024, 0, 1)) // Monday, Jan 1, 2024
  const names: string[] = []

  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.UTC(2024, 0, 1 + i))
    try {
      const name = d.toLocaleDateString(locale, {
        weekday: "short",
        timeZone: "UTC",
      })
      names.push(name)
    } catch {
      names.push(String(i + 1))
    }
  }

  return names
}

/** Generate 42 dates (6 weeks × 7 days) covering month, starting on Monday. Returns YYYY-MM-DD. */
export function getMonthGrid(monthKey: string): string[] {
  const parsed = parseMonthKey(monthKey)
  if (!parsed) return []

  const year = parsed.getUTCFullYear()
  const month = parsed.getUTCMonth()
  const firstDay = new Date(year, month, 1)
  const weekday = firstDay.getDay() // 0=Sun, 1=Mon, etc
  const startOffset = weekday === 0 ? 6 : weekday - 1 // Adjust to Mon=0

  const grid: string[] = []
  const date = new Date(year, month, 1)
  date.setDate(date.getDate() - startOffset)

  for (let i = 0; i < 42; i++) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    grid.push(`${y}-${m}-${d}`)
    date.setDate(date.getDate() + 1)
  }

  return grid
}
