// services/dashboard-service.ts
// API calls for the user dashboard monthly widgets.

import { api } from "@/lib/api-client"
import type {
  DashboardMonthlyPaymentMethodsResponse,
  DashboardMonthlySummaryResponse,
  DashboardMonthlyTopCategoriesResponse,
  DashboardMonthlyTrendResponse,
} from "@/types/dashboard"

function buildDashboardQuery(month: string, projectId?: string | null) {
  const query = new URLSearchParams({ month })

  if (projectId) {
    query.set("projectId", projectId)
  }

  return query.toString()
}

export function getDashboardMonthlySummary(month: string, signal?: AbortSignal) {
  return api.get<DashboardMonthlySummaryResponse>(`/dashboard/monthly-summary?${buildDashboardQuery(month)}`, {
    signal,
  })
}

export function getDashboardMonthlyTrend(
  month: string,
  projectId?: string | null,
  signal?: AbortSignal,
) {
  return api.get<DashboardMonthlyTrendResponse>(`/dashboard/monthly-daily-trend?${buildDashboardQuery(month, projectId)}`, {
    signal,
  })
}

export function getDashboardMonthlyTopCategories(
  month: string,
  projectId?: string | null,
  signal?: AbortSignal,
) {
  return api.get<DashboardMonthlyTopCategoriesResponse>(`/dashboard/monthly-top-categories?${buildDashboardQuery(month, projectId)}`, {
    signal,
  })
}

export function getDashboardMonthlyPaymentMethods(month: string, signal?: AbortSignal) {
  return api.get<DashboardMonthlyPaymentMethodsResponse>(`/dashboard/monthly-payment-methods?${buildDashboardQuery(month)}`, {
    signal,
  })
}
