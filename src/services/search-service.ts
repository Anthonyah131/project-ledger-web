// services/search-service.ts

import { api } from "@/lib/api-client"

export interface ExpenseSearchResult {
  id: string
  title: string
  amount: number
  currency: string
  date: string // "YYYY-MM-DD"
  projectId: string
  projectName: string
  categoryName: string
}

export interface IncomeSearchResult {
  id: string
  title: string
  amount: number
  currency: string
  date: string // "YYYY-MM-DD"
  projectId: string
  projectName: string
  categoryName: string
}

export interface GlobalSearchResponse {
  expenses: ExpenseSearchResult[]
  incomes: IncomeSearchResult[]
}

export function globalSearch(q: string, pageSize = 5) {
  return api.get<GlobalSearchResponse>(
    `/search?q=${encodeURIComponent(q)}&types=expenses,incomes&pageSize=${pageSize}`,
  )
}
