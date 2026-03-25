"use client"

// hooks/reports/use-partner-balances-report.ts
// State management + API orchestration for the partner balances report view.

import { useState, useCallback } from "react"
import { toast } from "sonner"
import * as reportService from "@/services/report-service"
import { toastApiError } from "@/lib/error-utils"
import { useLanguage } from "@/context/language-context"
import { getDateRangeError } from "@/lib/date-utils"
import type { PartnerBalancesReportResponse, ReportFormat } from "@/types/report"

export interface PartnerBalancesReportFilters {
  projectId: string
  from: string
  to: string
  format: ReportFormat
}

export function usePartnerBalancesReport() {
  const { t } = useLanguage()
  const [report, setReport] = useState<PartnerBalancesReportResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [filters, setFilters] = useState<PartnerBalancesReportFilters>({
    projectId: "",
    from: "",
    to: "",
    format: "json",
  })

  const dateRangeError = getDateRangeError(filters.from, filters.to)

  const updateFilter = useCallback(
    <K extends keyof PartnerBalancesReportFilters>(key: K, value: PartnerBalancesReportFilters[K]) => {
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

    if (!filters.projectId) {
      toast.warning(t("reports.warnings.selectProjectToGenerate"))
      return
    }

    setLoading(true)
    setReport(null)

    try {
      const data = await reportService.getPartnerBalancesReport(filters.projectId, {
        from: filters.from || undefined,
        to: filters.to || undefined,
        format: "json",
      })
      if (data) setReport(data)
    } catch (err) {
      toastApiError(err, t("reports.errors.generate"))
    } finally {
      setLoading(false)
    }
  }, [filters.projectId, filters.from, filters.to, t])

  const exportReport = useCallback(
    async (format: "excel" | "pdf") => {
      const currentDateRangeError = getDateRangeError(filters.from, filters.to)
      if (currentDateRangeError) {
        toast.warning(currentDateRangeError)
        return
      }

      if (!filters.projectId) {
        toast.warning(t("reports.warnings.selectProjectToExport"))
        return
      }

      setExporting(true)

      try {
        await reportService.getPartnerBalancesReport(filters.projectId, {
          from: filters.from || undefined,
          to: filters.to || undefined,
          format,
        })
        toast.success(
          format === "excel" ? t("reports.toast.excelDownloaded") : t("reports.toast.pdfDownloaded"),
        )
      } catch (err) {
        toastApiError(err, t("reports.errors.export", { format: format.toUpperCase() }))
      } finally {
        setExporting(false)
      }
    },
    [filters.projectId, filters.from, filters.to, t],
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
