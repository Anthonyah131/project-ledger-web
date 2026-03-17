"use client"

// hooks/partners/use-partner-detail.ts
// State management for the partner detail page.

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import * as partnerService from "@/services/partner-service"
import { toastApiError } from "@/lib/error-utils"
import type { PartnerDetailResponse, PartnerProjectResponse, UpdatePartnerRequest } from "@/types/partner"

export function usePartnerDetail(partnerId: string) {
  const router = useRouter()
  const [partner, setPartner] = useState<PartnerDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const fetchPartner = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await partnerService.getPartner(partnerId)
      setPartner(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar partner"
      setError(msg)
      toast.error("Error al cargar partner", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [partnerId])

  useEffect(() => {
    fetchPartner()
  }, [fetchPartner])

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

  const relatedProjects: PartnerProjectResponse[] = partner?.projects ?? []

  return {
    partner,
    relatedProjects,
    loading,
    loadingProjects: false,
    error,
    editOpen, setEditOpen,
    deleteOpen, setDeleteOpen,
    mutateUpdate,
    mutateDelete,
    refetch: fetchPartner,
  }
}
