"use client"

// hooks/partners/use-partners.ts
// State management for the partners list (CRUD).

import { useState, useCallback, useEffect, useMemo } from "react"
import { toast } from "sonner"
import * as partnerService from "@/services/partner-service"
import { toastApiError } from "@/lib/error-utils"
import { useLanguage } from "@/context/language-context"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type {
  PartnerResponse,
  CreatePartnerRequest,
  UpdatePartnerRequest,
} from "@/types/partner"
import type { ViewMode } from "@/types/project"

export function usePartners() {
  const { t } = useLanguage()
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
      const msg = toastApiError(err, t("partners.errors.load"))
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, page, pageSize, sort, t])

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const hasSearch = !!debouncedQuery

  const globalIndex = useMemo(() => (page - 1) * pageSize, [page, pageSize])

  const mutateCreate = useCallback(
    async (data: CreatePartnerRequest) => {
      try {
        const created = await partnerService.createPartner(data)
        toast.success(t("partners.toast.created"), { description: t("partners.toast.createdDesc", { name: created.name }) })
        await fetchPartners()
      } catch (err) {
        toastApiError(err, t("partners.errors.create"))
      }
    },
    [fetchPartners, t],
  )

  const mutateUpdate = useCallback(
    async (id: string, data: UpdatePartnerRequest) => {
      try {
        const updated = await partnerService.updatePartner(id, data)
        toast.success(t("partners.toast.updated"), { description: t("partners.toast.updatedDesc", { name: updated.name }) })
        await fetchPartners()
      } catch (err) {
        toastApiError(err, t("partners.errors.update"))
      }
    },
    [fetchPartners, t],
  )

  const mutateDelete = useCallback(
    async (partner: PartnerResponse) => {
      try {
        await partnerService.deletePartner(partner.id)
        toast.success(t("partners.toast.deleted"), { description: t("partners.toast.deletedDesc", { name: partner.name }) })
        await fetchPartners()
        return true
      } catch (err) {
        toastApiError(err, t("partners.errors.delete"))
        return false
      }
    },
    [fetchPartners, t],
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
