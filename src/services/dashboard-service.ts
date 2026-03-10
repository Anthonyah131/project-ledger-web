// services/dashboard-service.ts
// API calls for monthly dashboard overview.

import { api } from "@/lib/api-client"
import type { MonthlyOverviewResponse } from "@/types/dashboard"

export function getMonthlyOverview(month: string, signal?: AbortSignal) {
  const query = new URLSearchParams({ month })
  return api.get<MonthlyOverviewResponse>(`/dashboard/monthly-overview?${query.toString()}`, {
    signal,
  })
}
