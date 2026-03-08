"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { toast } from "sonner"
import * as incomeService from "@/services/income-service"
import { toastApiError } from "@/lib/error-utils"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type {
  IncomeResponse,
  CreateIncomeRequest,
  UpdateIncomeRequest,
} from "@/types/income"
import type { MutationOptions } from "@/types/common"

export function useProjectIncomes(projectId: string) {
  const [incomes, setIncomes] = useState<IncomeResponse[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState("incomedate:desc")

  const [query, setQuery] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<IncomeResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<IncomeResponse | null>(null)

  const fetchIncomes = useCallback(async () => {
    try {
      setLoading(true)
      const [sortBy, sortDirection] = sort.split(":") as [string, "asc" | "desc"]
      const data = await incomeService.getIncomes(projectId, {
        page,
        pageSize,
        sortBy,
        sortDirection,
      })
      setIncomes(data.items)
      setTotalCount(data.totalCount)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar ingresos"
      toast.error("Error al cargar ingresos", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [projectId, page, pageSize, sort])

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

  const hasSearch = !!debouncedQuery || !!selectedCategoryId

  const mutateCreate = useCallback(
    async (data: CreateIncomeRequest, options?: MutationOptions) => {
      try {
        await incomeService.createIncome(projectId, data)
        toast.success("Ingreso creado")
        if (options?.refetch ?? true) {
          await fetchIncomes()
        }
      } catch (err) {
        toastApiError(err, "Error al crear ingreso")
      }
    },
    [projectId, fetchIncomes]
  )

  const mutateUpdate = useCallback(
    async (incomeId: string, data: UpdateIncomeRequest, options?: MutationOptions) => {
      try {
        await incomeService.updateIncome(projectId, incomeId, data)
        toast.success("Ingreso actualizado")
        if (options?.refetch ?? true) {
          await fetchIncomes()
        }
      } catch (err) {
        toastApiError(err, "Error al actualizar ingreso")
      }
    },
    [projectId, fetchIncomes]
  )

  const mutateDelete = useCallback(
    async (income: IncomeResponse, options?: MutationOptions) => {
      try {
        await incomeService.deleteIncome(projectId, income.id)
        toast.success("Ingreso eliminado", {
          description: `"${income.title}" fue eliminado.`,
        })
        if (options?.refetch ?? true) {
          await fetchIncomes()
        }
      } catch (err) {
        toastApiError(err, "Error al eliminar ingreso")
      }
    },
    [projectId, fetchIncomes]
  )

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setPage(1)
  }, [])

  const handleSortChange = useCallback((s: string) => {
    setSort(s)
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
    sort,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    mutateCreate,
    mutateUpdate,
    mutateDelete,
    handlePageSizeChange,
    handleSortChange,
    refetch: fetchIncomes,
  }
}
