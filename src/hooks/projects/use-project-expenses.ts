"use client"

// hooks/projects/use-project-expenses.ts
// State management for expenses within a project detail view.

import { useState, useCallback, useEffect, useMemo } from "react"
import { toast } from "sonner"
import * as expenseService from "@/services/expense-service"
import { toastApiError } from "@/lib/error-utils"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type {
  ExpenseResponse,
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from "@/types/expense"

export function useProjectExpenses(projectId: string) {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Pagination / sort
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState("expenseDate:desc")

  // Client-side search
  const [query, setQuery] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")

  // Modals
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ExpenseResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ExpenseResponse | null>(null)

  // ── Fetch ─────────────────────────────────────────────────

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true)
      const [sortBy, sortDirection] = sort.split(":") as [string, "asc" | "desc"]
      const data = await expenseService.getExpenses(projectId, {
        page,
        pageSize,
        sortBy,
        sortDirection,
      })
      setExpenses(data.items)
      setTotalCount(data.totalCount)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar gastos"
      toast.error("Error al cargar gastos", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [projectId, page, pageSize, sort])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // ── Debounced query ────────────────────────────────────────────

  const debouncedQuery = useDebouncedValue(query, 300)

  // ── Filtered (client-side by title) ───────────────────────

  const filtered = useMemo(() => {
    let result = expenses
    if (debouncedQuery) {
      const lower = debouncedQuery.toLowerCase()
      result = result.filter((e) => e.title.toLowerCase().includes(lower))
    }
    if (selectedCategoryId) {
      result = result.filter((e) => e.categoryId === selectedCategoryId)
    }
    return result
  }, [expenses, debouncedQuery, selectedCategoryId])

  const hasSearch = !!debouncedQuery || !!selectedCategoryId

  // ── CRUD ──────────────────────────────────────────────────

  const handleCreate = useCallback(
    async (data: CreateExpenseRequest) => {
      try {
        await expenseService.createExpense(projectId, data)
        toast.success("Gasto creado")
        fetchExpenses()
      } catch (err) {
        toastApiError(err, "Error al crear gasto")
      }
    },
    [projectId, fetchExpenses]
  )

  const handleEdit = useCallback(
    async (expenseId: string, data: UpdateExpenseRequest) => {
      try {
        await expenseService.updateExpense(projectId, expenseId, data)
        toast.success("Gasto actualizado")
        fetchExpenses()
      } catch (err) {
        toastApiError(err, "Error al actualizar gasto")
      }
    },
    [projectId, fetchExpenses]
  )

  const handleDelete = useCallback(
    async (expense: ExpenseResponse) => {
      try {
        await expenseService.deleteExpense(projectId, expense.id)
        toast.success("Gasto eliminado", {
          description: `"${expense.title}" fue eliminado.`,
        })
        fetchExpenses()
      } catch (err) {
        toastApiError(err, "Error al eliminar gasto")
      }
    },
    [projectId, fetchExpenses]
  )

  // ── Page/sort handlers ────────────────────────────────────

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setPage(1)
  }, [])

  const handleSortChange = useCallback((s: string) => {
    setSort(s)
    setPage(1)
  }, [])

  return {
    expenses: filtered,
    total: hasSearch ? filtered.length : totalCount,
    loading,
    hasSearch,
    page, setPage,
    pageSize,
    query, setQuery,
    selectedCategoryId, setSelectedCategoryId,
    sort,
    createOpen, setCreateOpen,
    editTarget, setEditTarget,
    deleteTarget, setDeleteTarget,
    handleCreate,
    handleEdit,
    handleDelete,
    handlePageSizeChange,
    handleSortChange,
    refetch: fetchExpenses,
  }
}
