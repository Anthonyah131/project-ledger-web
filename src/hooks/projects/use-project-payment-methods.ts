"use client"

// hooks/projects/use-project-payment-methods.ts
// Manages payment methods linked to a project and the linkable ones (for add dialog).

import { useState, useCallback, useEffect, useMemo } from "react"
import { toast } from "sonner"
import * as ppService from "@/services/project-partner-service"
import { toastApiError } from "@/lib/error-utils"
import { useLanguage } from "@/context/language-context"
import type { ProjectPaymentMethodItem } from "@/types/project-partner"
import type { LinkablePaymentMethodItem } from "@/types/project-partner"
import type { PaymentMethodResponse } from "@/types/payment-method"

export function useProjectPaymentMethods(projectId: string) {
  const { t } = useLanguage()
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
      toastApiError(err, t("projectPaymentMethods.errors.load"))
    } finally {
      setLoading(false)
    }
  }, [projectId, t])

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
        toast.success(t("projectPaymentMethods.toast.linked"), {
          description: t("projectPaymentMethods.toast.linkedDesc", { name: pmName }),
        })
      } catch (err) {
        toastApiError(err, t("projectPaymentMethods.errors.link"))
      }
    },
    [projectId, fetchLinked, t],
  )

  // ── Unlink ───────────────────────────────────────────────

  const handleUnlink = useCallback(
    async (pm: ProjectPaymentMethodItem) => {
      try {
        await ppService.unlinkPaymentMethod(projectId, pm.id)
        setLinkedPMs((prev) => prev.filter((p) => p.id !== pm.id))
        setRemoveTarget(null)
        toast.success(t("projectPaymentMethods.toast.unlinked"), {
          description: t("projectPaymentMethods.toast.unlinkedDesc", { name: pm.paymentMethodName }),
        })
        return true
      } catch (err) {
        toastApiError(err, t("projectPaymentMethods.errors.unlink"))
        return false
      }
    },
    [projectId, t],
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
