"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toastApiError } from "@/lib/error-utils"
import { getMonthlyOverview } from "@/services/dashboard-service"
import type { MonthlyOverviewResponse } from "@/types/dashboard"

const MONTH_KEY_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/

function getCurrentMonthKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError"
}

function isValidMonthKey(month: string): boolean {
  return MONTH_KEY_REGEX.test(month)
}

export function useMonthlyOverview() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey)
  const [data, setData] = useState<MonthlyOverviewResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  const loadMonth = useCallback(async (month: string) => {
    if (!isValidMonthKey(month)) {
      setError("El formato de mes es invalido. Debe ser YYYY-MM.")
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const overview = await getMonthlyOverview(month, controller.signal)
      setData(overview)
      if (overview.month !== month) {
        setSelectedMonth(overview.month)
      }
    } catch (err) {
      if (isAbortError(err)) return

      const message = toastApiError(err, "Error al cargar dashboard mensual")
      setError(message)
    } finally {
      if (abortRef.current === controller) {
        setLoading(false)
      }
    }
  }, [])

  const goPreviousMonth = useCallback(() => {
    if (!data?.navigation.previousMonth) return
    setSelectedMonth(data.navigation.previousMonth)
  }, [data])

  const goNextMonth = useCallback(() => {
    if (!data?.navigation.hasNextData || !data.navigation.nextMonth) return
    setSelectedMonth(data.navigation.nextMonth)
  }, [data])

  const reload = useCallback(async () => {
    await loadMonth(selectedMonth)
  }, [loadMonth, selectedMonth])

  useEffect(() => {
    void loadMonth(selectedMonth)
  }, [loadMonth, selectedMonth])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  return {
    selectedMonth,
    data,
    loading,
    error,
    setSelectedMonth,
    goPreviousMonth,
    goNextMonth,
    reload,
  }
}
