// types/report.ts
// Report model type definitions — API response shapes for project reports

// ─── Summary report ──────────────────────────────────────────────────────────

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  expenseCount: number;
  /** Percentage of total project spend */
  percentage: number;
}

export interface PaymentMethodBreakdown {
  paymentMethodId: string;
  paymentMethodName: string;
  totalAmount: number;
  expenseCount: number;
  /** Percentage of total project spend */
  percentage: number;
}

/** GET /api/projects/{projectId}/reports/summary */
export interface ProjectReportResponse {
  projectId: string;
  projectName: string;
  currencyCode: string;
  totalSpent: number;
  expenseCount: number;
  byCategory: CategoryBreakdown[];
  byPaymentMethod: PaymentMethodBreakdown[];
}

// ─── Month comparison report ─────────────────────────────────────────────────

export interface MonthSummary {
  year: number;
  month: number; // 1–12
  totalSpent: number;
  expenseCount: number;
}

/** GET /api/projects/{projectId}/reports/month-comparison */
export interface MonthComparisonResponse {
  projectId: string;
  currentMonth: MonthSummary;
  previousMonth: MonthSummary;
  /** Positive = increase, negative = decrease */
  changeAmount: number;
  /** null when previous month total was 0 */
  changePercentage: number | null;
}

// ─── Category growth report ──────────────────────────────────────────────────

/** GET /api/projects/{projectId}/reports/category-growth — array item */
export interface CategoryGrowthResponse {
  categoryId: string;
  categoryName: string;
  currentMonthAmount: number;
  previousMonthAmount: number;
  /** Positive = grew, negative = shrank */
  growthAmount: number;
  /** null when previous month amount was 0 */
  growthPercentage: number | null;
}

// ─── Query helpers ───────────────────────────────────────────────────────────

export interface ReportDateRange {
  from?: string; // "YYYY-MM-DD"
  to?: string;   // "YYYY-MM-DD"
}
