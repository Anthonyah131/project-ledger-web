// services/dashboard-service.ts
// API calls for the user dashboard monthly widgets.

import { api } from "@/lib/api-client"
import type {
  DashboardMonthlyPaymentMethodsResponse,
  DashboardMonthlySummaryResponse,
  DashboardMonthlyTopTransactionsResponse,
  DashboardMonthlyTrendResponse,
  DashboardProjectsPagedResponse,
} from "@/types/dashboard"

function buildDashboardQuery(month: string, projectId: string, extraParams?: Record<string, string | number | undefined>) {
  const query = new URLSearchParams({ month, project_id: projectId })
  query.set("projectId", projectId)
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value !== undefined) {
        query.set(key, String(value))
      }
    }
  }
  return query.toString()
}

export function getDashboardMonthlySummary(
  month: string,
  projectId: string,
  signal?: AbortSignal,
  comparisonMonths?: number,
) {
  const params = comparisonMonths !== undefined ? { comparison_months: comparisonMonths } : undefined
  return api.get<DashboardMonthlySummaryResponse>(`/dashboard/monthly-summary?${buildDashboardQuery(month, projectId, params)}`, {
    signal,
  })
}

export function getDashboardMonthlyTrend(
  month: string,
  projectId: string,
  signal?: AbortSignal,
) {
  return api.get<DashboardMonthlyTrendResponse>(`/dashboard/monthly-daily-trend?${buildDashboardQuery(month, projectId)}`, {
    signal,
  })
}

export function getDashboardMonthlyPaymentMethods(
  month: string,
  projectId: string,
  signal?: AbortSignal,
) {
  return api.get<DashboardMonthlyPaymentMethodsResponse>(`/dashboard/monthly-payment-methods?${buildDashboardQuery(month, projectId)}`, {
    signal,
  })
}

export interface GetDashboardTopTransactionsParams {
  month: string
  projectId: string
  limit?: number
  type?: "all" | "expense" | "income"
  signal?: AbortSignal
}

export function getDashboardMonthlyTopTransactions({
  month,
  projectId,
  limit = 5,
  type = "all",
  signal,
}: GetDashboardTopTransactionsParams) {
  const query = buildDashboardQuery(month, projectId, { limit, type })
  return api.get<DashboardMonthlyTopTransactionsResponse>(`/dashboard/monthly-top-transactions?${query}`, {
    signal,
  })
}

export interface GetDashboardProjectsParams {
  page?: number
  pageSize?: number
  q?: string
  signal?: AbortSignal
}

export function getDashboardProjects({
  page = 1,
  pageSize = 20,
  q = "",
  signal,
}: GetDashboardProjectsParams = {}) {
  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  if (q) {
    qs.set("q", q)
  }
  return api.get<DashboardProjectsPagedResponse>(`/dashboard/projects?${qs}`, {
    signal,
  })
}
