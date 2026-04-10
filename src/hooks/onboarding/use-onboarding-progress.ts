"use client"

import { useState, useCallback } from "react"
import { getPartners } from "@/services/partner-service"
import { getPaymentMethodsLookup, getPaymentMethod } from "@/services/payment-method-service"
import { getProjects } from "@/services/project-service"
import { getProjectPartners, getProjectPaymentMethods } from "@/services/project-partner-service"

export interface OnboardingProgress {
  steps: [boolean, boolean, boolean, boolean, boolean, boolean]
  firstProjectId: string | null
  firstPaymentMethodId: string | null
  loading: boolean
}

export function useOnboardingProgress() {
  const [progress, setProgress] = useState<OnboardingProgress>({
    steps: [false, false, false, false, false, false],
    firstProjectId: null,
    firstPaymentMethodId: null,
    loading: false,
  })

  const refresh = useCallback(async () => {
    setProgress((prev) => ({ ...prev, loading: true }))
    try {
      const [partnersRes, pmsRes, projectsRes] = await Promise.all([
        getPartners({ pageSize: 1 }),
        getPaymentMethodsLookup({ pageSize: 1 }),
        getProjects({ pageSize: 1 }),
      ])

      const hasPartners = partnersRes.totalCount > 0
      const hasPMs = pmsRes.totalCount > 0
      const hasProjects = projectsRes.totalCount > 0 || projectsRes.items.length > 0

      const firstProjectId =
        projectsRes.pinned?.[0]?.id ?? projectsRes.items?.[0]?.id ?? null
      const firstPaymentMethodId = pmsRes.items?.[0]?.id ?? null

      let hasPMPartner = false
      let hasProjectPartner = false
      let hasProjectPM = false

      await Promise.all([
        firstPaymentMethodId
          ? getPaymentMethod(firstPaymentMethodId).then((pm) => {
              hasPMPartner = !!pm.partner
            })
          : Promise.resolve(),
        firstProjectId
          ? Promise.all([
              getProjectPartners(firstProjectId).then((pp) => {
                hasProjectPartner = pp.length > 0
              }),
              getProjectPaymentMethods(firstProjectId).then((ppm) => {
                const pmItems = Array.isArray(ppm) ? ppm : (ppm.items ?? [])
                hasProjectPM = pmItems.length > 0
              }),
            ])
          : Promise.resolve(),
      ])

      setProgress({
        steps: [hasPartners, hasPMs, hasPMPartner, hasProjects, hasProjectPartner, hasProjectPM],
        firstProjectId,
        firstPaymentMethodId,
        loading: false,
      })
    } catch {
      setProgress((prev) => ({ ...prev, loading: false }))
    }
  }, [])

  return { progress, refresh }
}
