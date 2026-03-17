"use client"

// hooks/projects/use-project-payment-methods.ts
// Manages payment methods linked to a project and the available ones (for add dialog).

import { useState, useCallback, useEffect, useMemo } from "react"
import { toast } from "sonner"
import * as ppService from "@/services/project-partner-service"
import { toastApiError } from "@/lib/error-utils"
import type {
  AvailablePaymentMethodsPartnerItem,
  ProjectPaymentMethodItem,
} from "@/types/project-partner"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { PartnerPaymentMethodItem } from "@/types/partner"

export function useProjectPaymentMethods(projectId: string) {
  // ── Linked payment methods ───────────────────────────────
  const [linkedPMs, setLinkedPMs] = useState<ProjectPaymentMethodItem[]>([])
  const [loading, setLoading] = useState(true)

  // ── Available payment methods (for add dialog, lazy) ────
  const [availableGroups, setAvailableGroups] = useState<AvailablePaymentMethodsPartnerItem[]>([])
  const [unpartneredPMs, setUnpartneredPMs] = useState<PartnerPaymentMethodItem[]>([])
  const [availableLoading, setAvailableLoading] = useState(false)

  // ── Dialog state ─────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<ProjectPaymentMethodItem | null>(null)

  // ── Fetch linked ─────────────────────────────────────────

  const fetchLinked = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ppService.getProjectPaymentMethods(projectId)
      setLinkedPMs(Array.isArray(data) ? data : (data.items ?? []))
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar métodos de pago"
      toast.error("Error al cargar métodos de pago", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchLinked()
  }, [fetchLinked])

  // ── Fetch available (triggered when add dialog opens) ───

  const fetchAvailable = useCallback(async () => {
    try {
      setAvailableLoading(true)
      const data = await ppService.getProjectAvailablePaymentMethods(projectId)
      setUnpartneredPMs(data.unpartneredPaymentMethods ?? [])
      setAvailableGroups(data.partners)
    } catch {
      // non-critical
    } finally {
      setAvailableLoading(false)
    }
  }, [projectId])

  const openAddDialog = useCallback(() => {
    setAddOpen(true)
    fetchAvailable()
  }, [fetchAvailable])

  // ── Link ─────────────────────────────────────────────────

  const handleLink = useCallback(
    async (pmId: string, pmName: string) => {
      try {
        await ppService.linkPaymentMethod(projectId, { paymentMethodId: pmId })
        await fetchLinked()
        toast.success("Método de pago vinculado", {
          description: `"${pmName}" fue vinculado al proyecto.`,
        })
      } catch (err) {
        toastApiError(err, "Error al vincular método de pago")
      }
    },
    [projectId, fetchLinked],
  )

  // ── Unlink ───────────────────────────────────────────────

  const handleUnlink = useCallback(
    async (pm: ProjectPaymentMethodItem) => {
      try {
        await ppService.unlinkPaymentMethod(projectId, pm.id)
        setLinkedPMs((prev) => prev.filter((p) => p.id !== pm.id))
        setRemoveTarget(null)
        toast.success("Método de pago quitado", {
          description: `"${pm.name}" fue quitado del proyecto.`,
        })
        return true
      } catch (err) {
        toastApiError(err, "Error al quitar método de pago")
        return false
      }
    },
    [projectId],
  )

  // ── Flat list for expense/income selectors ───────────────

  const paymentMethods: PaymentMethodResponse[] = useMemo(
    () =>
      linkedPMs.map((pm) => ({
        id: pm.id,
        name: pm.name,
        type: pm.type,
        currency: pm.currency,
        bankName: pm.bankName,
        accountNumber: pm.accountNumber,
        description: null,
        partner_id: pm.partner_id,
        partner:
          pm.partnerName && pm.partner_id
            ? { id: pm.partner_id, name: pm.partnerName, email: null, phone: null }
            : null,
        createdAt: "",
        updatedAt: "",
      })),
    [linkedPMs],
  )

  return {
    linkedPMs,
    loading,
    availableGroups,
    unpartneredPMs,
    availableLoading,
    addOpen,
    setAddOpen,
    removeTarget,
    setRemoveTarget,
    paymentMethods,
    refetch: fetchLinked,
    openAddDialog,
    handleLink,
    handleUnlink,
  }
}
