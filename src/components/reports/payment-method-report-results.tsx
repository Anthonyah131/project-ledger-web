"use client"

// components/reports/payment-method-report-results.tsx
// Renders JSON results for the payment method report.

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PaymentMethodReportMethodCard } from "./payment-method-report-method-card"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import type { PaymentMethodReportResponse } from "@/types/report"

interface Props {
  report: PaymentMethodReportResponse
}

export function PaymentMethodReportResults({ report }: Props) {
  const hasInsights = report.insights && report.insights.length > 0
  const grandTotalIncome = report.grandTotalIncome ?? 0
  const grandIncomeCount = report.grandTotalIncomeCount ?? 0
  const grandNetFlow = report.grandNetFlow ?? grandTotalIncome - report.grandTotalSpent
  const maxMonthlyFlow =
    report.monthlyTrend.length > 0
      ? Math.max(
          ...report.monthlyTrend.map((row) =>
            Math.abs(row.netBalance ?? (row.totalIncome ?? 0) - row.totalSpent)
          ),
          1
        )
      : 1

  return (
    <div className="flex flex-col gap-6">
      {/* ── Summary cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <SummaryCard
          label="Total gastado"
          value={formatAmount(report.grandTotalSpent)}
        />
        <SummaryCard
          label="Total ingresos"
          value={formatAmount(grandTotalIncome)}
        />
        <SummaryCard
          label="Flujo neto"
          value={formatAmount(grandNetFlow)}
        />
        <SummaryCard
          label="Gastos totales"
          value={String(report.grandTotalExpenseCount)}
        />
        <SummaryCard
          label="Ingresos totales"
          value={String(grandIncomeCount)}
        />
        <SummaryCard
          label="Métodos de pago"
          value={String(report.paymentMethods.length)}
        />
        <SummaryCard
          label="Periodo"
          value={
            report.dateFrom && report.dateTo
              ? `${formatDate(report.dateFrom, { fixTimezone: true })} – ${formatDate(report.dateTo, { fixTimezone: true })}`
              : "Todo el historial"
          }
        />
      </div>

      {/* ── Insight cards (when backend provides them) ─────────── */}
      {(report.grandAverageExpenseAmount != null ||
        report.grandAverageIncomeAmount != null ||
        report.averageMonthlySpend != null ||
        report.peakMonth != null ||
        report.highestSpendMethod != null) && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {report.grandAverageExpenseAmount != null && (
            <SummaryCard
              label="Promedio por gasto"
              value={formatAmount(report.grandAverageExpenseAmount)}
              muted
            />
          )}
          {report.grandAverageIncomeAmount != null && (
            <SummaryCard
              label="Promedio por ingreso"
              value={formatAmount(report.grandAverageIncomeAmount)}
              muted
            />
          )}
          {report.averageMonthlySpend != null && (
            <SummaryCard
              label="Promedio mensual"
              value={formatAmount(report.averageMonthlySpend)}
              muted
            />
          )}
          {report.peakMonth != null && (
            <SummaryCard
              label="Mes pico"
              value={report.peakMonth.monthLabel}
              sub={formatAmount(report.peakMonth.total)}
              muted
            />
          )}
          {report.highestSpendMethod != null && (
            <SummaryCard
              label="Método principal"
              value={report.highestSpendMethod.name}
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

      {/* ── Payment methods breakdown ─────────────────────────── */}
      {report.paymentMethods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Métodos de pago</CardTitle>
            <CardDescription>
              Desglose de gastos, ingresos y flujo neto por cada método
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {report.paymentMethods.map((method) => (
              <PaymentMethodReportMethodCard
                key={method.paymentMethodId}
                method={method}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Monthly trend ─────────────────────────────────────── */}
      {report.monthlyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tendencia mensual</CardTitle>
            <CardDescription>
              Evolución mensual de gastos, ingresos y flujo neto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {report.monthlyTrend.map((mt) => {
                const income = mt.totalIncome ?? 0
                const net = mt.netBalance ?? income - mt.totalSpent
                const pct = (Math.abs(net) / maxMonthlyFlow) * 100

                return (
                  <div
                    key={`${mt.year}-${mt.month}`}
                    className="flex items-center gap-4 rounded-lg border bg-muted/30 px-4 py-3"
                  >
                    <span className="text-sm font-medium w-36 shrink-0">
                      {mt.monthLabel}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          net >= 0 ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-center tabular-nums">
                      {mt.expenseCount}/{mt.incomeCount ?? 0}
                    </span>
                    <div className="text-xs tabular-nums w-64 text-right flex flex-col">
                      <span>G: {formatAmount(mt.totalSpent)}</span>
                      <span>I: {formatAmount(income)}</span>
                      <span className="font-semibold">N: {formatAmount(net)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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
      {sub && <span className="text-xs text-muted-foreground truncate">{sub}</span>}
    </div>
  )
}
