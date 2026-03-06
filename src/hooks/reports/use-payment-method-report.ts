"use client"

// hooks/reports/use-payment-method-report.ts
// State management + API orchestration for the payment method report view.

import { useState, useCallback } from "react"
import { toast } from "sonner"
import * as reportService from "@/services/report-service"
import { toastApiError } from "@/lib/error-utils"
import type { PaymentMethodReportResponse, ReportFormat } from "@/types/report"

export interface PaymentMethodReportFilters {
  from: string
  to: string
  paymentMethodId: string
  format: ReportFormat
}

export function usePaymentMethodReport() {
  const [report, setReport] = useState<PaymentMethodReportResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [filters, setFilters] = useState<PaymentMethodReportFilters>({
    from: "",
    to: "",
    paymentMethodId: "",
    format: "json",
  })

  const updateFilter = useCallback(
    <K extends keyof PaymentMethodReportFilters>(key: K, value: PaymentMethodReportFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  // Fetch JSON report
  const fetchReport = useCallback(async () => {
    setLoading(true)
    setReport(null)

    try {
      const data = await reportService.getPaymentMethodReport({
        from: filters.from || undefined,
        to: filters.to || undefined,
        paymentMethodId: filters.paymentMethodId || undefined,
        format: "json",
      })
      if (data) setReport(data)
    } catch (err) {
      toastApiError(err, "Error al generar reporte")
    } finally {
      setLoading(false)
    }
  }, [filters.from, filters.to, filters.paymentMethodId])

  // Export as Excel or PDF
  const exportReport = useCallback(
    async (format: "excel" | "pdf") => {
      setExporting(true)

      try {
        await reportService.getPaymentMethodReport({
          from: filters.from || undefined,
          to: filters.to || undefined,
          paymentMethodId: filters.paymentMethodId || undefined,
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
    [filters.from, filters.to, filters.paymentMethodId],
  )

  return {
    report,
    loading,
    exporting,
    filters,
    updateFilter,
    setFilters,
    fetchReport,
    exportReport,
  }
}
