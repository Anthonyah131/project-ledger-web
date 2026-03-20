// services/report-service.ts
// API calls for project report endpoints.
// All endpoints require viewer+ role on the project.

import { api } from "@/lib/api-client";
import { downloadBlobReport } from "@/lib/report-download";
import type {
  ProjectReportResponse,
  MonthComparisonResponse,
  CategoryGrowthResponse,
  ReportDateRange,
  ReportFormat,
  ProjectExpenseReportResponse,
  ProjectIncomeReportResponse,
  PartnerBalancesReportResponse,
  PaymentMethodReportResponse,
  WorkspaceReportResponse,
  PartnerGeneralReportResponse,
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
 * Returns the CategoryGrowthResponse envelope (categories[] + metadata).
 */
export function getCategoryGrowth(projectId: string) {
  return api.get<CategoryGrowthResponse>(
    `/projects/${projectId}/reports/category-growth`
  );
}

// ─── Detailed expense report (JSON / Excel / PDF) ───────────────────────────

export interface ExpenseReportParams extends ReportDateRange {
  format?: ReportFormat;
}

/**
 * GET /api/projects/{projectId}/reports/expenses
 *
 * When format=json, returns the parsed JSON response.
 * When format=excel or pdf, triggers a browser download.
 */
export async function getExpenseReport(
  projectId: string,
  params: ExpenseReportParams = {},
): Promise<ProjectExpenseReportResponse | void> {
  const format = params.format ?? "json";

  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  query.set("format", format);

  const path = `/projects/${projectId}/reports/expenses?${query.toString()}`;

  if (format === "json") {
    return api.get<ProjectExpenseReportResponse>(path);
  }

  return downloadBlobReport(path);
}

// ─── Payment method report (user-level, JSON / Excel / PDF) ─────────────────

export interface PaymentMethodReportParams extends ReportDateRange {
  paymentMethodId?: string;
  format?: ReportFormat;
}

/**
 * GET /api/reports/payment-methods
 *
 * When format=json, returns the parsed JSON response.
 * When format=excel or pdf, triggers a browser download.
 */
export async function getPaymentMethodReport(
  params: PaymentMethodReportParams = {},
): Promise<PaymentMethodReportResponse | void> {
  const format = params.format ?? "json";

  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.paymentMethodId) query.set("paymentMethodId", params.paymentMethodId);
  query.set("format", format);

  const path = `/reports/payment-methods?${query.toString()}`;

  if (format === "json") {
    return api.get<PaymentMethodReportResponse>(path);
  }

  return downloadBlobReport(path);
}

// ─── Detailed income report (JSON / Excel / PDF) ────────────────────────────

export interface IncomeReportParams extends ReportDateRange {
  format?: ReportFormat;
}

/**
 * GET /api/projects/{projectId}/reports/incomes
 *
 * When format=json, returns the parsed JSON response.
 * When format=excel or pdf, triggers a browser download.
 */
export async function getIncomeReport(
  projectId: string,
  params: IncomeReportParams = {},
): Promise<ProjectIncomeReportResponse | void> {
  const format = params.format ?? "json";

  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  query.set("format", format);

  const path = `/projects/${projectId}/reports/incomes?${query.toString()}`;

  if (format === "json") {
    return api.get<ProjectIncomeReportResponse>(path);
  }

  return downloadBlobReport(path);
}

// ─── Partner balances report (JSON / Excel / PDF) ───────────────────────────

export interface PartnerBalancesReportParams extends ReportDateRange {
  format?: ReportFormat;
}

/**
 * GET /api/projects/{projectId}/reports/partner-balances
 *
 * When format=json, returns the parsed JSON response.
 * When format=excel or pdf, triggers a browser download.
 */
export async function getPartnerBalancesReport(
  projectId: string,
  params: PartnerBalancesReportParams = {},
): Promise<PartnerBalancesReportResponse | void> {
  const format = params.format ?? "json";

  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  query.set("format", format);

  const path = `/projects/${projectId}/reports/partner-balances?${query.toString()}`;

  if (format === "json") {
    return api.get<PartnerBalancesReportResponse>(path);
  }

  return downloadBlobReport(path);
}

// ─── Partner general report (JSON / Excel) ──────────────────────────────────

export interface PartnerGeneralReportParams extends ReportDateRange {
  format?: "json" | "excel";
}

/**
 * GET /api/partners/{partnerId}/reports/general
 *
 * When format=json, returns the parsed JSON response.
 * When format=excel, triggers a browser download (.xlsx).
 */
export async function getPartnerGeneralReport(
  partnerId: string,
  params: PartnerGeneralReportParams = {},
): Promise<PartnerGeneralReportResponse | void> {
  const format = params.format ?? "json";

  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  query.set("format", format);

  const path = `/partners/${partnerId}/reports/general?${query.toString()}`;

  if (format === "json") {
    return api.get<PartnerGeneralReportResponse>(path);
  }

  return downloadBlobReport(path);
}

// ─── Workspace report (JSON / Excel / PDF) ──────────────────────────────────

export interface WorkspaceReportParams extends ReportDateRange {
  currency?: string;
  format?: ReportFormat;
}

/**
 * GET /api/workspaces/{workspaceId}/reports/summary
 *
 * When format=json, returns the parsed JSON response.
 * When format=excel or pdf, triggers a browser download.
 * Pass `currency` to enable consolidated totals across projects.
 */
export async function getWorkspaceReport(
  workspaceId: string,
  params: WorkspaceReportParams = {},
): Promise<WorkspaceReportResponse | void> {
  const format = params.format ?? "json";

  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.currency) query.set("currency", params.currency);
  query.set("format", format);

  const path = `/workspaces/${workspaceId}/reports/summary?${query.toString()}`;

  if (format === "json") {
    return api.get<WorkspaceReportResponse>(path);
  }

  return downloadBlobReport(path);
}
