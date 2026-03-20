"use client"

// hooks/partners/use-partners.ts
// State management for the partners list (CRUD).

import { useState, useCallback, useEffect, useMemo } from "react"
import { toast } from "sonner"
import * as partnerService from "@/services/partner-service"
import { toastApiError } from "@/lib/error-utils"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type {
  PartnerResponse,
  CreatePartnerRequest,
  UpdatePartnerRequest,
} from "@/types/partner"
import type { ViewMode } from "@/types/project"

export function usePartners() {
  const [partners, setPartners] = useState<PartnerResponse[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<ViewMode>("shelf")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("name:asc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(12)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PartnerResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PartnerResponse | null>(null)

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSizeState(size)
    setPage(1)
  }, [])

  const handleSortChange = useCallback((s: string) => {
    setSort(s)
    setPage(1)
  }, [])

  const resetPage = useCallback(() => setPage(1), [])
  const debouncedQuery = useDebouncedValue(query, 350, resetPage)

  const fetchPartners = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const [sortBy, sortDirection] = sort.split(":") as [string, "asc" | "desc"]
      const data = await partnerService.getPartners({
        search: debouncedQuery || undefined,
        page,
        pageSize,
        sortBy,
        sortDirection,
      })
      setPartners(data.items)
      setTotalCount(data.totalCount)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar partners"
      setError(msg)
      toast.error("Error al cargar partners", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, page, pageSize, sort])

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const hasSearch = !!debouncedQuery

  const globalIndex = useMemo(() => (page - 1) * pageSize, [page, pageSize])

  const mutateCreate = useCallback(
    async (data: CreatePartnerRequest) => {
      try {
        const created = await partnerService.createPartner(data)
        toast.success("Partner creado", { description: `"${created.name}" se agregó correctamente.` })
        await fetchPartners()
      } catch (err) {
        toastApiError(err, "Error al crear partner")
      }
    },
    [fetchPartners],
  )

  const mutateUpdate = useCallback(
    async (id: string, data: UpdatePartnerRequest) => {
      try {
        const updated = await partnerService.updatePartner(id, data)
        toast.success("Partner actualizado", { description: `"${updated.name}" se guardó correctamente.` })
        await fetchPartners()
      } catch (err) {
        toastApiError(err, "Error al actualizar partner")
      }
    },
    [fetchPartners],
  )

  const mutateDelete = useCallback(
    async (partner: PartnerResponse) => {
      try {
        await partnerService.deletePartner(partner.id)
        toast.success("Partner eliminado", { description: `"${partner.name}" fue eliminado.` })
        await fetchPartners()
        return true
      } catch (err) {
        toastApiError(err, "Error al eliminar partner")
        return false
      }
    },
    [fetchPartners],
  )

  return {
    partners,
    totalCount,
    loading,
    error,
    hasSearch,
    globalIndex,
    viewMode, setViewMode,
    page, setPage,
    pageSize,
    sort,
    query, setQuery,
    createOpen, setCreateOpen,
    editTarget, setEditTarget,
    deleteTarget, setDeleteTarget,
    mutateCreate,
    mutateUpdate,
    mutateDelete,
    handlePageSizeChange,
    handleSortChange,
    refetch: fetchPartners,
  }
}
