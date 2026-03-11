"use client"

// hooks/projects/use-project-payment-methods.ts
// State management for payment methods linked to a project.

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import * as ppmService from "@/services/project-payment-method-service"
import * as pmService from "@/services/payment-method-service"
import { toastApiError } from "@/lib/error-utils"
import type { ProjectPaymentMethodResponse } from "@/types/project-payment-method"
import type { PaymentMethodResponse } from "@/types/payment-method"

export function useProjectPaymentMethods(projectId: string) {
  // Linked payment methods (project-scoped)
  const [linkedMethods, setLinkedMethods] = useState<ProjectPaymentMethodResponse[]>([])
  const [loading, setLoading] = useState(true)

  // Owner's own payment methods (for the "link" dialog)
  const [availableMethods, setAvailableMethods] = useState<PaymentMethodResponse[]>([])
  const [availableLoading, setAvailableLoading] = useState(false)

  // Modal state
  const [linkOpen, setLinkOpen] = useState(false)
  const [unlinkTarget, setUnlinkTarget] = useState<ProjectPaymentMethodResponse | null>(null)

  // ── Fetch linked ──────────────────────────────────────────

  const fetchLinked = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ppmService.getProjectPaymentMethods(projectId)
      setLinkedMethods(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar métodos vinculados"
      toast.error("Error al cargar métodos de pago", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchLinked()
  }, [fetchLinked])

  // ── Fetch available (owner's methods) ─────────────────────

  const fetchAvailable = useCallback(async () => {
    try {
      setAvailableLoading(true)
      const data = await pmService.getPaymentMethods()
      setAvailableMethods(data)
    } catch {
      // non-critical
    } finally {
      setAvailableLoading(false)
    }
  }, [])

  // Fetch when opening the link dialog
  const openLinkDialog = useCallback(() => {
    fetchAvailable()
    setLinkOpen(true)
  }, [fetchAvailable])

  // ── Link ──────────────────────────────────────────────────

  const handleLink = useCallback(
    async (paymentMethodId: string) => {
      try {
        const created = await ppmService.linkPaymentMethod(projectId, { paymentMethodId })
        setLinkedMethods((prev) => [...prev, created])
        toast.success("Método vinculado", {
          description: `"${created.paymentMethodName}" se vinculó al proyecto.`,
        })
      } catch (err) {
        toastApiError(err, "Error al vincular método de pago")
      }
    },
    [projectId],
  )

  // ── Unlink ────────────────────────────────────────────────

  const handleUnlink = useCallback(
    async (pm: ProjectPaymentMethodResponse) => {
      try {
        await ppmService.unlinkPaymentMethod(projectId, pm.paymentMethodId)
        setLinkedMethods((prev) => prev.filter((m) => m.id !== pm.id))
        toast.success("Método desvinculado", {
          description: `"${pm.paymentMethodName}" fue desvinculado del proyecto.`,
        })
        return true
      } catch (err) {
        toastApiError(err, "Error al desvincular método de pago")
        return false
      }
    },
    [projectId],
  )

  return {
    linkedMethods,
    loading,
    availableMethods,
    availableLoading,
    linkOpen,
    setLinkOpen,
    openLinkDialog,
    unlinkTarget,
    setUnlinkTarget,
    handleLink,
    handleUnlink,
    refetch: fetchLinked,
  }
}
