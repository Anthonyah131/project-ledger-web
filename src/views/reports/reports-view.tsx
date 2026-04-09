"use client"

// views/reports/reports-view.tsx
// Orchestrator for the reports page — six report tabs:
// 1) Project expense report (per project)
// 2) Payment method report (user-level)
// 3) Project income report (per project)
// 4) Partner balances report (per project, partners-enabled only)
// 5) Partner general report (per partner)
// 6) (removed) Workspace report

import { useCallback, useEffect, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useReportsCatalogs } from "@/hooks/reports/use-reports-catalogs"
import { useExpenseReport } from "@/hooks/reports/use-expense-report"
import { usePaymentMethodReport } from "@/hooks/reports/use-payment-method-report"
import { useIncomeReport } from "@/hooks/reports/use-income-report"
import { usePartnerBalancesReport } from "@/hooks/reports/use-partner-balances-report"
import { usePartnerGeneralReport } from "@/hooks/reports/use-partner-general-report"
import { isIsoDateString } from "@/lib/date-utils"

import { ReportsExpensesTab } from "@/views/reports/tabs/reports-expenses-tab"
import { ReportsPaymentMethodsTab } from "@/views/reports/tabs/reports-payment-methods-tab"
import { ReportsIncomesTab } from "@/views/reports/tabs/reports-incomes-tab"
import { ReportsPartnerBalancesTab } from "@/views/reports/tabs/reports-partner-balances-tab"
import { ReportsPartnerGeneralTab } from "@/views/reports/tabs/reports-partner-general-tab"
import { useLanguage } from "@/context/language-context"

const VALID_TABS = ["expenses", "payment-methods", "incomes", "partner-balances", "partner-general"] as const

export function ReportsView() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const { projects, paymentMethods, partners, loading: catalogsLoading } = useReportsCatalogs()

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

  const {
    report: incomeReport,
    loading: incomeLoading,
    exporting: incomeExporting,
    filters: incomeFilters,
    dateRangeError: incomeDateRangeError,
    updateFilter: updateIncomeFilter,
    fetchReport: fetchIncomeReport,
    exportReport: exportIncomeReport,
  } = useIncomeReport()

  const {
    report: partnerBalancesReport,
    loading: partnerBalancesLoading,
    exporting: partnerBalancesExporting,
    filters: partnerBalancesFilters,
    dateRangeError: partnerBalancesDateRangeError,
    updateFilter: updatePartnerBalancesFilter,
    fetchReport: fetchPartnerBalancesReport,
    exportReport: exportPartnerBalancesReport,
  } = usePartnerBalancesReport()

  const {
    report: partnerGeneralReport,
    loading: partnerGeneralLoading,
    exporting: partnerGeneralExporting,
    filters: partnerGeneralFilters,
    dateRangeError: partnerGeneralDateRangeError,
    updateFilter: updatePartnerGeneralFilter,
    fetchReport: fetchPartnerGeneralReport,
    exportReport: exportPartnerGeneralReport,
  } = usePartnerGeneralReport()

  const prefillAppliedRef = useRef(false)
  const autoGeneratePendingRef = useRef(false)

  const initialTab = useMemo(() => {
    const tab = searchParams.get("tab") ?? ""
    return (VALID_TABS as readonly string[]).includes(tab) ? tab : "expenses"
  }, [searchParams])

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

  const handlePaymentMethodsFilterChange = useCallback(
    (ids: string[]) => updatePaymentMethodFilter("paymentMethodIds", ids),
    [updatePaymentMethodFilter],
  )

  const handleIncomeProjectChange = useCallback(
    (value: string) => updateIncomeFilter("projectId", value),
    [updateIncomeFilter],
  )

  const handlePartnerBalancesProjectChange = useCallback(
    (value: string) => updatePartnerBalancesFilter("projectId", value),
    [updatePartnerBalancesFilter],
  )

  const handlePartnerGeneralChange = useCallback(
    (value: string) => updatePartnerGeneralFilter("partnerId", value),
    [updatePartnerGeneralFilter],
  )

  const handlePartnerGeneralExport = useCallback(
    (format: "excel" | "pdf") => exportPartnerGeneralReport(format as "excel"),
    [exportPartnerGeneralReport],
  )

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* Page heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("reports.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("reports.subtitle")}
        </p>
      </div>

      <Tabs defaultValue={initialTab}>
        <TabsList variant="line" className="w-full flex-wrap gap-y-1 p-3">
          <TabsTrigger value="expenses">{t("reports.tabs.expenses")}</TabsTrigger>
          <TabsTrigger value="incomes">{t("reports.tabs.incomes")}</TabsTrigger>
          <TabsTrigger value="payment-methods">{t("reports.tabs.paymentMethods")}</TabsTrigger>
          <TabsTrigger value="partner-balances">{t("reports.tabs.partnerBalances")}</TabsTrigger>
          <TabsTrigger value="partner-general">{t("reports.tabs.partnerGeneral")}</TabsTrigger>
        </TabsList>

        <ReportsExpensesTab
          projects={projects}
          catalogsLoading={catalogsLoading}
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

        <ReportsIncomesTab
          projects={projects}
          catalogsLoading={catalogsLoading}
          from={incomeFilters.from}
          to={incomeFilters.to}
          projectId={incomeFilters.projectId}
          dateRangeError={incomeDateRangeError}
          loading={incomeLoading}
          exporting={incomeExporting}
          report={incomeReport}
          onFromChange={(value) => updateIncomeFilter("from", value)}
          onToChange={(value) => updateIncomeFilter("to", value)}
          onProjectChange={handleIncomeProjectChange}
          onGenerate={fetchIncomeReport}
          onExport={exportIncomeReport}
        />

        <ReportsPaymentMethodsTab
          paymentMethods={paymentMethods}
          catalogsLoading={catalogsLoading}
          from={paymentMethodFilters.from}
          to={paymentMethodFilters.to}
          paymentMethodIds={paymentMethodFilters.paymentMethodIds}
          dateRangeError={paymentMethodDateRangeError}
          loading={paymentMethodLoading}
          exporting={paymentMethodExporting}
          report={paymentMethodReport}
          onFromChange={(value) => updatePaymentMethodFilter("from", value)}
          onToChange={(value) => updatePaymentMethodFilter("to", value)}
          onPaymentMethodsChange={handlePaymentMethodsFilterChange}
          onGenerate={fetchPaymentMethodReport}
          onExport={exportPaymentMethodReport}
        />

        <ReportsPartnerBalancesTab
          projects={projects}
          catalogsLoading={catalogsLoading}
          from={partnerBalancesFilters.from}
          to={partnerBalancesFilters.to}
          projectId={partnerBalancesFilters.projectId}
          dateRangeError={partnerBalancesDateRangeError}
          loading={partnerBalancesLoading}
          exporting={partnerBalancesExporting}
          report={partnerBalancesReport}
          onFromChange={(value) => updatePartnerBalancesFilter("from", value)}
          onToChange={(value) => updatePartnerBalancesFilter("to", value)}
          onProjectChange={handlePartnerBalancesProjectChange}
          onGenerate={fetchPartnerBalancesReport}
          onExport={exportPartnerBalancesReport}
        />

        <ReportsPartnerGeneralTab
          partners={partners}
          catalogsLoading={catalogsLoading}
          from={partnerGeneralFilters.from}
          to={partnerGeneralFilters.to}
          partnerId={partnerGeneralFilters.partnerId}
          dateRangeError={partnerGeneralDateRangeError}
          loading={partnerGeneralLoading}
          exporting={partnerGeneralExporting}
          report={partnerGeneralReport}
          onFromChange={(value) => updatePartnerGeneralFilter("from", value)}
          onToChange={(value) => updatePartnerGeneralFilter("to", value)}
          onPartnerChange={handlePartnerGeneralChange}
          onGenerate={fetchPartnerGeneralReport}
          onExport={handlePartnerGeneralExport}
        />

      </Tabs>
    </div>
  )
}
