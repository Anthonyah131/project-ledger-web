"use client"

// components/reports/income-report-results.tsx
// Renders JSON results for the project income report.

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
import type { ProjectIncomeReportResponse } from "@/types/report"

interface Props {
  report: ProjectIncomeReportResponse
}

export function IncomeReportResults({ report }: Props) {
  const hasCategoryAnalysis = report.categoryAnalysis && report.categoryAnalysis.length > 0
  const hasPaymentMethodAnalysis =
    report.paymentMethodAnalysis && report.paymentMethodAnalysis.length > 0
  const hasAltCurrencies =
    report.alternativeCurrencies && report.alternativeCurrencies.length > 0

  return (
    <div className="flex flex-col gap-6">
      {/* ── Summary cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          label="Total ingresos"
          value={`${report.currencyCode} ${formatAmount(report.totalIncome)}`}
        />
        <SummaryCard
          label="Ingresos registrados"
          value={String(report.totalIncomeCount)}
        />
        <SummaryCard
          label="Meses con actividad"
          value={`${report.sections.length} mes${report.sections.length !== 1 ? "es" : ""}`}
        />
        <SummaryCard
          label="Periodo"
          value={
            report.dateFrom && report.dateTo
              ? `${formatDate(report.dateFrom)} – ${formatDate(report.dateTo)}`
              : "Todo el historial"
          }
        />
        <SummaryCard
          label="Generado"
          value={formatDate(report.generatedAt)}
        />
      </div>

      {/* ── Alternative currency totals ──────────────────────── */}
      {hasAltCurrencies && (
        <div className="flex flex-col gap-3">
          {report.alternativeCurrencies!.map((alt) => (
            <div
              key={alt.currencyCode}
              className="rounded-xl border border-dashed border-emerald-500/20 bg-emerald-500/[0.03] p-4"
            >
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400/70 mb-2 block">
                Totales en {alt.currencyCode}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <AltCurrencyValue
                  label="Total ingresos"
                  value={`${alt.currencyCode} ${formatAmount(alt.totalIncome)}`}
                />
                <AltCurrencyValue
                  label="Balance neto"
                  value={`${alt.currencyCode} ${formatAmount(alt.netBalance)}`}
                />
                <AltCurrencyValue
                  label="Prom. mensual"
                  value={`${alt.currencyCode} ${formatAmount(alt.averageMonthlySpend)}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Insight cards ─────────────────────────────────────── */}
      {(report.averageIncomeAmount != null ||
        report.averageMonthlyIncome != null ||
        report.largestIncome != null ||
        report.peakMonth != null) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {report.averageIncomeAmount != null && (
            <SummaryCard
              label="Promedio por ingreso"
              value={`${report.currencyCode} ${formatAmount(report.averageIncomeAmount)}`}
              muted
            />
          )}
          {report.averageMonthlyIncome != null && (
            <SummaryCard
              label="Promedio mensual"
              value={`${report.currencyCode} ${formatAmount(report.averageMonthlyIncome)}`}
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
          {report.largestIncome != null && (
            <SummaryCard
              label="Mayor ingreso"
              value={`${report.currencyCode} ${formatAmount(report.largestIncome.amount)}`}
              sub={report.largestIncome.title}
              muted
            />
          )}
        </div>
      )}

      {/* ── Monthly sections ──────────────────────────────────── */}
      {report.sections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalle mensual</CardTitle>
            <CardDescription>Ingresos desglosados por mes</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {report.sections.map((section) => (
              <div
                key={`${section.year}-${section.month}`}
                className="rounded-lg border bg-muted/30 p-4"
              >
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">{section.monthLabel}</h4>
                    {section.topIncome && (
                      <span
                        className="text-xs text-muted-foreground hidden sm:inline"
                        title={`Mayor ingreso: ${section.topIncome.title}`}
                      >
                        · {section.topIncome.title}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap justify-end">
                    <span>{section.sectionCount} ingresos</span>
                    {section.percentageOfTotal != null && (
                      <span className="tabular-nums text-muted-foreground/70">
                        {section.percentageOfTotal.toFixed(1)}%
                      </span>
                    )}
                    <Badge variant="outline" className="font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                      {report.currencyCode} {formatAmount(section.sectionTotal)}
                    </Badge>
                  </div>
                </div>

                {/* Alternative currency subtotals for this section */}
                {section.alternativeCurrencies && section.alternativeCurrencies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {section.alternativeCurrencies.map((alt) => (
                      <Badge
                        key={alt.currencyCode}
                        variant="outline"
                        className="font-mono text-[10px] border-emerald-500/20 text-emerald-600 dark:text-emerald-400/70"
                      >
                        {alt.currencyCode}: ingreso {formatAmount(alt.totalIncome)}
                        {` · neto ${formatAmount(alt.netBalance)}`}
                      </Badge>
                    ))}
                  </div>
                )}

                {section.incomes.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-left py-2 pr-4 font-medium">Fecha</th>
                            <th className="text-left py-2 pr-4 font-medium">Título</th>
                            <th className="text-left py-2 pr-4 font-medium">Categoría</th>
                            <th className="text-left py-2 pr-4 font-medium">Método</th>
                            <th className="text-right py-2 font-medium">Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.incomes.map((income, index) => {
                            const showOriginal =
                              income.originalCurrency &&
                              income.originalCurrency !== report.currencyCode &&
                              income.originalAmount != null

                            return (
                              <tr
                                key={`${section.year}-${section.month}-${income.id ?? index}`}
                                className="border-b border-border/50 last:border-0"
                              >
                                <td className="py-2 pr-4 tabular-nums text-muted-foreground">
                                  {formatDate(income.incomeDate)}
                                </td>
                                <td className="py-2 pr-4 font-medium text-foreground max-w-45 truncate">
                                  {income.title}
                                </td>
                                <td className="py-2 pr-4">{income.categoryName}</td>
                                <td className="py-2 pr-4">{income.paymentMethodName}</td>
                                <td className="py-2 text-right tabular-nums font-medium">
                                  <div className="flex flex-col items-end gap-0.5">
                                    <span>{formatAmount(income.convertedAmount)}</span>
                                    {showOriginal && (
                                      <span className="text-[10px] text-muted-foreground font-normal">
                                        {income.originalCurrency} {formatAmount(income.originalAmount)}
                                      </span>
                                    )}
                                    {income.accountAmount != null && income.accountCurrency && (
                                      <span className="text-[10px] text-muted-foreground font-normal">
                                        {income.accountCurrency} {formatAmount(income.accountAmount)}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    {section.sectionCount > section.incomes.length && (
                      <div className="mt-3 rounded-md border border-dashed border-muted-foreground/25 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
                        Mostrando {section.incomes.length} de {section.sectionCount} ingresos.
                        {" "}Exporta el reporte completo en Excel o PDF para ver todos los ingresos.
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sin detalle de ingresos para este mes.
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Category analysis ─────────────────────────────────── */}
      {hasCategoryAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Análisis por categoría</CardTitle>
            <CardDescription>
              Distribución de ingresos por categoría en el periodo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {report.categoryAnalysis!.map((cat) => (
                <div
                  key={cat.categoryName}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{cat.categoryName}</span>
                    <span className="text-xs text-muted-foreground">
                      {cat.incomeCount} ingresos
                      {cat.averageAmount != null && (
                        <> · prom. {report.currencyCode} {formatAmount(cat.averageAmount)}</>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
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
              Distribución de ingresos por método de pago en el periodo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {report.paymentMethodAnalysis!.map((pm) => (
                <div
                  key={pm.paymentMethodName}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{pm.paymentMethodName}</span>
                    <span className="text-xs text-muted-foreground">
                      {pm.incomeCount} ingresos
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500/70"
                        style={{ width: `${Math.min(pm.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
                      {pm.percentage.toFixed(1)}%
                    </span>
                    <div className="flex flex-col items-end w-28">
                      <span className="text-sm tabular-nums font-medium">
                        {report.currencyCode} {formatAmount(pm.totalAmount)}
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        ~{report.currencyCode} {formatAmount(pm.averageAmount)} / ingreso
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}

// ── Alt currency inline value ───────────────────────────────────────────────

function AltCurrencyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold tabular-nums tracking-tight">{value}</span>
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
