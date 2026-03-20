"use client"

// components/reports/workspace-report-results.tsx
// Renders JSON results for the workspace report.

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import type { WorkspaceReportResponse } from "@/types/report"

interface Props {
  report: WorkspaceReportResponse
}

export function WorkspaceReportResults({ report }: Props) {
  const hasConsolidated = report.consolidatedTotals != null
  const hasCategoryBreakdown =
    report.consolidatedByCategory && report.consolidatedByCategory.length > 0
  const hasMonthlyTrend = report.monthlyTrend && report.monthlyTrend.length > 0
  const maxMonthlyFlow = hasMonthlyTrend
    ? Math.max(
        ...report.monthlyTrend!.map((row) => Math.abs(row.netBalance)),
        1,
      )
    : 1

  return (
    <div className="flex flex-col gap-6">
      {/* ── Consolidated totals (only when currency param is provided) ── */}
      {hasConsolidated && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryCard
            label="Total gastado"
            value={`${report.referenceCurrency} ${formatAmount(report.consolidatedTotals!.totalSpent)}`}
          />
          <SummaryCard
            label="Total ingresos"
            value={`${report.referenceCurrency} ${formatAmount(report.consolidatedTotals!.totalIncome)}`}
          />
          <SummaryCard
            label={report.consolidatedTotals!.netBalance >= 0 ? "Balance neto" : "Balance neto (negativo)"}
            value={`${report.referenceCurrency} ${formatAmount(report.consolidatedTotals!.netBalance)}`}
          />
          <SummaryCard
            label="Total gastos"
            value={String(report.consolidatedTotals!.totalExpenseCount)}
          />
          <SummaryCard
            label="Total ingresos"
            value={String(report.consolidatedTotals!.totalIncomeCount)}
          />
        </div>
      )}

      {/* ── General info cards ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Workspace"
          value={report.workspaceName}
        />
        <SummaryCard
          label="Proyectos"
          value={String(report.projectCount)}
        />
        <SummaryCard
          label="Periodo"
          value={
            report.dateFrom && report.dateTo
              ? `${formatDate(report.dateFrom)} – ${formatDate(report.dateTo)}`
              : "Todo el historial"
          }
        />
        {report.referenceCurrency && (
          <SummaryCard
            label="Moneda de referencia"
            value={report.referenceCurrency}
          />
        )}
      </div>

      {!hasConsolidated && (
        <div className="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm border-border bg-muted/30 text-muted-foreground">
          <span className="mt-0.5 shrink-0 text-base leading-none">i</span>
          <span>
            No se proporcionó moneda de referencia. Los totales consolidados no están disponibles.
            Cada proyecto muestra sus montos en su propia moneda.
          </span>
        </div>
      )}

      {/* ── Projects breakdown ────────────────────────────────── */}
      {report.projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Desglose por proyecto</CardTitle>
            <CardDescription>
              Resumen financiero de cada proyecto del workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {report.projects.map((project) => {
                const isPositive = project.netBalance >= 0
                return (
                  <div
                    key={project.projectId}
                    className="rounded-lg border bg-muted/30 px-4 py-3"
                  >
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{project.projectName}</span>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {project.currencyCode}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        {hasConsolidated && (
                          <>
                            <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${Math.min(project.percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
                              {project.percentage.toFixed(1)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-muted-foreground">
                      <div className="flex flex-col">
                        <span>Gastos</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {project.currencyCode} {formatAmount(project.totalSpent)}
                        </span>
                        <span>{project.expenseCount} registros</span>
                      </div>
                      <div className="flex flex-col">
                        <span>Ingresos</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {project.currencyCode} {formatAmount(project.totalIncome)}
                        </span>
                        <span>{project.incomeCount} registros</span>
                      </div>
                      <div className="flex flex-col">
                        <span>Balance neto</span>
                        <span
                          className={`font-medium tabular-nums ${
                            isPositive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {project.currencyCode} {formatAmount(project.netBalance)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Category breakdown (consolidated) ─────────────────── */}
      {hasCategoryBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Desglose por categoría</CardTitle>
            <CardDescription>
              Gasto consolidado por categoría entre todos los proyectos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {report.consolidatedByCategory!.map((cat) => (
                <div
                  key={cat.categoryName}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{cat.categoryName}</span>
                    <span className="text-xs text-muted-foreground">
                      {cat.expenseCount} gastos · {cat.projectCount} proyecto{cat.projectCount !== 1 ? "s" : ""}
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
                      {report.referenceCurrency} {formatAmount(cat.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Monthly trend ─────────────────────────────────────── */}
      {hasMonthlyTrend && (
        <Card>
          <CardHeader>
            <CardTitle>Tendencia mensual</CardTitle>
            <CardDescription>
              Evolución mensual de gastos, ingresos y balance neto del workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {report.monthlyTrend!.map((mt) => {
                const pct = (Math.abs(mt.netBalance) / maxMonthlyFlow) * 100

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
                          mt.netBalance >= 0 ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-center tabular-nums">
                      {mt.expenseCount}/{mt.incomeCount}
                    </span>
                    <div className="text-xs tabular-nums w-64 text-right flex flex-col">
                      <span>G: {formatAmount(mt.totalSpent)}</span>
                      <span>I: {formatAmount(mt.totalIncome)}</span>
                      <span className="font-semibold">N: {formatAmount(mt.netBalance)}</span>
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

// ── Small summary card ──────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold tracking-tight leading-tight">{value}</span>
    </div>
  )
}
