"use client"

// views/reports/reports-view.tsx
// Orchestrator for the reports page — two report tabs:
// 1) Project expense report (per project)
// 2) Payment method report (user-level)

import { useCallback } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useReportsCatalogs } from "@/hooks/reports/use-reports-catalogs"
import { useExpenseReport } from "@/hooks/reports/use-expense-report"
import { usePaymentMethodReport } from "@/hooks/reports/use-payment-method-report"

import { ReportsExpensesTab } from "@/views/reports/tabs/reports-expenses-tab"
import { ReportsPaymentMethodsTab } from "@/views/reports/tabs/reports-payment-methods-tab"

export function ReportsView() {
  const { projects, paymentMethods } = useReportsCatalogs()

  // ── Hooks ──────────────────────────────────────────────────────────────
  const expReport = useExpenseReport()
  const pmReport = usePaymentMethodReport()

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleProjectChange = useCallback(
    (value: string) => expReport.updateFilter("projectId", value),
    [expReport],
  )

  const handlePaymentMethodFilterChange = useCallback(
    (value: string) => pmReport.updateFilter("paymentMethodId", value === "all" ? "" : value),
    [pmReport],
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

      <Tabs defaultValue="expenses">
        <TabsList variant="line">
          <TabsTrigger value="expenses">Gastos por proyecto</TabsTrigger>
          <TabsTrigger value="payment-methods">Métodos de pago</TabsTrigger>
        </TabsList>

        <ReportsExpensesTab
          projects={projects}
          from={expReport.filters.from}
          to={expReport.filters.to}
          projectId={expReport.filters.projectId}
          dateRangeError={expReport.dateRangeError}
          loading={expReport.loading}
          exporting={expReport.exporting}
          report={expReport.report}
          onFromChange={(value) => expReport.updateFilter("from", value)}
          onToChange={(value) => expReport.updateFilter("to", value)}
          onProjectChange={handleProjectChange}
          onGenerate={expReport.fetchReport}
          onExport={expReport.exportReport}
        />

        <ReportsPaymentMethodsTab
          paymentMethods={paymentMethods}
          from={pmReport.filters.from}
          to={pmReport.filters.to}
          paymentMethodId={pmReport.filters.paymentMethodId}
          dateRangeError={pmReport.dateRangeError}
          loading={pmReport.loading}
          exporting={pmReport.exporting}
          report={pmReport.report}
          onFromChange={(value) => pmReport.updateFilter("from", value)}
          onToChange={(value) => pmReport.updateFilter("to", value)}
          onPaymentMethodChange={handlePaymentMethodFilterChange}
          onGenerate={pmReport.fetchReport}
          onExport={pmReport.exportReport}
        />
      </Tabs>
    </div>
  )
}
