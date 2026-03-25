"use client"

// hooks/reports/use-workspace-report.ts
// State management + API orchestration for the workspace report view.

import { useState, useCallback } from "react"
import { toast } from "sonner"
import * as reportService from "@/services/report-service"
import { toastApiError } from "@/lib/error-utils"
import { useLanguage } from "@/context/language-context"
import { getDateRangeError } from "@/lib/date-utils"
import type { WorkspaceReportResponse, ReportFormat } from "@/types/report"

export interface WorkspaceReportFilters {
  workspaceId: string
  from: string
  to: string
  currency: string
  format: ReportFormat
}

export function useWorkspaceReport() {
  const { t } = useLanguage()
  const [report, setReport] = useState<WorkspaceReportResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [filters, setFilters] = useState<WorkspaceReportFilters>({
    workspaceId: "",
    from: "",
    to: "",
    currency: "",
    format: "json",
  })

  const dateRangeError = getDateRangeError(filters.from, filters.to)

  const updateFilter = useCallback(
    <K extends keyof WorkspaceReportFilters>(key: K, value: WorkspaceReportFilters[K]) => {
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

    if (!filters.workspaceId) {
      toast.warning(t("reports.warnings.selectWorkspaceToGenerate"))
      return
    }

    setLoading(true)
    setReport(null)

    try {
      const data = await reportService.getWorkspaceReport(filters.workspaceId, {
        from: filters.from || undefined,
        to: filters.to || undefined,
        currency: filters.currency || undefined,
        format: "json",
      })
      if (data) setReport(data)
    } catch (err) {
      toastApiError(err, t("reports.errors.generate"))
    } finally {
      setLoading(false)
    }
  }, [filters.workspaceId, filters.from, filters.to, filters.currency, t])

  const exportReport = useCallback(
    async (format: "excel" | "pdf") => {
      const currentDateRangeError = getDateRangeError(filters.from, filters.to)
      if (currentDateRangeError) {
        toast.warning(currentDateRangeError)
        return
      }

      if (!filters.workspaceId) {
        toast.warning(t("reports.warnings.selectWorkspaceToExport"))
        return
      }

      setExporting(true)

      try {
        await reportService.getWorkspaceReport(filters.workspaceId, {
          from: filters.from || undefined,
          to: filters.to || undefined,
          currency: filters.currency || undefined,
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
    [filters.workspaceId, filters.from, filters.to, filters.currency, t],
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
