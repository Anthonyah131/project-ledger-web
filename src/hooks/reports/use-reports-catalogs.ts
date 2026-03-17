"use client"

import { useCallback, useEffect, useState } from "react"
import { toastApiError } from "@/lib/error-utils"
import * as projectService from "@/services/project-service"
import * as paymentMethodService from "@/services/payment-method-service"
import type { ProjectResponse } from "@/types/project"
import type { PaymentMethodResponse } from "@/types/payment-method"

export function useReportsCatalogs() {
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCatalogs = useCallback(async () => {
    setLoading(true)

    const [projectsResult, paymentMethodsResult] = await Promise.allSettled([
      projectService.getProjects({ pageSize: 200 }),
      paymentMethodService.getPaymentMethods(),
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
    loading,
    refetch: fetchCatalogs,
  }
}
