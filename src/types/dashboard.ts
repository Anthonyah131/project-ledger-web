// types/dashboard.ts
// API model definitions for monthly dashboard overview endpoint.

export interface DashboardNavigation {
  previousMonth: string
  currentMonth: string
  nextMonth: string
  isCurrentMonth: boolean
  hasPreviousData: boolean
  hasNextData: boolean
}

export interface DashboardSummary {
  totalSpent: number
  totalIncome: number
  netBalance: number
}

export interface DashboardComparison {
  previousMonth: string
  spentDelta: number
  spentDeltaPercentage: number
  incomeDelta: number
  incomeDeltaPercentage: number
  netDelta: number
}

export interface DashboardTrendDay {
  date: string
  spent: number
  income: number
  net: number
  projectIds?: string[]
  expenseCount?: number
  incomeCount?: number
}

export interface DashboardTopCategory {
  categoryId: string
  categoryName: string
  totalAmount: number
  expenseCount: number
  percentage: number
  projectIds?: string[]
}

export interface DashboardPaymentMethodSplit {
  paymentMethodId: string
  paymentMethodName: string
  totalAmount: number
  expenseCount: number
  percentage: number
}

export type DashboardAlertType = "info" | "warning" | "error"

export interface DashboardAlert {
  type: DashboardAlertType
  code: string
  message: string
  projectId?: string | null
  paymentMethodId?: string | null
  priority?: number
  count?: number
}

export interface DashboardMonthlySummaryResponse {
  month: string
  navigation: DashboardNavigation
  currencyCode: string
  generatedAt: string
  summary: DashboardSummary
  comparison: DashboardComparison
  alerts: DashboardAlert[]
}

export interface DashboardMonthlyTrendResponse {
  month: string
  currencyCode: string
  projectId?: string | null
  trendByDay: DashboardTrendDay[]
}

export interface DashboardMonthlyTopCategoriesResponse {
  month: string
  currencyCode: string
  projectId?: string | null
  topCategories: DashboardTopCategory[]
}

export interface DashboardMonthlyPaymentMethodsResponse {
  month: string
  currencyCode: string
  paymentMethodSplit: DashboardPaymentMethodSplit[]
}
