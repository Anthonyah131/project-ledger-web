// services/expense-service.ts

import { api } from "@/lib/api-client"
import type {
  ExpenseResponse,
  ExpensesPageResponse,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  CreateExpenseFromTemplateRequest,
} from "@/types/expense"

// ─── Query params ──────────────────────────────────────────────────────────────

export interface GetExpensesParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
  includeDeleted?: boolean
}

// ─── Expenses (scoped to project) ─────────────────────────────────────────────

export function getExpenses(projectId: string, params: GetExpensesParams = {}) {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set("page", String(params.page))
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize))
  if (params.sortBy) query.set("sortBy", params.sortBy)
  if (params.sortDirection) query.set("sortDirection", params.sortDirection)
  if (params.includeDeleted !== undefined)
    query.set("includeDeleted", String(params.includeDeleted))

  const qs = query.toString()
  const url = qs
    ? `/projects/${projectId}/expenses?${qs}`
    : `/projects/${projectId}/expenses`

  return api.get<ExpensesPageResponse>(url)
}

export function getExpense(projectId: string, expenseId: string) {
  return api.get<ExpenseResponse>(`/projects/${projectId}/expenses/${expenseId}`)
}

export function createExpense(projectId: string, data: CreateExpenseRequest) {
  return api.post<ExpenseResponse>(`/projects/${projectId}/expenses`, data)
}

export function updateExpense(
  projectId: string,
  expenseId: string,
  data: UpdateExpenseRequest
) {
  return api.put<ExpenseResponse>(`/projects/${projectId}/expenses/${expenseId}`, data)
}

export function deleteExpense(projectId: string, expenseId: string) {
  return api.delete<void>(`/projects/${projectId}/expenses/${expenseId}`)
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function getExpenseTemplates(projectId: string) {
  return api.get<ExpenseResponse[]>(`/projects/${projectId}/expenses/templates`)
}

export function createExpenseFromTemplate(
  projectId: string,
  templateId: string,
  data: CreateExpenseFromTemplateRequest = {}
) {
  return api.post<ExpenseResponse>(
    `/projects/${projectId}/expenses/from-template/${templateId}`,
    data
  )
}
