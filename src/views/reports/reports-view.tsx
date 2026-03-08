"use client"

// views/reports/reports-view.tsx
// Orchestrator for the reports page — two report tabs:
// 1) Project expense report (per project)
// 2) Payment method report (user-level)

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useExpenseReport } from "@/hooks/reports/use-expense-report"
import { usePaymentMethodReport } from "@/hooks/reports/use-payment-method-report"

import { ReportFilters } from "@/components/reports/report-filters"
import { ExpenseReportResults } from "@/components/reports/expense-report-results"
import { PaymentMethodReportResults } from "@/components/reports/payment-method-report-results"
import { ReportEmptyPrompt, ReportNoData, ReportSkeleton } from "@/components/reports/report-states"

import * as projectService from "@/services/project-service"
import * as paymentMethodService from "@/services/payment-method-service"
import type { ProjectResponse } from "@/types/project"
import type { PaymentMethodResponse } from "@/types/payment-method"

export function ReportsView() {
  // ── Project list for the expense report selector ───────────────────────
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([])

  useEffect(() => {
    projectService.getProjects().then(setProjects).catch(() => {})
    paymentMethodService.getPaymentMethods().then(setPaymentMethods).catch(() => {})
  }, [])

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
          Genera reportes detallados de gastos por proyecto o por método de pago. Exporta en Excel o PDF.
        </p>
      </div>

      <Tabs defaultValue="expenses">
        <TabsList variant="line">
          <TabsTrigger value="expenses">Gastos por proyecto</TabsTrigger>
          <TabsTrigger value="payment-methods">Métodos de pago</TabsTrigger>
        </TabsList>

        {/* ───── Expense report tab ───── */}
        <TabsContent value="expenses" className="flex flex-col gap-6 mt-4">
          <ReportFilters
            from={expReport.filters.from}
            to={expReport.filters.to}
            onFromChange={(v) => expReport.updateFilter("from", v)}
            onToChange={(v) => expReport.updateFilter("to", v)}
            onGenerate={expReport.fetchReport}
            onExport={expReport.exportReport}
            loading={expReport.loading}
            exporting={expReport.exporting}
          >
            {/* Project selector */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Proyecto</Label>
              <Select
                value={expReport.filters.projectId}
                onValueChange={handleProjectChange}
              >
                <SelectTrigger size="sm" className="w-52">
                  <SelectValue placeholder="Selecciona proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ReportFilters>

          {expReport.loading ? (
            <ReportSkeleton />
          ) : expReport.report ? (
            expReport.report.totalExpenseCount === 0 &&
            (expReport.report.totalIncomeCount ?? 0) === 0 ? (
              <ReportNoData />
            ) : (
              <ExpenseReportResults report={expReport.report} />
            )
          ) : (
            <ReportEmptyPrompt />
          )}
        </TabsContent>

        {/* ───── Payment method report tab ───── */}
        <TabsContent value="payment-methods" className="flex flex-col gap-6 mt-4">
          <ReportFilters
            from={pmReport.filters.from}
            to={pmReport.filters.to}
            onFromChange={(v) => pmReport.updateFilter("from", v)}
            onToChange={(v) => pmReport.updateFilter("to", v)}
            onGenerate={pmReport.fetchReport}
            onExport={pmReport.exportReport}
            loading={pmReport.loading}
            exporting={pmReport.exporting}
          >
            {/* Payment method filter (optional) */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Método de pago</Label>
              <Select
                value={pmReport.filters.paymentMethodId || "all"}
                onValueChange={handlePaymentMethodFilterChange}
              >
                <SelectTrigger size="sm" className="w-52">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ReportFilters>

          {pmReport.loading ? (
            <ReportSkeleton />
          ) : pmReport.report ? (
            pmReport.report.grandTotalExpenseCount === 0 &&
            (pmReport.report.grandTotalIncomeCount ?? 0) === 0 ? (
              <ReportNoData />
            ) : (
              <PaymentMethodReportResults report={pmReport.report} />
            )
          ) : (
            <ReportEmptyPrompt />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
