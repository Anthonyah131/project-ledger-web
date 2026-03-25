"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import * as alternativeCurrencyService from "@/services/alternative-currency-service"
import * as currencyService from "@/services/currency-service"
import { toastApiError } from "@/lib/error-utils"
import { useLanguage } from "@/context/language-context"
import type { CurrencyResponse } from "@/types/currency"
import type {
  AddAlternativeCurrencyRequest,
  ProjectAlternativeCurrencyResponse,
} from "@/types/project-alternative-currency"

export function useProjectAlternativeCurrencies(projectId: string) {
  const { t } = useLanguage()
  const [currencies, setCurrencies] = useState<ProjectAlternativeCurrencyResponse[]>([])
  const [allCurrencies, setAllCurrencies] = useState<CurrencyResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [catalogLoading, setCatalogLoading] = useState(false)

  const fetchProjectCurrencies = useCallback(async () => {
    try {
      setLoading(true)
      const data = await alternativeCurrencyService.getAlternativeCurrencies(projectId)
      setCurrencies(data)
    } catch (err) {
      toastApiError(err, t("alternativeCurrencies.errors.load"))
    } finally {
      setLoading(false)
    }
  }, [projectId, t])

  const fetchCatalog = useCallback(async () => {
    try {
      setCatalogLoading(true)
      const data = await currencyService.getCurrencies()
      setAllCurrencies(data)
    } catch {
      // Non-critical; project currencies can still render.
    } finally {
      setCatalogLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchProjectCurrencies(), fetchCatalog()])
  }, [fetchProjectCurrencies, fetchCatalog])

  const mutateAdd = useCallback(
    async (data: AddAlternativeCurrencyRequest) => {
      try {
        const created = await alternativeCurrencyService.addAlternativeCurrency(projectId, data)
        setCurrencies((prev) => [...prev, created])
        toast.success(t("alternativeCurrencies.toast.added"), {
          description: t("alternativeCurrencies.toast.addedDesc", { code: created.currencyCode }),
        })
      } catch (err) {
        toastApiError(err, t("alternativeCurrencies.errors.add"))
      }
    },
    [projectId, t]
  )

  const mutateDelete = useCallback(
    async (currency: ProjectAlternativeCurrencyResponse) => {
      try {
        await alternativeCurrencyService.deleteAlternativeCurrency(projectId, currency.currencyCode)
        setCurrencies((prev) => prev.filter((c) => c.id !== currency.id))
        toast.success(t("alternativeCurrencies.toast.deleted"), {
          description: t("alternativeCurrencies.toast.deletedDesc", { code: currency.currencyCode }),
        })
        return true
      } catch (err) {
        toastApiError(err, t("alternativeCurrencies.errors.delete"))
        return false
      }
    },
    [projectId, t]
  )

  return {
    currencies,
    allCurrencies,
    loading,
    catalogLoading,
    mutateAdd,
    mutateDelete,
    refetch: fetchProjectCurrencies,
  }
}
