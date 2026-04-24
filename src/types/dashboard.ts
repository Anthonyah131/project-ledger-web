// types/dashboard.ts
// API model definitions for monthly dashboard endpoints.

export interface DashboardNavigation {
  previous_month: string
  current_month: string
  next_month: string
  is_current_month: boolean
  has_previous_data: boolean
  has_next_data: boolean
}

export interface DashboardSummary {
  total_spent: number
  total_income: number
  net_balance: number
}

export interface DashboardComparison {
  previous_month: string
  spent_delta: number
  spent_delta_percentage: number
  income_delta: number
  income_delta_percentage: number
  net_delta: number
}

export interface DashboardTrendDay {
  date: string
  spent: number
  income: number
  net: number
  project_ids?: string[]
  expense_count?: number
  income_count?: number
}

export interface DashboardPaymentMethodSplit {
  payment_method_id: string
  payment_method_name: string
  total_amount: number
  expense_count: number
  percentage: number
}

export type DashboardAlertType = "info" | "warning"

export interface DashboardAlert {
  type: DashboardAlertType
  code: string
  message: string
  project_id: string | null
  payment_method_id: string | null
  priority: number
  count: number
}

export interface DashboardMonthlySummaryResponse {
  month: string
  currency_code: string
  project_id: string
  generated_at: string
  navigation: DashboardNavigation
  summary: DashboardSummary
  comparison: DashboardComparison
  alerts: DashboardAlert[]
}

export interface DashboardMonthlyTrendResponse {
  month: string
  currency_code: string
  project_id: string
  trend_by_day: DashboardTrendDay[]
}

export interface DashboardMonthlyPaymentMethodsResponse {
  month: string
  currency_code: string
  project_id: string
  payment_method_split: DashboardPaymentMethodSplit[]
}

export interface DashboardProjectItemDto {
  id: string
  name: string
  currencyCode: string
  isPinned: boolean
  pinnedAt: string | null
}

export interface DashboardProjectsPagedResponse {
  pinned: DashboardProjectItemDto[]
  items: DashboardProjectItemDto[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface DashboardTopTransaction {
  id: string
  type: "expense" | "income"
  description: string
  amount: number
  date: string
  category_id: string
  category_name: string
  payment_method_id: string
  payment_method_name: string
}

export interface DashboardMonthlyTopTransactionsResponse {
  month: string
  currency_code: string
  project_id: string
  transactions: DashboardTopTransaction[]
}

export interface DashboardComparisonHistoryItem {
  month: string
  summary: {
    total_spent: number
    total_income: number
    net_balance: number
  }
}

export interface DashboardLastYearComparison {
  spent_delta: number
  spent_delta_percentage: number
}

export interface DashboardLastYearMonth {
  month: string
  summary: {
    total_spent: number
    total_income: number
    net_balance: number
  }
  comparison: DashboardLastYearComparison
}

export interface DashboardMonthlySummaryResponse {
  month: string
  currency_code: string
  project_id: string
  generated_at: string
  navigation: DashboardNavigation
  summary: DashboardSummary
  comparison: DashboardComparison
  alerts: DashboardAlert[]
  days_elapsed?: number
  days_total?: number
  average_daily_spend?: number
  comparison_history?: DashboardComparisonHistoryItem[]
  last_year_month?: DashboardLastYearMonth | null
}

export interface DashboardMonthlyTrendResponse {
  month: string
  currency_code: string
  project_id: string
  trend_by_day: DashboardTrendDay[]
  daily_budget_rate?: number | null
  monthly_budget?: number | null
  budget_alert_percentage?: number | null
}
