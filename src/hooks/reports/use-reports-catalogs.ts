"use client"

import { useCallback, useEffect, useState } from "react"
import { toastApiError } from "@/lib/error-utils"
import * as projectService from "@/services/project-service"
import * as paymentMethodService from "@/services/payment-method-service"
import * as workspaceService from "@/services/workspace-service"
import * as partnerService from "@/services/partner-service"
import type { ProjectResponse } from "@/types/project"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { WorkspaceResponse } from "@/types/workspace"
import type { PartnerResponse } from "@/types/partner"

export function useReportsCatalogs() {
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([])
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([])
  const [partners, setPartners] = useState<PartnerResponse[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCatalogs = useCallback(async () => {
    setLoading(true)

    const [projectsResult, paymentMethodsResult, workspacesResult, partnersResult] = await Promise.allSettled([
      projectService.getProjects({ pageSize: 200 }),
      paymentMethodService.getPaymentMethods(),
      workspaceService.getWorkspaces(),
      partnerService.getPartners({ pageSize: 200 }),
    ])

    if (projectsResult.status === "fulfilled") {
      setProjects(projectsResult.value.items)
    } else {
      setProjects([])
      toastApiError(projectsResult.reason, "No se pudieron cargar los proyectos")
    }

    if (paymentMethodsResult.status === "fulfilled") {
      setPaymentMethods(paymentMethodsResult.value)
    } else {
      setPaymentMethods([])
      toastApiError(paymentMethodsResult.reason, "No se pudieron cargar los métodos de pago")
    }

    if (workspacesResult.status === "fulfilled") {
      setWorkspaces(workspacesResult.value)
    } else {
      setWorkspaces([])
    }

    if (partnersResult.status === "fulfilled") {
      setPartners(partnersResult.value.items)
    } else {
      setPartners([])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => {
      void fetchCatalogs()
    })
  }, [fetchCatalogs])

  return {
    projects,
    paymentMethods,
    workspaces,
    partners,
    loading,
    refetch: fetchCatalogs,
  }
}
