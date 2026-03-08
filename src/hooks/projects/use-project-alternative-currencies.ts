"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import * as alternativeCurrencyService from "@/services/alternative-currency-service"
import * as currencyService from "@/services/currency-service"
import { toastApiError } from "@/lib/error-utils"
import type { CurrencyResponse } from "@/types/currency"
import type {
  AddAlternativeCurrencyRequest,
  ProjectAlternativeCurrencyResponse,
} from "@/types/project-alternative-currency"

export function useProjectAlternativeCurrencies(projectId: string) {
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
      const msg = err instanceof Error ? err.message : "Error al cargar monedas alternativas"
      toast.error("Error al cargar monedas alternativas", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [projectId])

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
    fetchProjectCurrencies()
    fetchCatalog()
  }, [fetchProjectCurrencies, fetchCatalog])

  const mutateAdd = useCallback(
    async (data: AddAlternativeCurrencyRequest) => {
      try {
        const created = await alternativeCurrencyService.addAlternativeCurrency(projectId, data)
        setCurrencies((prev) => [...prev, created])
        toast.success("Moneda alternativa agregada", {
          description: `${created.currencyCode} fue agregada al proyecto.`,
        })
      } catch (err) {
        toastApiError(err, "Error al agregar moneda alternativa")
      }
    },
    [projectId]
  )

  const mutateDelete = useCallback(
    async (currency: ProjectAlternativeCurrencyResponse) => {
      try {
        await alternativeCurrencyService.deleteAlternativeCurrency(projectId, currency.currencyCode)
        setCurrencies((prev) => prev.filter((c) => c.id !== currency.id))
        toast.success("Moneda alternativa eliminada", {
          description: `${currency.currencyCode} fue removida del proyecto.`,
        })
      } catch (err) {
        toastApiError(err, "Error al eliminar moneda alternativa")
      }
    },
    [projectId]
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
