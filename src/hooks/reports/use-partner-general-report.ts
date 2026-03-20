"use client"

// hooks/reports/use-partner-general-report.ts
// State management + API orchestration for the partner general report view.

import { useState, useCallback } from "react"
import { toast } from "sonner"
import * as reportService from "@/services/report-service"
import { toastApiError } from "@/lib/error-utils"
import { getDateRangeError } from "@/lib/date-utils"
import type { PartnerGeneralReportResponse } from "@/types/report"

export interface PartnerGeneralReportFilters {
  partnerId: string
  from: string
  to: string
}

export function usePartnerGeneralReport() {
  const [report, setReport] = useState<PartnerGeneralReportResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [filters, setFilters] = useState<PartnerGeneralReportFilters>({
    partnerId: "",
    from: "",
    to: "",
  })

  const dateRangeError = getDateRangeError(filters.from, filters.to)

  const updateFilter = useCallback(
    <K extends keyof PartnerGeneralReportFilters>(key: K, value: PartnerGeneralReportFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const fetchReport = useCallback(async () => {
    const currentDateRangeError = getDateRangeError(filters.from, filters.to)
    if (currentDateRangeError) {
      toast.warning(currentDateRangeError)
      return
    }

    if (!filters.partnerId) {
      toast.warning("Selecciona un partner para generar el reporte.")
      return
    }

    setLoading(true)
    setReport(null)

    try {
      const data = await reportService.getPartnerGeneralReport(filters.partnerId, {
        from: filters.from || undefined,
        to: filters.to || undefined,
        format: "json",
      })
      if (data) setReport(data)
    } catch (err) {
      toastApiError(err, "Error al generar reporte del partner")
    } finally {
      setLoading(false)
    }
  }, [filters.partnerId, filters.from, filters.to])

  const exportReport = useCallback(
    async (format: "excel") => {
      const currentDateRangeError = getDateRangeError(filters.from, filters.to)
      if (currentDateRangeError) {
        toast.warning(currentDateRangeError)
        return
      }

      if (!filters.partnerId) {
        toast.warning("Selecciona un partner para exportar.")
        return
      }

      setExporting(true)

      try {
        await reportService.getPartnerGeneralReport(filters.partnerId, {
          from: filters.from || undefined,
          to: filters.to || undefined,
          format,
        })
        toast.success("Archivo Excel descargado")
      } catch (err) {
        toastApiError(err, "Error al exportar como Excel")
      } finally {
        setExporting(false)
      }
    },
    [filters.partnerId, filters.from, filters.to],
  )

  return {
    report,
    loading,
    exporting,
    filters,
    dateRangeError,
    updateFilter,
    setFilters,
    fetchReport,
    exportReport,
  }
}
