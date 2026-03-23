"use client"

// hooks/projects/use-project-payment-methods.ts
// Manages payment methods linked to a project and the linkable ones (for add dialog).

import { useState, useCallback, useEffect, useMemo } from "react"
import { toast } from "sonner"
import * as ppService from "@/services/project-partner-service"
import { toastApiError } from "@/lib/error-utils"
import type { ProjectPaymentMethodItem } from "@/types/project-partner"
import type { LinkablePaymentMethodItem } from "@/types/project-partner"
import type { PaymentMethodResponse } from "@/types/payment-method"

export function useProjectPaymentMethods(projectId: string) {
  // ── Linked payment methods ───────────────────────────────
  const [linkedPMs, setLinkedPMs] = useState<ProjectPaymentMethodItem[]>([])
  const [loading, setLoading] = useState(true)

  // ── Linkable payment methods (for add dialog, lazy) ─────
  const [linkableItems, setLinkableItems] = useState<LinkablePaymentMethodItem[]>([])
  const [linkableLoading, setLinkableLoading] = useState(false)

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
      toastApiError(err, "Error al cargar métodos de pago");
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchLinked()
  }, [fetchLinked])

  // ── Fetch linkable (triggered when add dialog opens) ────

  const fetchLinkable = useCallback(async () => {
    try {
      setLinkableLoading(true)
      const data = await ppService.getLinkablePaymentMethods(projectId)
      setLinkableItems(data)
    } catch {
      // non-critical
    } finally {
      setLinkableLoading(false)
    }
  }, [projectId])

  const openAddDialog = useCallback(() => {
    setAddOpen(true)
    fetchLinkable()
  }, [fetchLinkable])

  // ── Link ─────────────────────────────────────────────────

  const handleLink = useCallback(
    async (pmId: string, pmName: string) => {
      try {
        await ppService.linkPaymentMethod(projectId, { paymentMethodId: pmId })
        // Remove linked item from local linkable list immediately
        setLinkableItems((prev) => prev.filter((pm) => pm.id !== pmId))
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
          description: `"${pm.paymentMethodName}" fue quitado del proyecto.`,
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
        id: pm.paymentMethodId,
        name: pm.paymentMethodName,
        type: pm.type,
        currency: pm.currency,
        bankName: pm.bankName,
        accountNumber: pm.accountNumber,
        description: null,
        partner_id: pm.partnerId,
        partner:
          pm.partnerName && pm.partnerId
            ? { id: pm.partnerId, name: pm.partnerName, email: null, phone: null }
            : null,
        createdAt: "",
        updatedAt: "",
      })),
    [linkedPMs],
  )

  return {
    linkedPMs,
    loading,
    linkableItems,
    linkableLoading,
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
