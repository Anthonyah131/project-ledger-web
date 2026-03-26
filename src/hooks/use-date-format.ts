"use client"

import { useLanguage } from "@/context/language-context"
import {
  formatDate,
  formatMonthKey,
  formatMonthLabel,
  formatDateLabel,
  type FormatDateOptions,
} from "@/lib/date-utils"

/**
 * Returns locale-aware versions of date formatting utilities,
 * bound to the user's currently selected app language.
 */
export function useDateFormat() {
  const { locale } = useLanguage()

  return {
    formatDate: (iso: string | null, opts: FormatDateOptions = {}) =>
      formatDate(iso, { ...opts, locale }),
    formatMonthKey: (value: string, fallback = "") =>
      formatMonthKey(value, fallback, locale),
    formatMonthLabel: (month: string) =>
      formatMonthLabel(month, locale),
    formatDateLabel: (value: string) =>
      formatDateLabel(value, locale),
  }
}
