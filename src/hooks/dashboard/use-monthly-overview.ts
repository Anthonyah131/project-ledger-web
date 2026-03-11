"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toastApiError } from "@/lib/error-utils"
import {
  getDashboardMonthlyPaymentMethods,
  getDashboardMonthlySummary,
  getDashboardMonthlyTopCategories,
  getDashboardMonthlyTrend,
} from "@/services/dashboard-service"
import { getProjects } from "@/services/project-service"
import type {
  DashboardMonthlySummaryResponse,
  DashboardPaymentMethodSplit,
  DashboardTopCategory,
  DashboardTrendDay,
} from "@/types/dashboard"
import type { ProjectResponse } from "@/types/project"

const MONTH_KEY_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/
const ALL_PROJECTS_VALUE = "all"

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

interface UseMonthlyOverviewOptions {
  enabled?: boolean
}

export function useMonthlyOverview({ enabled = true }: UseMonthlyOverviewOptions = {}) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey)
  const [summaryData, setSummaryData] = useState<DashboardMonthlySummaryResponse | null>(null)
  const [trendByDay, setTrendByDay] = useState<DashboardTrendDay[]>([])
  const [topCategories, setTopCategories] = useState<DashboardTopCategory[]>([])
  const [paymentMethodSplit, setPaymentMethodSplit] = useState<DashboardPaymentMethodSplit[]>([])
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState(ALL_PROJECTS_VALUE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  const loadMonth = useCallback(async (month: string, projectId: string) => {
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
      const resolvedProjectId = projectId === ALL_PROJECTS_VALUE ? null : projectId
      const [summaryResult, trendResult, categoriesResult, paymentMethodsResult, projectsResult] = await Promise.allSettled([
        getDashboardMonthlySummary(month, controller.signal),
        getDashboardMonthlyTrend(month, resolvedProjectId, controller.signal),
        getDashboardMonthlyTopCategories(month, resolvedProjectId, controller.signal),
        getDashboardMonthlyPaymentMethods(month, controller.signal),
        getProjects(controller.signal),
      ])

      if (
        (summaryResult.status === "rejected" && isAbortError(summaryResult.reason))
        || (trendResult.status === "rejected" && isAbortError(trendResult.reason))
        || (categoriesResult.status === "rejected" && isAbortError(categoriesResult.reason))
        || (paymentMethodsResult.status === "rejected" && isAbortError(paymentMethodsResult.reason))
        || (projectsResult.status === "rejected" && isAbortError(projectsResult.reason))
      ) {
        return
      }

      if (summaryResult.status === "rejected") throw summaryResult.reason
      if (trendResult.status === "rejected") throw trendResult.reason
      if (categoriesResult.status === "rejected") throw categoriesResult.reason
      if (paymentMethodsResult.status === "rejected") throw paymentMethodsResult.reason

      const summary = summaryResult.value
      const trend = trendResult.value
      const categories = categoriesResult.value
      const paymentMethods = paymentMethodsResult.value
      const availableProjects = projectsResult.status === "fulfilled" ? projectsResult.value : []

      setSummaryData(summary)
      setTrendByDay(trend.trendByDay)
      setTopCategories(categories.topCategories)
      setPaymentMethodSplit(paymentMethods.paymentMethodSplit)
      setProjects(availableProjects)

      if (summary.month !== month) {
        setSelectedMonth(summary.month)
      }

      if (resolvedProjectId && !availableProjects.some((project) => project.id === resolvedProjectId)) {
        setSelectedProjectId(ALL_PROJECTS_VALUE)
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

  const data = useMemo(() => {
    if (!summaryData) return null

    return {
      ...summaryData,
      trendByDay,
      topCategories,
      paymentMethodSplit,
    }
  }, [paymentMethodSplit, summaryData, topCategories, trendByDay])

  const selectedProjectName = useMemo(() => {
    if (selectedProjectId === ALL_PROJECTS_VALUE) return "Todos los proyectos"
    return projects.find((project) => project.id === selectedProjectId)?.name ?? "Proyecto"
  }, [projects, selectedProjectId])

  const goPreviousMonth = useCallback(() => {
    if (!data?.navigation.previousMonth) return
    setSelectedMonth(data.navigation.previousMonth)
  }, [data])

  const goNextMonth = useCallback(() => {
    if (!data?.navigation.hasNextData || !data.navigation.nextMonth) return
    setSelectedMonth(data.navigation.nextMonth)
  }, [data])

  const reload = useCallback(async () => {
    if (!enabled) return
    await loadMonth(selectedMonth, selectedProjectId)
  }, [enabled, loadMonth, selectedMonth, selectedProjectId])

  useEffect(() => {
    if (!enabled) {
      abortRef.current?.abort()
      setLoading(false)
      return
    }

    void loadMonth(selectedMonth, selectedProjectId)
  }, [enabled, loadMonth, selectedMonth, selectedProjectId])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  return {
    selectedMonth,
    data,
    projects,
    selectedProjectId,
    selectedProjectName,
    loading,
    error,
    setSelectedMonth,
    setSelectedProjectId,
    goPreviousMonth,
    goNextMonth,
    reload,
  }
}
