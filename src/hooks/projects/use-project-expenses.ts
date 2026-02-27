"use client"

// hooks/projects/use-project-expenses.ts
// State management for expenses within a project detail view.

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { toast } from "sonner"
import * as expenseService from "@/services/expense-service"
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
  const [debouncedQuery, setDebouncedQuery] = useState("")
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

  // ── Debounce query ────────────────────────────────────────

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

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
        const msg = err instanceof Error ? err.message : "Error al crear gasto"
        toast.error("Error al crear gasto", { description: msg })
      }
    },
    [projectId, fetchExpenses]
  )

  const handleEdit = useCallback(
    async (expenseId: string, data: UpdateExpenseRequest) => {
      try {
        const updated = await expenseService.updateExpense(projectId, expenseId, data)
        setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updated : e)))
        toast.success("Gasto actualizado")
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al actualizar gasto"
        toast.error("Error al actualizar", { description: msg })
      }
    },
    [projectId]
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
        const msg = err instanceof Error ? err.message : "Error al eliminar gasto"
        toast.error("Error al eliminar", { description: msg })
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
