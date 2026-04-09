"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toastApiError } from "@/lib/error-utils"
import { ApiClientError } from "@/lib/api-client"
import { useLanguage } from "@/context/language-context"
import {
  getDashboardMonthlyPaymentMethods,
  getDashboardMonthlySummary,
  getDashboardMonthlyTopCategories,
  getDashboardMonthlyTrend,
  getDashboardProjects,
} from "@/services/dashboard-service"
import { getProjectBudget } from "@/services/budget-service"
import type {
  DashboardMonthlySummaryResponse,
  DashboardPaymentMethodSplit,
  DashboardTopCategory,
  DashboardTrendDay,
  DashboardProjectItemDto,
} from "@/types/dashboard"
import type { ProjectBudgetResponse } from "@/types/project-budget"

const MONTH_KEY_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/
const PROJECT_STORAGE_KEY = "project-ledger:last-project-id"

function getCurrentMonthKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

function offsetMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError"
}

function isValidMonthKey(month: string): boolean {
  return MONTH_KEY_REGEX.test(month)
}

function readStoredProjectId(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(PROJECT_STORAGE_KEY) ?? ""
}

function storeProjectId(projectId: string) {
  if (typeof window === "undefined") return
  if (!projectId) return
  localStorage.setItem(PROJECT_STORAGE_KEY, projectId)
}

function normalizeNavigation(raw: unknown): DashboardMonthlySummaryResponse["navigation"] {
  const data = typeof raw === "object" && raw !== null ? raw as Record<string, unknown> : {}
  return {
    previous_month: String(data.previous_month ?? data.previousMonth ?? ""),
    current_month: String(data.current_month ?? data.currentMonth ?? ""),
    next_month: String(data.next_month ?? data.nextMonth ?? ""),
    is_current_month: Boolean(data.is_current_month ?? data.isCurrentMonth ?? false),
    has_previous_data: Boolean(data.has_previous_data ?? data.hasPreviousData ?? false),
    has_next_data: Boolean(data.has_next_data ?? data.hasNextData ?? false),
  }
}

function normalizeSummary(raw: unknown): DashboardMonthlySummaryResponse["summary"] {
  const data = typeof raw === "object" && raw !== null ? raw as Record<string, unknown> : {}
  return {
    total_spent: Number(data.total_spent ?? data.totalSpent ?? 0),
    total_income: Number(data.total_income ?? data.totalIncome ?? 0),
    net_balance: Number(data.net_balance ?? data.netBalance ?? 0),
  }
}

function normalizeComparison(raw: unknown, fallbackMonth: string): DashboardMonthlySummaryResponse["comparison"] {
  const data = typeof raw === "object" && raw !== null ? raw as Record<string, unknown> : {}
  return {
    previous_month: String(data.previous_month ?? data.previousMonth ?? fallbackMonth),
    spent_delta: Number(data.spent_delta ?? data.spentDelta ?? 0),
    spent_delta_percentage: Number(data.spent_delta_percentage ?? data.spentDeltaPercentage ?? 0),
    income_delta: Number(data.income_delta ?? data.incomeDelta ?? 0),
    income_delta_percentage: Number(data.income_delta_percentage ?? data.incomeDeltaPercentage ?? 0),
    net_delta: Number(data.net_delta ?? data.netDelta ?? 0),
  }
}

function normalizeAlert(raw: unknown): DashboardMonthlySummaryResponse["alerts"][number] {
  const data = typeof raw === "object" && raw !== null ? raw as Record<string, unknown> : {}
  const type = (data.type ?? "info") as "warning" | "info"
  return {
    type: type === "warning" ? "warning" : "info",
    code: String(data.code ?? ""),
    message: String(data.message ?? ""),
    project_id: (data.project_id ?? data.projectId ?? null) as string | null,
    payment_method_id: (data.payment_method_id ?? data.paymentMethodId ?? null) as string | null,
    priority: Number(data.priority ?? 0),
    count: Number(data.count ?? 0),
  }
}

function normalizeSummaryResponse(raw: unknown): DashboardMonthlySummaryResponse {
  const data = typeof raw === "object" && raw !== null ? raw as Record<string, unknown> : {}
  const month = String(data.month ?? "")
  const navigation = normalizeNavigation(data.navigation)
  if (!navigation.current_month) {
    navigation.current_month = month
  }
  if (!navigation.previous_month) {
    navigation.previous_month = month
  }
  return {
    month,
    currency_code: String(data.currency_code ?? data.currencyCode ?? ""),
    project_id: String(data.project_id ?? data.projectId ?? ""),
    generated_at: String(data.generated_at ?? data.generatedAt ?? ""),
    navigation,
    summary: normalizeSummary(data.summary),
    comparison: normalizeComparison(data.comparison, month),
    alerts: Array.isArray(data.alerts) ? data.alerts.map(normalizeAlert) : [],
  }
}

function normalizeTrendDay(raw: unknown): DashboardTrendDay {
  const data = typeof raw === "object" && raw !== null ? raw as Record<string, unknown> : {}
  return {
    date: String(data.date ?? ""),
    spent: Number(data.spent ?? 0),
    income: Number(data.income ?? 0),
    net: Number(data.net ?? 0),
    expense_count: Number(data.expense_count ?? data.expenseCount ?? 0),
    income_count: Number(data.income_count ?? data.incomeCount ?? 0),
    project_ids: (data.project_ids ?? data.projectIds ?? []) as string[],
  }
}

function normalizeTrendResponse(raw: unknown) {
  const data = typeof raw === "object" && raw !== null ? raw as Record<string, unknown> : {}
  const items = Array.isArray(data.trend_by_day) ? data.trend_by_day : data.trendByDay
  return {
    month: String(data.month ?? ""),
    currency_code: String(data.currency_code ?? data.currencyCode ?? ""),
    project_id: String(data.project_id ?? data.projectId ?? ""),
    trend_by_day: Array.isArray(items) ? items.map(normalizeTrendDay) : [],
  }
}

function normalizeTopCategory(raw: unknown): DashboardTopCategory {
  const data = typeof raw === "object" && raw !== null ? raw as Record<string, unknown> : {}
  return {
    category_id: String(data.category_id ?? data.categoryId ?? ""),
    category_name: String(data.category_name ?? data.categoryName ?? ""),
    total_amount: Number(data.total_amount ?? data.totalAmount ?? 0),
    expense_count: Number(data.expense_count ?? data.expenseCount ?? 0),
    percentage: Number(data.percentage ?? 0),
    project_ids: (data.project_ids ?? data.projectIds ?? []) as string[],
  }
}

function normalizeTopCategoriesResponse(raw: unknown) {
  const data = typeof raw === "object" && raw !== null ? raw as Record<string, unknown> : {}
  const items = Array.isArray(data.top_categories) ? data.top_categories : data.topCategories
  return {
    month: String(data.month ?? ""),
    currency_code: String(data.currency_code ?? data.currencyCode ?? ""),
    project_id: String(data.project_id ?? data.projectId ?? ""),
    top_categories: Array.isArray(items) ? items.map(normalizeTopCategory) : [],
  }
}

function normalizePaymentMethodSplit(raw: unknown): DashboardPaymentMethodSplit {
  const data = typeof raw === "object" && raw !== null ? raw as Record<string, unknown> : {}
  return {
    payment_method_id: String(data.payment_method_id ?? data.paymentMethodId ?? ""),
    payment_method_name: String(data.payment_method_name ?? data.paymentMethodName ?? ""),
    total_amount: Number(data.total_amount ?? data.totalAmount ?? 0),
    expense_count: Number(data.expense_count ?? data.expenseCount ?? 0),
    percentage: Number(data.percentage ?? 0),
  }
}

function normalizePaymentMethodsResponse(raw: unknown) {
  const data = typeof raw === "object" && raw !== null ? raw as Record<string, unknown> : {}
  const items = Array.isArray(data.payment_method_split) ? data.payment_method_split : data.paymentMethodSplit
  return {
    month: String(data.month ?? ""),
    currency_code: String(data.currency_code ?? data.currencyCode ?? ""),
    project_id: String(data.project_id ?? data.projectId ?? ""),
    payment_method_split: Array.isArray(items) ? items.map(normalizePaymentMethodSplit) : [],
  }
}

interface UseMonthlyOverviewOptions {
  enabled?: boolean
}

export function useMonthlyOverview({ enabled = true }: UseMonthlyOverviewOptions = {}) {
  const { t } = useLanguage()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey)
  const [summaryData, setSummaryData] = useState<DashboardMonthlySummaryResponse | null>(null)
  const [trendByDay, setTrendByDay] = useState<DashboardTrendDay[]>([])
  const [topCategories, setTopCategories] = useState<DashboardTopCategory[]>([])
  const [paymentMethodSplit, setPaymentMethodSplit] = useState<DashboardPaymentMethodSplit[]>([])
  const [projects, setProjects] = useState<DashboardProjectItemDto[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState(() => readStoredProjectId())
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [projectsPage, setProjectsPage] = useState(1)
  const [projectsHasNextPage, setProjectsHasNextPage] = useState(false)
  const [projectsLoadMoreLoading, setProjectsLoadMoreLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [budget, setBudget] = useState<ProjectBudgetResponse | null>(null)
  const [budgetLoading, setBudgetLoading] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const projectsFetchingIdRef = useRef(0)

  const loadMonth = useCallback(async (month: string, projectId: string) => {
    if (!isValidMonthKey(month)) {
      setError(t("dashboard.errors.invalidMonthFormat"))
      return
    }

    if (!projectId) {
      setError(t("dashboard.errors.noProjectSelected"))
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const [summaryResult, trendResult, categoriesResult, paymentMethodsResult] = await Promise.allSettled([
        getDashboardMonthlySummary(month, projectId, controller.signal),
        getDashboardMonthlyTrend(month, projectId, controller.signal),
        getDashboardMonthlyTopCategories(month, projectId, controller.signal),
        getDashboardMonthlyPaymentMethods(month, projectId, controller.signal),
      ])

      if (
        (summaryResult.status === "rejected" && isAbortError(summaryResult.reason))
        || (trendResult.status === "rejected" && isAbortError(trendResult.reason))
        || (categoriesResult.status === "rejected" && isAbortError(categoriesResult.reason))
        || (paymentMethodsResult.status === "rejected" && isAbortError(paymentMethodsResult.reason))
      ) {
        return
      }

      if (summaryResult.status === "rejected") throw summaryResult.reason
      if (trendResult.status === "rejected") throw trendResult.reason
      if (categoriesResult.status === "rejected") throw categoriesResult.reason
      if (paymentMethodsResult.status === "rejected") throw paymentMethodsResult.reason

      const summary = normalizeSummaryResponse(summaryResult.value)
      const trend = normalizeTrendResponse(trendResult.value)
      const categories = normalizeTopCategoriesResponse(categoriesResult.value)
      const paymentMethods = normalizePaymentMethodsResponse(paymentMethodsResult.value)

      setSummaryData(summary)
      setTrendByDay(trend.trend_by_day)
      setTopCategories(categories.top_categories)
      setPaymentMethodSplit(paymentMethods.payment_method_split)

      // Do not override selectedMonth with the API response's month —
      // that would fight against the user's navigation intent.
    } catch (err) {
      if (isAbortError(err)) return

      const message = toastApiError(err, t("dashboard.errors.loadMonthly"))
      setError(message)
    } finally {
      if (abortRef.current === controller) {
        setLoading(false)
      }
    }
  }, [t])

  const loadProjects = useCallback(async (pageToLoad = 1) => {
    if (!enabled) return

    const fetchId = ++projectsFetchingIdRef.current

    try {
      if (pageToLoad === 1) {
        setProjectsLoading(true)
      } else {
        setProjectsLoadMoreLoading(true)
      }

      const response = await getDashboardProjects({ page: pageToLoad, pageSize: 20 })

      if (fetchId !== projectsFetchingIdRef.current) return

      const newPinned = pageToLoad === 1 ? (response.pinned ?? []) : []
      const newItems = response.items ?? []
      const data = [...newPinned, ...newItems]

      setProjects((prev) => {
        if (pageToLoad === 1) return data
        return [...prev, ...newItems]
      })

      setProjectsPage(pageToLoad)
      setProjectsHasNextPage(response.hasNextPage)

      // Initialize selected project only on page 1 load
      if (pageToLoad === 1) {
        const availableIds = new Set(data.map((project) => project.id))
        const storedId = readStoredProjectId()

        setSelectedProjectId((current) => {
          const resolved = current && availableIds.has(current)
            ? current
            : storedId && availableIds.has(storedId)
              ? storedId
              : data[0]?.id ?? ""
          if (resolved) {
            storeProjectId(resolved)
          }
          return resolved
        })
      }
    } catch (err) {
      if (fetchId === projectsFetchingIdRef.current && pageToLoad === 1) {
        toastApiError(err, t("dashboard.errors.loadProjects"))
      }
    } finally {
      if (fetchId === projectsFetchingIdRef.current) {
        if (pageToLoad === 1) {
          setProjectsLoading(false)
        } else {
          setProjectsLoadMoreLoading(false)
        }
      }
    }
  }, [enabled, t])

  const loadMoreProjects = useCallback(() => {
    if (projectsLoading || projectsLoadMoreLoading || !projectsHasNextPage) return
    void loadProjects(projectsPage + 1)
  }, [projectsLoading, projectsLoadMoreLoading, projectsHasNextPage, projectsPage, loadProjects])

  const data = useMemo(() => {
    if (!summaryData) return null

    return {
      ...summaryData,
      trend_by_day: trendByDay,
      top_categories: topCategories,
      payment_method_split: paymentMethodSplit,
    }
  }, [paymentMethodSplit, summaryData, topCategories, trendByDay])

  const selectedProjectName = useMemo(() => {
    if (!selectedProjectId) return t("dashboard.defaultProjectName")
    return projects.find((project) => project.id === selectedProjectId)?.name ?? t("dashboard.defaultProjectName")
  }, [projects, selectedProjectId, t])

  const currentMonthKey = getCurrentMonthKey()

  const canGoPrevious = !loading

  const canGoNext = !loading && selectedMonth < currentMonthKey

  const goPreviousMonth = useCallback(() => {
    setSelectedMonth((prev) => offsetMonth(prev, -1))
  }, [])

  const goNextMonth = useCallback(() => {
    setSelectedMonth((prev) => {
      const next = offsetMonth(prev, 1)
      // Never go past the current month
      return next <= currentMonthKey ? next : prev
    })
  }, [currentMonthKey])

  const reload = useCallback(async () => {
    if (!enabled) return
    if (!selectedProjectId) return
    await loadMonth(selectedMonth, selectedProjectId)
  }, [enabled, loadMonth, selectedMonth, selectedProjectId])

  useEffect(() => {
    if (!enabled) {
      abortRef.current?.abort()
      setLoading(false)
      return
    }

    void loadProjects()
  }, [enabled, loadProjects])

  useEffect(() => {
    if (!enabled) {
      abortRef.current?.abort()
      setLoading(false)
      return
    }

    if (!selectedProjectId) {
      setSummaryData(null)
      setTrendByDay([])
      setTopCategories([])
      setPaymentMethodSplit([])
      setError(null)
      return
    }

    void loadMonth(selectedMonth, selectedProjectId)
  }, [enabled, loadMonth, selectedMonth, selectedProjectId])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  // ─── Budget: fetch reactively when selectedProjectId changes ────────────
  useEffect(() => {
    if (!enabled || !selectedProjectId) {
      setBudget(null)
      return
    }

    let cancelled = false
    setBudgetLoading(true)

    getProjectBudget(selectedProjectId)
      .then((data) => {
        if (!cancelled) setBudget(data)
      })
      .catch((err) => {
        if (cancelled) return
        // 404 means no budget configured — treat as null, not an error
        if (err instanceof ApiClientError && err.status === 404) {
          setBudget(null)
        }
        // silently ignore other errors (dashboard shouldn't block on budget)
      })
      .finally(() => {
        if (!cancelled) setBudgetLoading(false)
      })

    return () => { cancelled = true }
  }, [enabled, selectedProjectId])

  const handleSelectProjectId = useCallback((value: string) => {
    setSelectedProjectId(value)
    if (value) {
      storeProjectId(value)
    }
  }, [])

  return {
    selectedMonth,
    data,
    projects,
    selectedProjectId,
    selectedProjectName,
    projectsLoading,
    projectsLoadMoreLoading,
    projectsHasNextPage,
    loading,
    error,
    budget,
    budgetLoading,
    canGoPrevious,
    canGoNext,
    setSelectedMonth,
    setSelectedProjectId: handleSelectProjectId,
    loadMoreProjects,
    goPreviousMonth,
    goNextMonth,
    reload,
  }
}
