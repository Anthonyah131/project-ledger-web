"use client"

// components/reports/expense-report-results.tsx
// Renders JSON results for the project expense report.

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ExpenseReportMonthlySectionsCard } from "./expense-report-monthly-sections-card"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import type { ProjectExpenseReportResponse } from "@/types/report"

interface Props {
  report: ProjectExpenseReportResponse
}

export function ExpenseReportResults({ report }: Props) {
  const hasAnalysis = report.categoryAnalysis && report.categoryAnalysis.length > 0
  const hasPaymentMethodAnalysis =
    report.paymentMethodAnalysis && report.paymentMethodAnalysis.length > 0
  const hasObligations = report.obligationSummary && report.obligationSummary.length > 0
  const hasInsights = report.insights && report.insights.length > 0
  const totalIncome = report.totalIncome ?? 0
  const totalIncomeCount = report.totalIncomeCount ?? 0
  const netBalance = report.netBalance ?? totalIncome - report.totalSpent
  const netLabel = netBalance >= 0 ? "Balance neto" : "Balance neto (negativo)"

  return (
    <div className="flex flex-col gap-6">
      {/* ── Summary cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <SummaryCard
          label="Total gastado"
          value={`${report.currencyCode} ${formatAmount(report.totalSpent)}`}
        />
        <SummaryCard
          label="Total ingresos"
          value={`${report.currencyCode} ${formatAmount(totalIncome)}`}
        />
        <SummaryCard
          label={netLabel}
          value={`${report.currencyCode} ${formatAmount(netBalance)}`}
        />
        <SummaryCard
          label="Gastos registrados"
          value={String(report.totalExpenseCount)}
        />
        <SummaryCard
          label="Ingresos registrados"
          value={String(totalIncomeCount)}
        />
        <SummaryCard
          label="Periodo"
          value={
            report.dateFrom && report.dateTo
              ? `${formatDate(report.dateFrom, { fixTimezone: true })} – ${formatDate(report.dateTo, { fixTimezone: true })}`
              : "Todo el historial"
          }
        />
        <SummaryCard
          label="Meses con actividad"
          value={`${report.sections.length} mes${report.sections.length !== 1 ? "es" : ""}`}
        />
      </div>

      {/* ── Insight cards (when backend provides enrichment) ───── */}
      {(report.averageExpenseAmount != null ||
        report.averageMonthlySpend != null ||
        report.largestExpense != null ||
        report.peakMonth != null) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {report.averageExpenseAmount != null && (
            <SummaryCard
              label="Promedio por gasto"
              value={`${report.currencyCode} ${formatAmount(report.averageExpenseAmount)}`}
              muted
            />
          )}
          {report.averageMonthlySpend != null && (
            <SummaryCard
              label="Promedio mensual"
              value={`${report.currencyCode} ${formatAmount(report.averageMonthlySpend)}`}
              muted
            />
          )}
          {report.peakMonth != null && (
            <SummaryCard
              label="Mes pico"
              value={report.peakMonth.monthLabel}
              sub={`${report.currencyCode} ${formatAmount(report.peakMonth.total)}`}
              muted
            />
          )}
          {report.largestExpense != null && (
            <SummaryCard
              label="Gasto mayor"
              value={`${report.currencyCode} ${formatAmount(report.largestExpense.amount)}`}
              sub={report.largestExpense.title}
              muted
            />
          )}
        </div>
      )}

      {/* ── Text insights (advanced plan) ─────────────────────── */}
      {hasInsights && (
        <div className="flex flex-col gap-2">
          {report.insights!.map((insight, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
                insight.type === "warning"
                  ? "border-yellow-500/30 bg-yellow-500/5 text-yellow-300"
                  : insight.type === "tip"
                    ? "border-primary/30 bg-primary/5 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground"
              }`}
            >
              <span className="mt-0.5 shrink-0 text-base leading-none">
                {insight.type === "warning" ? "⚠️" : insight.type === "tip" ? "💡" : "ℹ️"}
              </span>
              <span>{insight.message}</span>
            </div>
          ))}
        </div>
      )}

      <ExpenseReportMonthlySectionsCard report={report} />

      {/* ── Category analysis ─────────────────────────────────── */}
      {hasAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Análisis por categoría</CardTitle>
            <CardDescription>
              Distribución del gasto por categoría en el periodo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {report.categoryAnalysis!.map((cat) => (
                <div
                  key={cat.categoryId}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{cat.categoryName}</span>
                    <span className="text-xs text-muted-foreground">
                      {cat.expenseCount} gastos
                      {cat.averageAmount != null && (
                        <> · prom. {report.currencyCode} {formatAmount(cat.averageAmount)}</>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
                      {cat.percentage.toFixed(1)}%
                    </span>
                    <span className="text-sm tabular-nums font-medium w-28 text-right">
                      {report.currencyCode} {formatAmount(cat.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Payment method analysis ───────────────────────────── */}
      {hasPaymentMethodAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Análisis por método de pago</CardTitle>
            <CardDescription>
              Distribución del gasto por método de pago en el periodo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {report.paymentMethodAnalysis!.map((pm) => (
                <div
                  key={pm.paymentMethodId}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{pm.paymentMethodName}</span>
                    <span className="text-xs text-muted-foreground">
                      {pm.expenseCount} gastos
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${Math.min(pm.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
                      {pm.percentage.toFixed(1)}%
                    </span>
                    <div className="flex flex-col items-end w-28">
                      <span className="text-sm tabular-nums font-medium">
                        {report.currencyCode} {formatAmount(pm.spentAmount)}
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        ~{report.currencyCode} {formatAmount(pm.averageExpenseAmount)} / gasto
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Obligation summary ────────────────────────────────── */}
      {hasObligations && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de obligaciones</CardTitle>
            <CardDescription>
              Pagos realizados hacia deudas/obligaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {report.obligationSummary!.map((obl) => (
                <div
                  key={obl.obligationId}
                  className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{obl.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {obl.paymentCount} pagos
                    </span>
                  </div>
                  <span className="text-sm tabular-nums font-medium">
                    {report.currencyCode} {formatAmount(obl.totalPaid)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Small summary card ──────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  muted,
}: {
  label: string
  value: string
  sub?: string
  muted?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-1 ${muted ? "bg-muted/30" : "bg-card"}`}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold tracking-tight leading-tight">{value}</span>
      {sub && (
        <span className="text-xs text-muted-foreground truncate">{sub}</span>
      )}
    </div>
  )
}
