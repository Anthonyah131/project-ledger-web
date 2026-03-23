"use client"

// hooks/partners/use-partner-detail.ts
// State management for the partner detail page.
// Loads partner data, payment methods and projects in parallel.

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import * as partnerService from "@/services/partner-service"
import { toastApiError } from "@/lib/error-utils"
import type {
  PartnerDetailResponse,
  PartnerPaymentMethodItem,
  PartnerProjectResponse,
} from "@/types/partner"
import type { UpdatePartnerRequest } from "@/types/partner"

const EMPTY_PM_PAGE = { items: [] as PartnerPaymentMethodItem[], totalCount: 0, page: 1, pageSize: 12, totalPages: 0, hasPreviousPage: false, hasNextPage: false }
const EMPTY_PROJ_PAGE = { items: [] as PartnerProjectResponse[], totalCount: 0, page: 1, pageSize: 12, totalPages: 0, hasPreviousPage: false, hasNextPage: false }

export function usePartnerDetail(partnerId: string) {
  const router = useRouter()

  const [partner, setPartner] = useState<PartnerDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Payment methods pagination + sort
  const [pmPage, setPmPage] = useState(1)
  const [pmPageSize, setPmPageSizeState] = useState(12)
  const [pmSort, setPmSortState] = useState("name:asc")
  const [pmData, setPmData] = useState(EMPTY_PM_PAGE)
  const [loadingPm, setLoadingPm] = useState(true)

  // Projects pagination + sort
  const [projPage, setProjPage] = useState(1)
  const [projPageSize, setProjPageSizeState] = useState(12)
  const [projSort, setProjSortState] = useState("name:asc")
  const [projData, setProjData] = useState(EMPTY_PROJ_PAGE)
  const [loadingProj, setLoadingProj] = useState(true)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const fetchPartner = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await partnerService.getPartner(partnerId)
      setPartner(data)
    } catch (err) {
      const msg = toastApiError(err, "Error al cargar partner")
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [partnerId])

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoadingPm(true)
      const [sortBy, sortDirection] = pmSort.split(":") as [string, "asc" | "desc"]
      const data = await partnerService.getPartnerPaymentMethods(partnerId, {
        page: pmPage,
        pageSize: pmPageSize,
        sortBy,
        sortDirection,
      })
      setPmData(data)
    } catch {
      // non-critical, silent
    } finally {
      setLoadingPm(false)
    }
  }, [partnerId, pmPage, pmPageSize, pmSort])

  const fetchProjects = useCallback(async () => {
    try {
      setLoadingProj(true)
      const [sortBy, sortDirection] = projSort.split(":") as [string, "asc" | "desc"]
      const data = await partnerService.getPartnerProjects(partnerId, {
        page: projPage,
        pageSize: projPageSize,
        sortBy,
        sortDirection,
      })
      setProjData(data)
    } catch {
      // non-critical, silent
    } finally {
      setLoadingProj(false)
    }
  }, [partnerId, projPage, projPageSize, projSort])

  useEffect(() => { void fetchPartner() }, [fetchPartner])
  useEffect(() => { void fetchPaymentMethods() }, [fetchPaymentMethods])
  useEffect(() => { void fetchProjects() }, [fetchProjects])

  // ── PM handlers ──────────────────────────────────────────────────────────────

  const handlePmPageSizeChange = useCallback((size: number) => {
    setPmPageSizeState(size)
    setPmPage(1)
  }, [])

  const handlePmSortChange = useCallback((s: string) => {
    setPmSortState(s)
    setPmPage(1)
  }, [])

  // ── Project handlers ─────────────────────────────────────────────────────────

  const handleProjPageSizeChange = useCallback((size: number) => {
    setProjPageSizeState(size)
    setProjPage(1)
  }, [])

  const handleProjSortChange = useCallback((s: string) => {
    setProjSortState(s)
    setProjPage(1)
  }, [])

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  const mutateUpdate = useCallback(
    async (id: string, data: UpdatePartnerRequest) => {
      try {
        const updated = await partnerService.updatePartner(id, data)
        setPartner((prev) => prev ? { ...prev, ...updated } : null)
        toast.success("Partner actualizado", { description: `"${updated.name}" se guardó correctamente.` })
        setEditOpen(false)
      } catch (err) {
        toastApiError(err, "Error al actualizar partner")
      }
    },
    [],
  )

  const mutateDelete = useCallback(
    async () => {
      if (!partner) return
      try {
        await partnerService.deletePartner(partner.id)
        toast.success("Partner eliminado", { description: `"${partner.name}" fue eliminado.` })
        router.push("/partners")
      } catch (err) {
        toastApiError(err, "Error al eliminar partner")
      }
    },
    [partner, router],
  )

  return {
    partner,
    loading,
    error,

    paymentMethods: pmData.items,
    pmTotalCount: pmData.totalCount,
    pmTotalPages: pmData.totalPages,
    pmPage, setPmPage,
    pmPageSize,
    pmSort,
    loadingPm,
    handlePmPageSizeChange,
    handlePmSortChange,

    projects: projData.items,
    projTotalCount: projData.totalCount,
    projTotalPages: projData.totalPages,
    projPage, setProjPage,
    projPageSize,
    projSort,
    loadingProj,
    handleProjPageSizeChange,
    handleProjSortChange,

    editOpen, setEditOpen,
    deleteOpen, setDeleteOpen,
    mutateUpdate,
    mutateDelete,
    refetch: fetchPartner,
  }
}
