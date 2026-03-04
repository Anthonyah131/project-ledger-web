"use client"

// hooks/projects/use-project-obligations.ts
// State management for obligations within a project detail view.

import { useState, useCallback, useEffect, useMemo } from "react"
import { toast } from "sonner"
import * as obligationService from "@/services/obligation-service"
import { toastApiError } from "@/lib/error-utils"
import type {
  ObligationResponse,
  ObligationStatus,
  CreateObligationRequest,
  UpdateObligationRequest,
} from "@/types/obligation"
import type { MutationOptions } from "@/types/common"

export function useProjectObligations(projectId: string) {
  const [obligations, setObligations] = useState<ObligationResponse[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Pagination / sort / filter
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState("dueDate:asc")
  const [statusFilter, setStatusFilter] = useState<"all" | ObligationStatus>("all")

  // Modals
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ObligationResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ObligationResponse | null>(null)

  // ── Fetch ─────────────────────────────────────────────────

  const fetchObligations = useCallback(async () => {
    try {
      setLoading(true)
      const [sortBy, sortDirection] = sort.split(":") as [string, "asc" | "desc"]
      const data = await obligationService.getObligations(projectId, {
        page,
        pageSize,
        sortBy,
        sortDirection,
      })
      setObligations(data.items)
      setTotalCount(data.totalCount)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar obligaciones"
      toast.error("Error al cargar obligaciones", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [projectId, page, pageSize, sort])

  useEffect(() => {
    fetchObligations()
  }, [fetchObligations])

  // ── Filtered (client-side status filter) ──────────────────

  const filtered = useMemo(() => {
    if (statusFilter === "all") return obligations
    return obligations.filter((o) => o.status === statusFilter)
  }, [obligations, statusFilter])

  const hasFilter = statusFilter !== "all"

  // ── CRUD ──────────────────────────────────────────────────

  const mutateCreate = useCallback(
    async (data: CreateObligationRequest, options?: MutationOptions) => {
      try {
        await obligationService.createObligation(projectId, data)
        toast.success("Obligación creada")
        if (options?.refetch ?? true) {
          await fetchObligations()
        }
      } catch (err) {
        toastApiError(err, "Error al crear obligación")
      }
    },
    [projectId, fetchObligations]
  )

  const mutateUpdate = useCallback(
    async (
      obligationId: string,
      data: UpdateObligationRequest,
      options?: MutationOptions
    ) => {
      try {
        const updated = await obligationService.updateObligation(
          projectId,
          obligationId,
          data
        )
        if (options?.refetch ?? true) {
          await fetchObligations()
        } else {
          setObligations((prev) =>
            prev.map((o) => (o.id === obligationId ? updated : o))
          )
        }
        toast.success("Obligación actualizada")
      } catch (err) {
        toastApiError(err, "Error al actualizar obligación")
      }
    },
    [projectId, fetchObligations]
  )

  const mutateDelete = useCallback(
    async (obligation: ObligationResponse, options?: MutationOptions) => {
      try {
        await obligationService.deleteObligation(projectId, obligation.id)
        toast.success("Obligación eliminada", {
          description: `"${obligation.title}" fue eliminada.`,
        })
        if (options?.refetch ?? true) {
          await fetchObligations()
        } else {
          setObligations((prev) => prev.filter((o) => o.id !== obligation.id))
        }
      } catch (err) {
        toastApiError(err, "Error al eliminar obligación")
      }
    },
    [projectId, fetchObligations]
  )

  // ── Page/sort/filter handlers ─────────────────────────────

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setPage(1)
  }, [])

  const handleSortChange = useCallback((s: string) => {
    setSort(s)
    setPage(1)
  }, [])

  const handleStatusFilterChange = useCallback(
    (s: "all" | ObligationStatus) => {
      setStatusFilter(s)
      setPage(1)
    },
    []
  )

  return {
    obligations: filtered,
    total: hasFilter ? filtered.length : totalCount,
    loading,
    hasFilter,
    page, setPage,
    pageSize,
    sort,
    statusFilter,
    createOpen, setCreateOpen,
    editTarget, setEditTarget,
    deleteTarget, setDeleteTarget,
    mutateCreate,
    mutateUpdate,
    mutateDelete,
    handlePageSizeChange,
    handleSortChange,
    handleStatusFilterChange,
    refetch: fetchObligations,
  }
}
