"use client"

// hooks/projects/use-project-expenses.ts
// State management for expenses within a project detail view.

import { useState, useCallback, useEffect, useMemo } from "react"
import { toast } from "sonner"
import * as expenseService from "@/services/expense-service"
import { toastApiError } from "@/lib/error-utils"
import { useLanguage } from "@/context/language-context"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type {
  ExpenseResponse,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  BulkCreateExpensesRequest,
} from "@/types/expense"
import type { MutationOptions } from "@/types/common"

export type ExpenseActiveStatusFilter = "all" | "active" | "inactive"

function toIsActiveParam(status: ExpenseActiveStatusFilter): boolean | undefined {
  if (status === "all") return undefined
  return status === "active"
}

export function useProjectExpenses(projectId: string) {
  const { t } = useLanguage()
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
  const [activeStatus, setActiveStatus] = useState<ExpenseActiveStatusFilter>("active")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Modals
  const [createOpen, setCreateOpen] = useState(false)
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ExpenseResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ExpenseResponse | null>(null)
  const [duplicateSource, setDuplicateSource] = useState<ExpenseResponse | null>(null)

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
        isActive: toIsActiveParam(activeStatus),
        from: dateFrom || undefined,
        to: dateTo || undefined,
      })
      setExpenses(data.items)
      setTotalCount(data.totalCount)
    } catch (err) {
      toastApiError(err, t("expenses.errors.load"))
    } finally {
      setLoading(false)
    }
  }, [projectId, page, pageSize, sort, activeStatus, dateFrom, dateTo, t])

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

  const hasSearch = !!debouncedQuery || !!selectedCategoryId || !!dateFrom || !!dateTo

  // ── CRUD ──────────────────────────────────────────────────

  const mutateCreate = useCallback(
    async (data: CreateExpenseRequest, options?: MutationOptions) => {
      try {
        await expenseService.createExpense(projectId, data)
        toast.success(t("expenses.toast.created"))
        if (options?.refetch ?? true) {
          await fetchExpenses()
        }
      } catch (err) {
        toastApiError(err, t("expenses.errors.create"))
      }
    },
    [projectId, fetchExpenses, t]
  )

  const mutateUpdate = useCallback(
    async (
      expenseId: string,
      data: UpdateExpenseRequest,
      options?: MutationOptions
    ) => {
      try {
        await expenseService.updateExpense(projectId, expenseId, data)
        toast.success(t("expenses.toast.updated"))
        if (options?.refetch ?? true) {
          await fetchExpenses()
        }
      } catch (err) {
        toastApiError(err, t("expenses.errors.update"))
      }
    },
    [projectId, fetchExpenses, t]
  )

  const mutateDelete = useCallback(
    async (expense: ExpenseResponse, options?: MutationOptions) => {
      try {
        await expenseService.deleteExpense(projectId, expense.id)
        toast.success(t("expenses.toast.deleted"), {
          description: t("expenses.toast.deletedDesc", { name: expense.title }),
        })
        if (options?.refetch ?? true) {
          await fetchExpenses()
        }
      } catch (err) {
        toastApiError(err, t("expenses.errors.delete"))
      }
    },
    [projectId, fetchExpenses, t]
  )

  const mutateActiveState = useCallback(
    async (
      expense: ExpenseResponse,
      isActive: boolean,
      options?: MutationOptions
    ) => {
      try {
        await expenseService.updateExpenseActiveState(projectId, expense.id, { isActive })
        toast.success(isActive ? t("expenses.toast.activated") : t("expenses.toast.markedReminder"))
        if (options?.refetch ?? true) {
          await fetchExpenses()
        }
      } catch (err) {
        toastApiError(err, t("expenses.errors.updateStatus"))
      }
    },
    [projectId, fetchExpenses, t]
  )

  // ── Bulk create ──────────────────────────────────────────

  const mutateBulkCreate = useCallback(
    async (data: BulkCreateExpensesRequest, options?: MutationOptions) => {
      try {
        const result = await expenseService.bulkCreateExpenses(projectId, data)
        toast.success(t("bulkImport.toast.created", {
          count: result.created,
          type: t("bulkImport.typeExpenses"),
        }))
        if (options?.refetch ?? true) {
          await fetchExpenses()
        }
        return result
      } catch (err) {
        toastApiError(err, t("bulkImport.errors.import"))
        throw err
      }
    },
    [projectId, fetchExpenses, t]
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

  const handleActiveStatusChange = useCallback((status: ExpenseActiveStatusFilter) => {
    setActiveStatus(status)
    setPage(1)
  }, [])

  const handleDateFromChange = useCallback((value: string) => {
    setDateFrom(value)
    setPage(1)
  }, [])

  const handleDateToChange = useCallback((value: string) => {
    setDateTo(value)
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
    activeStatus,
    sort,
    dateFrom,
    dateTo,
    createOpen, setCreateOpen,
    bulkImportOpen, setBulkImportOpen,
    editTarget, setEditTarget,
    deleteTarget, setDeleteTarget,
    duplicateSource, setDuplicateSource,
    mutateCreate,
    mutateBulkCreate,
    mutateUpdate,
    mutateDelete,
    mutateActiveState,
    handlePageSizeChange,
    handleSortChange,
    handleActiveStatusChange,
    handleDateFromChange,
    handleDateToChange,
    refetch: fetchExpenses,
  }
}
