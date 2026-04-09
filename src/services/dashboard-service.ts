// services/dashboard-service.ts
// API calls for the user dashboard monthly widgets.

import { api } from "@/lib/api-client"
import type {
  DashboardMonthlyPaymentMethodsResponse,
  DashboardMonthlySummaryResponse,
  DashboardMonthlyTopCategoriesResponse,
  DashboardMonthlyTrendResponse,
  DashboardProjectsPagedResponse,
} from "@/types/dashboard"

function buildDashboardQuery(month: string, projectId: string) {
  const query = new URLSearchParams({ month, project_id: projectId })
  // Backward compatibility in case the backend still expects camelCase.
  query.set("projectId", projectId)
  return query.toString()
}

export function getDashboardMonthlySummary(
  month: string,
  projectId: string,
  signal?: AbortSignal,
) {
  return api.get<DashboardMonthlySummaryResponse>(`/dashboard/monthly-summary?${buildDashboardQuery(month, projectId)}`, {
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

export function getDashboardMonthlyTopCategories(
  month: string,
  projectId: string,
  signal?: AbortSignal,
) {
  return api.get<DashboardMonthlyTopCategoriesResponse>(`/dashboard/monthly-top-categories?${buildDashboardQuery(month, projectId)}`, {
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
