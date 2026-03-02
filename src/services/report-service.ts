// services/report-service.ts
// API calls for project report endpoints.
// All endpoints require viewer+ role on the project.

import { api } from "@/lib/api-client";
import type {
  ProjectReportResponse,
  MonthComparisonResponse,
  CategoryGrowthResponse,
  ReportDateRange,
} from "@/types/report";

// ─── Summary report ─────────────────────────────────────────────────────────

/**
 * GET /api/projects/{projectId}/reports/summary
 * Financial summary: total spent, expense count, breakdown by category
 * and by payment method. Supports optional date-range filter.
 */
export function getProjectSummary(
  projectId: string,
  dateRange: ReportDateRange = {}
) {
  const query = new URLSearchParams();
  if (dateRange.from) query.set("from", dateRange.from);
  if (dateRange.to) query.set("to", dateRange.to);

  const qs = query.toString();
  const url = qs
    ? `/projects/${projectId}/reports/summary?${qs}`
    : `/projects/${projectId}/reports/summary`;

  return api.get<ProjectReportResponse>(url);
}

// ─── Month comparison ───────────────────────────────────────────────────────

/**
 * GET /api/projects/{projectId}/reports/month-comparison
 * Compares current month vs previous month spending.
 * Requires the project owner's plan to have canUseAdvancedReports = true.
 */
export function getMonthComparison(projectId: string) {
  return api.get<MonthComparisonResponse>(
    `/projects/${projectId}/reports/month-comparison`
  );
}

// ─── Category growth ────────────────────────────────────────────────────────

/**
 * GET /api/projects/{projectId}/reports/category-growth
 * Identifies categories with the highest spending growth (current vs previous month).
 * Requires the project owner's plan to have canUseAdvancedReports = true.
 * Returns array sorted by largest absolute growth first.
 */
export function getCategoryGrowth(projectId: string) {
  return api.get<CategoryGrowthResponse[]>(
    `/projects/${projectId}/reports/category-growth`
  );
}
