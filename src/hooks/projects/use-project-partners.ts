"use client"

// hooks/projects/use-project-partners.ts
// State management for partners assigned to a project.

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import * as ppService from "@/services/project-partner-service"
import * as partnerService from "@/services/partner-service"
import { toastApiError } from "@/lib/error-utils"
import { useLanguage } from "@/context/language-context"
import { ApiClientError } from "@/lib/api-client"
import type { ProjectPartnerResponse } from "@/types/project-partner"
import type { PartnerResponse } from "@/types/partner"

export function useProjectPartners(projectId: string) {
  const { t } = useLanguage()
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
      toastApiError(err, t("projectPartners.errors.load"))
    } finally {
      setLoading(false)
    }
  }, [projectId, t])

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
        toast.success(t("projectPartners.toast.assigned"), {
          description: t("projectPartners.toast.assignedDesc", { name: created.partnerName }),
        })
      } catch (err) {
        toastApiError(err, t("projectPartners.errors.assign"))
      }
    },
    [projectId, t],
  )

  // ── Remove ─────────────────────────────────────────────────

  const handleRemove = useCallback(
    async (pp: ProjectPartnerResponse) => {
      try {
        await ppService.removeProjectPartner(projectId, pp.partnerId)
        setAssignedPartners((prev) => prev.filter((p) => p.id !== pp.id))
        toast.success(t("projectPartners.toast.removed"), {
          description: t("projectPartners.toast.removedDesc", { name: pp.partnerName }),
        })
        return true
      } catch (err) {
        if (err instanceof ApiClientError && err.code === "CONFLICT") {
          toast.warning(t("projectPartners.toast.cannotRemove"), {
            description: err.message,
          })
        } else {
          toastApiError(err, t("projectPartners.errors.remove"))
        }
        return false
      }
    },
    [projectId, t],
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
