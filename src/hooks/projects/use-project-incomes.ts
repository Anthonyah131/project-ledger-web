"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { toast } from "sonner"
import * as incomeService from "@/services/income-service"
import { toastApiError } from "@/lib/error-utils"
import { useLanguage } from "@/context/language-context"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type {
  IncomeResponse,
  CreateIncomeRequest,
  UpdateIncomeRequest,
  BulkCreateIncomesRequest,
} from "@/types/income"
import type { MutationOptions } from "@/types/common"

export type IncomeActiveStatusFilter = "all" | "active" | "inactive"

function toIsActiveParam(status: IncomeActiveStatusFilter): boolean | undefined {
  if (status === "all") return undefined
  return status === "active"
}

export function useProjectIncomes(projectId: string) {
  const { t } = useLanguage()
  const [incomes, setIncomes] = useState<IncomeResponse[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState("incomeDate:desc")

  const [query, setQuery] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [activeStatus, setActiveStatus] = useState<IncomeActiveStatusFilter>("active")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const [createOpen, setCreateOpen] = useState(false)
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<IncomeResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<IncomeResponse | null>(null)
  const [duplicateSource, setDuplicateSource] = useState<IncomeResponse | null>(null)

  const fetchIncomes = useCallback(async () => {
    try {
      setLoading(true)
      const [sortBy, sortDirection] = sort.split(":") as [string, "asc" | "desc"]
      const data = await incomeService.getIncomes(projectId, {
        page,
        pageSize,
        sortBy,
        sortDirection,
        isActive: toIsActiveParam(activeStatus),
        from: dateFrom || undefined,
        to: dateTo || undefined,
      })
      setIncomes(data.items)
      setTotalCount(data.totalCount)
    } catch (err) {
      toastApiError(err, t("incomes.errors.load"))
    } finally {
      setLoading(false)
    }
  }, [projectId, page, pageSize, sort, activeStatus, dateFrom, dateTo, t])

  useEffect(() => {
    fetchIncomes()
  }, [fetchIncomes])

  const debouncedQuery = useDebouncedValue(query, 300)

  const filtered = useMemo(() => {
    let result = incomes
    if (debouncedQuery) {
      const lower = debouncedQuery.toLowerCase()
      result = result.filter((income) => income.title.toLowerCase().includes(lower))
    }
    if (selectedCategoryId) {
      result = result.filter((income) => income.categoryId === selectedCategoryId)
    }
    return result
  }, [incomes, debouncedQuery, selectedCategoryId])

  const hasSearch = !!debouncedQuery || !!selectedCategoryId || !!dateFrom || !!dateTo

  const mutateCreate = useCallback(
    async (data: CreateIncomeRequest, options?: MutationOptions) => {
      try {
        await incomeService.createIncome(projectId, data)
        toast.success(t("incomes.toast.created"))
        if (options?.refetch ?? true) {
          await fetchIncomes()
        }
      } catch (err) {
        toastApiError(err, t("incomes.errors.create"))
      }
    },
    [projectId, fetchIncomes, t]
  )

  const mutateUpdate = useCallback(
    async (incomeId: string, data: UpdateIncomeRequest, options?: MutationOptions) => {
      try {
        await incomeService.updateIncome(projectId, incomeId, data)
        toast.success(t("incomes.toast.updated"))
        if (options?.refetch ?? true) {
          await fetchIncomes()
        }
      } catch (err) {
        toastApiError(err, t("incomes.errors.update"))
      }
    },
    [projectId, fetchIncomes, t]
  )

  const mutateDelete = useCallback(
    async (income: IncomeResponse, options?: MutationOptions) => {
      try {
        await incomeService.deleteIncome(projectId, income.id)
        toast.success(t("incomes.toast.deleted"), {
          description: t("incomes.toast.deletedDesc", { name: income.title }),
        })
        if (options?.refetch ?? true) {
          await fetchIncomes()
        }
      } catch (err) {
        toastApiError(err, t("incomes.errors.delete"))
      }
    },
    [projectId, fetchIncomes, t]
  )

  const mutateActiveState = useCallback(
    async (income: IncomeResponse, isActive: boolean, options?: MutationOptions) => {
      try {
        await incomeService.updateIncomeActiveState(projectId, income.id, { isActive })
        toast.success(isActive ? t("incomes.toast.activated") : t("incomes.toast.markedReminder"))
        if (options?.refetch ?? true) {
          await fetchIncomes()
        }
      } catch (err) {
        toastApiError(err, t("incomes.errors.updateStatus"))
      }
    },
    [projectId, fetchIncomes, t]
  )

  const mutateBulkCreate = useCallback(
    async (data: BulkCreateIncomesRequest, options?: MutationOptions) => {
      try {
        const result = await incomeService.bulkCreateIncomes(projectId, data)
        toast.success(t("bulkImport.toast.created", {
          count: result.created,
          type: t("bulkImport.typeIncomes"),
        }))
        if (options?.refetch ?? true) {
          await fetchIncomes()
        }
        return result
      } catch (err) {
        toastApiError(err, t("bulkImport.errors.import"))
        throw err
      }
    },
    [projectId, fetchIncomes, t]
  )

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setPage(1)
  }, [])

  const handleSortChange = useCallback((s: string) => {
    setSort(s)
    setPage(1)
  }, [])

  const handleActiveStatusChange = useCallback((status: IncomeActiveStatusFilter) => {
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
    incomes: filtered,
    total: hasSearch ? filtered.length : totalCount,
    loading,
    hasSearch,
    page,
    setPage,
    pageSize,
    query,
    setQuery,
    selectedCategoryId,
    setSelectedCategoryId,
    activeStatus,
    sort,
    dateFrom,
    dateTo,
    createOpen,
    setCreateOpen,
    bulkImportOpen,
    setBulkImportOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    duplicateSource,
    setDuplicateSource,
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
    refetch: fetchIncomes,
  }
}
