"use client"

// views/reports/reports-view.tsx
// Orchestrator for the reports page — two report tabs:
// 1) Project expense report (per project)
// 2) Payment method report (user-level)

import { useCallback, useEffect, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useReportsCatalogs } from "@/hooks/reports/use-reports-catalogs"
import { useExpenseReport } from "@/hooks/reports/use-expense-report"
import { usePaymentMethodReport } from "@/hooks/reports/use-payment-method-report"
import { isIsoDateString } from "@/lib/date-utils"

import { ReportsExpensesTab } from "@/views/reports/tabs/reports-expenses-tab"
import { ReportsPaymentMethodsTab } from "@/views/reports/tabs/reports-payment-methods-tab"

export function ReportsView() {
  const searchParams = useSearchParams()
  const { projects, paymentMethods, loading: catalogsLoading } = useReportsCatalogs()

  // ── Hooks ──────────────────────────────────────────────────────────────
  const {
    report: expenseReport,
    loading: expenseLoading,
    exporting: expenseExporting,
    filters: expenseFilters,
    dateRangeError: expenseDateRangeError,
    updateFilter: updateExpenseFilter,
    setFilters: setExpenseFilters,
    fetchReport: fetchExpenseReport,
    exportReport: exportExpenseReport,
  } = useExpenseReport()

  const {
    report: paymentMethodReport,
    loading: paymentMethodLoading,
    exporting: paymentMethodExporting,
    filters: paymentMethodFilters,
    dateRangeError: paymentMethodDateRangeError,
    updateFilter: updatePaymentMethodFilter,
    fetchReport: fetchPaymentMethodReport,
    exportReport: exportPaymentMethodReport,
  } = usePaymentMethodReport()

  const prefillAppliedRef = useRef(false)
  const autoGeneratePendingRef = useRef(false)

  const initialTab = useMemo(
    () => (searchParams.get("tab") === "payment-methods" ? "payment-methods" : "expenses"),
    [searchParams],
  )

  const expensePrefill = useMemo(() => {
    const fromRaw = (searchParams.get("from") ?? "").trim()
    const toRaw = (searchParams.get("to") ?? "").trim()
    const projectIdRaw = (searchParams.get("projectId") ?? "").trim()
    const projectIdsRaw = (searchParams.get("projectIds") ?? "").trim()
    const autoGenerateRaw = (searchParams.get("autogenerate") ?? "").trim().toLowerCase()

    const projectIds = Array.from(
      new Set(
        projectIdsRaw
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    )

    return {
      from: isIsoDateString(fromRaw) ? fromRaw : "",
      to: isIsoDateString(toRaw) ? toRaw : "",
      projectId: projectIdRaw,
      projectIds,
      autoGenerate: autoGenerateRaw === "1" || autoGenerateRaw === "true",
    }
  }, [searchParams])

  useEffect(() => {
    if (prefillAppliedRef.current) return
    if (catalogsLoading) return

    const hasAnyPrefill = Boolean(
      expensePrefill.from ||
      expensePrefill.to ||
      expensePrefill.projectId ||
      expensePrefill.projectIds.length,
    )

    if (!hasAnyPrefill) {
      prefillAppliedRef.current = true
      return
    }

    const validProjectIds = new Set(projects.map((project) => project.id))
    let resolvedProjectId = ""

    if (expensePrefill.projectId && validProjectIds.has(expensePrefill.projectId)) {
      resolvedProjectId = expensePrefill.projectId
    } else if (expensePrefill.projectIds.length > 0) {
      resolvedProjectId = expensePrefill.projectIds.find((id) => validProjectIds.has(id)) ?? ""
    }

    setExpenseFilters((prev) => ({
      ...prev,
      from: expensePrefill.from,
      to: expensePrefill.to,
      projectId: resolvedProjectId,
    }))

    autoGeneratePendingRef.current = expensePrefill.autoGenerate && Boolean(resolvedProjectId)
    prefillAppliedRef.current = true
  }, [catalogsLoading, expensePrefill, projects, setExpenseFilters])

  useEffect(() => {
    if (!autoGeneratePendingRef.current) return
    if (!expenseFilters.projectId || expenseDateRangeError || expenseLoading) return

    autoGeneratePendingRef.current = false
    void fetchExpenseReport()
  }, [expenseDateRangeError, expenseFilters.projectId, expenseLoading, fetchExpenseReport])

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleProjectChange = useCallback(
    (value: string) => updateExpenseFilter("projectId", value),
    [updateExpenseFilter],
  )

  const handlePaymentMethodFilterChange = useCallback(
    (value: string) => updatePaymentMethodFilter("paymentMethodId", value === "all" ? "" : value),
    [updatePaymentMethodFilter],
  )

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Page heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reportes
        </h1>
        <p className="text-sm text-muted-foreground">
          Genera reportes detallados por proyecto o método de pago. Las exportaciones en Excel y PDF incluyen ingresos y balance neto.
        </p>
      </div>

      <Tabs defaultValue={initialTab}>
        <TabsList variant="line">
          <TabsTrigger value="expenses">Gastos por proyecto</TabsTrigger>
          <TabsTrigger value="payment-methods">Métodos de pago</TabsTrigger>
        </TabsList>

        <ReportsExpensesTab
          projects={projects}
          from={expenseFilters.from}
          to={expenseFilters.to}
          projectId={expenseFilters.projectId}
          dateRangeError={expenseDateRangeError}
          loading={expenseLoading}
          exporting={expenseExporting}
          report={expenseReport}
          onFromChange={(value) => updateExpenseFilter("from", value)}
          onToChange={(value) => updateExpenseFilter("to", value)}
          onProjectChange={handleProjectChange}
          onGenerate={fetchExpenseReport}
          onExport={exportExpenseReport}
        />

        <ReportsPaymentMethodsTab
          paymentMethods={paymentMethods}
          from={paymentMethodFilters.from}
          to={paymentMethodFilters.to}
          paymentMethodId={paymentMethodFilters.paymentMethodId}
          dateRangeError={paymentMethodDateRangeError}
          loading={paymentMethodLoading}
          exporting={paymentMethodExporting}
          report={paymentMethodReport}
          onFromChange={(value) => updatePaymentMethodFilter("from", value)}
          onToChange={(value) => updatePaymentMethodFilter("to", value)}
          onPaymentMethodChange={handlePaymentMethodFilterChange}
          onGenerate={fetchPaymentMethodReport}
          onExport={exportPaymentMethodReport}
        />
      </Tabs>
    </div>
  )
}
