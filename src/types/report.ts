// types/report.ts
// Report model type definitions — API response shapes for project reports

import type { CurrencyExchangeResponse } from "@/types/expense";

// ─── Summary report ──────────────────────────────────────────────────────────

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  expenseCount: number;
  /** Percentage of total project spend */
  percentage: number;
  /** Average amount per expense in this category */
  averageAmount?: number | null;
}

export interface PaymentMethodBreakdown {
  paymentMethodId: string;
  paymentMethodName: string;
  totalAmount: number;
  expenseCount: number;
  /** Percentage of total project spend */
  percentage: number;
  /** Average amount per expense with this payment method */
  averageAmount?: number | null;
}

/** Single most expensive expense in the summary period */
export interface SummaryTopExpense {
  expenseId: string;
  title: string;
  amount: number;
  categoryName: string;
  expenseDate: string;
}

/** GET /api/projects/{projectId}/reports/summary */
export interface ProjectReportResponse {
  projectId: string;
  projectName: string;
  currencyCode: string;
  /** Echoed back from query params; null when no filter applied */
  dateFrom?: string | null;
  dateTo?: string | null;
  generatedAt?: string | null;
  totalSpent: number;
  expenseCount: number;
  totalIncome: number;
  incomeCount: number;
  netBalance: number;
  /** totalSpent / expenseCount */
  averageExpenseAmount?: number | null;
  /** Set when project has a budget configured */
  budget?: number | null;
  budgetUsedPercentage?: number | null;
  /** Advanced plan: spend from obligation payments only */
  obligationSpent?: number | null;
  /** Advanced plan: spend from regular (non-obligation) expenses */
  regularSpent?: number | null;
  topExpense?: SummaryTopExpense | null;
  byCategory: CategoryBreakdown[];
  byPaymentMethod: PaymentMethodBreakdown[];
}

// ─── Month comparison report ─────────────────────────────────────────────────

export interface MonthSummary {
  year: number;
  month: number; // 1–12
  /** Human-readable label e.g. "marzo 2024" */
  monthLabel?: string | null;
  totalSpent: number;
  expenseCount: number;
  totalIncome: number;
  incomeCount: number;
  netBalance: number;
}

/** GET /api/projects/{projectId}/reports/month-comparison */
export interface MonthComparisonResponse {
  projectId: string;
  /** Included when backend provides it; optional for backwards compat */
  projectName?: string | null;
  /** Currency code for all monetary amounts in this response */
  currencyCode?: string | null;
  generatedAt?: string | null;
  currentMonth: MonthSummary;
  previousMonth: MonthSummary;
  /** Positive = increase, negative = decrease */
  changeAmount: number;
  /** null when previous month total was 0 */
  changePercentage: number | null;
  /** false when previousMonth has no expense data at all */
  hasPreviousData?: boolean | null;
}

// ─── Category growth report ──────────────────────────────────────────────────

/** GET /api/projects/{projectId}/reports/category-growth — per-category item */
export interface CategoryGrowthItem {
  categoryId: string;
  categoryName: string;
  currentMonthAmount: number;
  previousMonthAmount: number;
  /** Positive = grew, negative = shrank */
  growthAmount: number;
  /** null when previous month amount was 0 */
  growthPercentage: number | null;
  /** Expense count in the current month */
  currentMonthCount?: number | null;
  /** Expense count in the previous month */
  previousMonthCount?: number | null;
  /** Average per expense in the current month */
  averageAmountCurrent?: number | null;
  /** Average per expense in the previous month */
  averageAmountPrevious?: number | null;
  /** True when category had zero spend last month but has spend this month */
  isNew?: boolean | null;
  /** True when category had spend last month but zero this month */
  isDisappeared?: boolean | null;
}

/**
 * GET /api/projects/{projectId}/reports/category-growth
 *
 * NOTE: The backend currently returns a raw array. It should be wrapped in this
 * envelope. The frontend types accept both shapes via a union until the backend ships.
 */
export interface CategoryGrowthResponse {
  projectId?: string | null;
  projectName?: string | null;
  currencyCode?: string | null;
  currentMonthLabel?: string | null;
  previousMonthLabel?: string | null;
  generatedAt?: string | null;
  /** The growth items. When the backend returns a raw array, treat that as this field. */
  categories: CategoryGrowthItem[];
}

/** @deprecated Use CategoryGrowthItem — kept for backwards compat during migration */
export type CategoryGrowthResponseLegacy = CategoryGrowthItem[];

// ─── Detailed expense report (exportable) ────────────────────────────────────

/** GET /api/projects/{projectId}/reports/expenses?format=json — single expense row */
export interface ExpenseReportExpenseItem {
  expenseId: string;
  title: string;
  /** Amount in the project base currency (convertedAmount). Primary display field. */
  convertedAmount: number;
  /** Original amount before conversion (equals convertedAmount when same currency) */
  originalAmount: number;
  /** ISO 4217 code of the original currency */
  originalCurrency: string;
  /** Exchange rate used; 1 when no conversion */
  exchangeRate?: number | null;
  categoryName: string;
  paymentMethodName: string;
  expenseDate: string;
  description: string | null;
  receiptNumber: string | null;
  notes: string | null;
  currencyExchanges?: CurrencyExchangeResponse[] | null;
  /** True when this expense is linked to an obligation payment */
  isObligationPayment?: boolean;
}

/** Per-section-level stats added to each monthly block */
export interface ExpenseReportSection {
  year: number;
  month: number;
  monthLabel: string;
  sectionTotal: number;
  sectionCount: number;
  sectionIncomeTotal?: number | null;
  sectionIncomeCount?: number | null;
  sectionNetBalance?: number | null;
  /** Percentage of the report total this month represents */
  percentageOfTotal?: number | null;
  /** Average amount per expense in this month */
  averageExpenseAmount?: number | null;
  /** Largest single expense in this month */
  topExpense?: { title: string; amount: number } | null;
  expenses: ExpenseReportExpenseItem[];
}

export interface ExpenseReportCategoryAnalysis {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  expenseCount: number;
  percentage: number;
  /** Average amount per expense in this category */
  averageAmount?: number | null;
}

/** Payment method breakdown — parallel to categoryAnalysis (advanced plans) */
export interface ExpenseReportPaymentMethodAnalysis {
  paymentMethodId: string;
  paymentMethodName: string;
  /** Payment method account type (e.g. "credit", "debit") */
  type: string;
  /** Total spent through this method (renamed from `totalAmount` in v2) */
  spentAmount: number;
  expenseCount: number;
  percentage: number;
  averageExpenseAmount: number;
}

export interface ExpenseReportObligationSummary {
  obligationId: string;
  title: string;
  totalPaid: number;
  paymentCount: number;
}

/** High-level insight surfaced by the backend (advanced plans) */
export interface ExpenseReportInsight {
  type: "info" | "warning" | "tip";
  message: string;
}

/** Largest expense in the report period */
export interface ExpenseReportTopExpense {
  expenseId: string;
  title: string;
  amount: number;
  expenseDate: string;
  categoryName: string;
  paymentMethodName: string;
}

export interface ProjectExpenseReportResponse {
  projectId: string;
  projectName: string;
  currencyCode: string;
  dateFrom: string | null;
  dateTo: string | null;
  generatedAt: string;
  totalSpent: number;
  totalExpenseCount: number;
  totalIncome?: number | null;
  totalIncomeCount?: number | null;
  netBalance?: number | null;
  /** Average amount per individual expense */
  averageExpenseAmount?: number | null;
  /** Average spend per month over the period */
  averageMonthlySpend?: number | null;
  /** Single most expensive expense in the period */
  largestExpense?: ExpenseReportTopExpense | null;
  /** Month with highest spending */
  peakMonth?: { monthLabel: string; total: number } | null;
  sections: ExpenseReportSection[];
  categoryAnalysis: ExpenseReportCategoryAnalysis[] | null;
  /** Available when plan has CanUseAdvancedReports */
  paymentMethodAnalysis?: ExpenseReportPaymentMethodAnalysis[] | null;
  obligationSummary: ExpenseReportObligationSummary[] | null;
  /** Text insights generated by the backend (advanced plans) */
  insights?: ExpenseReportInsight[] | null;
}

// ─── Payment method report (user-level) ──────────────────────────────────────

/** GET /api/reports/payment-methods?format=json */
export interface PaymentMethodReportProject {
  projectId: string;
  projectName: string;
  /** Currency of this project — may differ from the payment method currency */
  currencyCode?: string | null;
  totalSpent: number;
  expenseCount: number;
}

export interface PaymentMethodReportExpense {
  expenseId: string;
  projectId: string;
  projectName: string;
  title: string;
  /** Amount converted to the **project's** base currency. This is NOT necessarily in the
   *  payment method's own currency — use `originalAmount` / `originalCurrency` for the
   *  amount actually debited from the account. */
  convertedAmount: number;
  /** Amount as originally debited from this payment method account, in `originalCurrency`.
   *  This is the authoritative field to display in the payment-method-report money column. */
  originalAmount?: number | null;
  /** ISO 4217 code of the original expense currency — typically matches the payment method's `currency`. */
  originalCurrency?: string | null;
  /** Currency of the project this expense belongs to (= moneda base del proyecto). */
  projectCurrency: string;
  expenseDate: string;
  categoryName: string;
  currencyExchanges?: CurrencyExchangeResponse[] | null;
}

export interface PaymentMethodReportIncome {
  incomeId: string;
  projectId: string;
  projectName: string;
  title: string;
  incomeDate: string;
  categoryId?: string | null;
  categoryName: string;
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  projectCurrency: string;
  description?: string | null;
  currencyExchanges?: CurrencyExchangeResponse[] | null;
}

/** Top category usage breakdown per payment method */
export interface PaymentMethodTopCategory {
  categoryName: string;
  totalAmount: number;
  expenseCount: number;
  percentage: number;
}

/** Most expensive single expense for a payment method */
export interface PaymentMethodTopExpense {
  expenseId: string;
  title: string;
  amount: number;
  expenseDate: string;
  projectName: string;
  categoryName: string;
}

export interface PaymentMethodReportMethod {
  paymentMethodId: string;
  name: string;
  type: string;
  currency: string;
  bankName: string | null;
  totalSpent: number;
  expenseCount: number;
  totalIncome?: number | null;
  incomeCount?: number | null;
  netFlow?: number | null;
  percentage: number;
  averageExpenseAmount: number;
  averageIncomeAmount?: number | null;
  firstUseDate: string | null;
  lastUseDate: string | null;
  /** Calendar days since lastUseDate; 0 when used today */
  daysSinceLastUse?: number | null;
  /** True when method hasn't been used in over 90 days */
  isInactive?: boolean | null;
  /** Largest single expense made with this method in the period */
  topExpense?: PaymentMethodTopExpense | null;
  /** Top 3–5 categories by spend through this method */
  topCategories?: PaymentMethodTopCategory[] | null;
  projects: PaymentMethodReportProject[];
  /** Capped list — see expensesShown / totalExpensesInPeriod for full count */
  expenses: PaymentMethodReportExpense[];
  incomes?: PaymentMethodReportIncome[];
  /** Total number of expenses in the period (even if expenses[] is capped) */
  totalExpensesInPeriod?: number | null;
  /** How many items are actually in the expenses[] array */
  expensesShown?: number | null;
  totalIncomesInPeriod?: number | null;
  incomesShown?: number | null;
}

export interface PaymentMethodReportMonthByMethod {
  paymentMethodId: string;
  name: string;
  totalSpent: number;
  expenseCount: number;
  totalIncome?: number | null;
  incomeCount?: number | null;
  netFlow?: number | null;
  /** This method's share of total spend in this month */
  percentage?: number | null;
}

export interface PaymentMethodReportMonthlyTrend {
  year: number;
  month: number;
  monthLabel: string;
  totalSpent: number;
  expenseCount: number;
  totalIncome?: number | null;
  incomeCount?: number | null;
  netBalance?: number | null;
  byMethod: PaymentMethodReportMonthByMethod[];
}

/** Reference to a payment method used in aggregate fields */
export interface MethodReference {
  paymentMethodId: string;
  name: string;
}

export interface PaymentMethodReportResponse {
  userId: string;
  dateFrom: string | null;
  dateTo: string | null;
  generatedAt: string;
  grandTotalSpent: number;
  grandTotalExpenseCount: number;
  grandTotalIncome?: number | null;
  grandTotalIncomeCount?: number | null;
  grandNetFlow?: number | null;
  /** grandTotalSpent / grandTotalExpenseCount */
  grandAverageExpenseAmount?: number | null;
  grandAverageIncomeAmount?: number | null;
  /** Average spend per month over the period */
  averageMonthlySpend?: number | null;
  /** Month with the highest totalSpent */
  peakMonth?: { monthLabel: string; total: number } | null;
  /** Method with the highest expenseCount */
  mostUsedMethod?: MethodReference | null;
  /** Method with the highest totalSpent */
  highestSpendMethod?: MethodReference | null;
  /** Text insights (advanced plan) */
  insights?: ExpenseReportInsight[] | null;
  paymentMethods: PaymentMethodReportMethod[];
  monthlyTrend: PaymentMethodReportMonthlyTrend[];
}

// ─── Export format ───────────────────────────────────────────────────────────

export type ReportFormat = "json" | "excel" | "pdf";

// ─── Query helpers ───────────────────────────────────────────────────────────

export interface ReportDateRange {
  from?: string; // "YYYY-MM-DD"
  to?: string;   // "YYYY-MM-DD"
}
