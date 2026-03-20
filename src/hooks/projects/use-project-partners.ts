"use client"

// hooks/projects/use-project-partners.ts
// State management for partners assigned to a project.

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import * as ppService from "@/services/project-partner-service"
import * as partnerService from "@/services/partner-service"
import { toastApiError } from "@/lib/error-utils"
import { ApiClientError } from "@/lib/api-client"
import type { ProjectPartnerResponse } from "@/types/project-partner"
import type { PartnerResponse } from "@/types/partner"

export function useProjectPartners(projectId: string) {
  const [assignedPartners, setAssignedPartners] = useState<ProjectPartnerResponse[]>([])
  const [loading, setLoading] = useState(true)

  // Available partners (for the assign dialog)
  const [availablePartners, setAvailablePartners] = useState<PartnerResponse[]>([])
  const [availableLoading, setAvailableLoading] = useState(false)

  // Modal state
  const [assignOpen, setAssignOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<ProjectPartnerResponse | null>(null)

  // ── Fetch assigned ─────────────────────────────────────────

  const fetchAssigned = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ppService.getProjectPartners(projectId)
      setAssignedPartners(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar partners del proyecto"
      toast.error("Error al cargar partners", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchAssigned()
  }, [fetchAssigned])

  // ── Fetch available (user's own partners) ──────────────────

  const fetchAvailable = useCallback(async () => {
    try {
      setAvailableLoading(true)
      const data = await partnerService.getPartners({ pageSize: 100 })
      setAvailablePartners(data.items)
    } catch {
      // non-critical
    } finally {
      setAvailableLoading(false)
    }
  }, [])

  const openAssignDialog = useCallback(() => {
    fetchAvailable()
    setAssignOpen(true)
  }, [fetchAvailable])

  // ── Assign ─────────────────────────────────────────────────

  const handleAssign = useCallback(
    async (partnerId: string) => {
      try {
        const created = await ppService.assignPartner(projectId, { partnerId })
        setAssignedPartners((prev) => [...prev, created])
        toast.success("Partner asignado", {
          description: `"${created.partnerName}" fue asignado al proyecto.`,
        })
      } catch (err) {
        toastApiError(err, "Error al asignar partner")
      }
    },
    [projectId],
  )

  // ── Remove ─────────────────────────────────────────────────

  const handleRemove = useCallback(
    async (pp: ProjectPartnerResponse) => {
      try {
        await ppService.removeProjectPartner(projectId, pp.partnerId)
        setAssignedPartners((prev) => prev.filter((p) => p.id !== pp.id))
        toast.success("Partner quitado", {
          description: `"${pp.partnerName}" fue quitado del proyecto.`,
        })
        return true
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 409) {
          toast.warning("No se puede quitar el partner", {
            description: `"${pp.partnerName}" tiene métodos de pago vinculados al proyecto. Desvincula primero esos métodos de pago.`,
          })
        } else {
          toastApiError(err, "Error al quitar partner")
        }
        return false
      }
    },
    [projectId],
  )

  return {
    assignedPartners,
    loading,
    availablePartners,
    availableLoading,
    assignOpen,
    setAssignOpen,
    openAssignDialog,
    removeTarget,
    setRemoveTarget,
    handleAssign,
    handleRemove,
    refetch: fetchAssigned,
  }
}
