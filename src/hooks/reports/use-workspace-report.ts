"use client"

// hooks/reports/use-workspace-report.ts
// State management + API orchestration for the workspace report view.

import { useState, useCallback } from "react"
import { toast } from "sonner"
import * as reportService from "@/services/report-service"
import { toastApiError } from "@/lib/error-utils"
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
      toast.warning("Selecciona un workspace para generar el reporte.")
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
      toastApiError(err, "Error al generar reporte del workspace")
    } finally {
      setLoading(false)
    }
  }, [filters.workspaceId, filters.from, filters.to, filters.currency])

  const exportReport = useCallback(
    async (format: "excel" | "pdf") => {
      const currentDateRangeError = getDateRangeError(filters.from, filters.to)
      if (currentDateRangeError) {
        toast.warning(currentDateRangeError)
        return
      }

      if (!filters.workspaceId) {
        toast.warning("Selecciona un workspace para exportar.")
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
          format === "excel" ? "Archivo Excel descargado" : "Archivo PDF descargado",
        )
      } catch (err) {
        toastApiError(err, `Error al exportar como ${format.toUpperCase()}`)
      } finally {
        setExporting(false)
      }
    },
    [filters.workspaceId, filters.from, filters.to, filters.currency],
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
