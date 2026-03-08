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
import { Badge } from "@/components/ui/badge"
import { formatAmount, formatDate } from "@/lib/format-utils"
import type {
  PaymentMethodReportResponse,
  PaymentMethodReportExpense,
  PaymentMethodReportIncome,
} from "@/types/report"

interface Props {
  report: PaymentMethodReportResponse
}

/** Resolves amount from a payment method expense — handles both new `convertedAmount`
 *  and the legacy `amount` field until the backend migration is complete. */
function resolveExpenseAmount(exp: PaymentMethodReportExpense): number | undefined {
  return exp.convertedAmount ?? (exp as unknown as { amount?: number }).amount
}

function resolveIncomeAmount(inc: PaymentMethodReportIncome): number | undefined {
  return inc.originalAmount ?? inc.convertedAmount
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
            {report.paymentMethods.map((pm) => (
              <div
                key={pm.paymentMethodId}
                className="rounded-lg border bg-muted/30 p-4"
              >
                {/* Method header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">{pm.name}</h4>
                    <Badge variant="outline" className="text-[10px]">
                      {pm.type}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {pm.currency}
                    </Badge>
                    {pm.isInactive && (
                      <Badge variant="outline" className="text-[10px] border-yellow-500/40 text-yellow-400">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col items-end text-xs tabular-nums">
                    <span>Gastos: {pm.currency} {formatAmount(pm.totalSpent)}</span>
                    <span>Ingresos: {pm.currency} {formatAmount(pm.totalIncome ?? 0)}</span>
                    <span className="font-semibold">
                      Neto: {pm.currency} {formatAmount(pm.netFlow ?? (pm.totalIncome ?? 0) - pm.totalSpent)}
                    </span>
                  </div>
                </div>

                {/* Method stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3 text-xs">
                  <StatItem label="Gastos" value={String(pm.expenseCount)} />
                  <StatItem label="Ingresos" value={String(pm.incomeCount ?? 0)} />
                  <StatItem
                    label="% del total"
                    value={`${pm.percentage.toFixed(1)}%`}
                  />
                  <StatItem
                    label="Prom. gasto"
                    value={`${pm.currency} ${formatAmount(pm.averageExpenseAmount)}`}
                  />
                  <StatItem
                    label="Prom. ingreso"
                    value={`${pm.currency} ${formatAmount(pm.averageIncomeAmount ?? null, "—")}`}
                  />
                  <StatItem
                    label="Flujo neto"
                    value={`${pm.currency} ${formatAmount(pm.netFlow ?? (pm.totalIncome ?? 0) - pm.totalSpent)}`}
                  />
                  <StatItem
                    label="Banco"
                    value={pm.bankName ?? "—"}
                  />
                </div>

                {/* Usage dates + inactivity hint */}
                {(pm.firstUseDate || pm.lastUseDate) && (
                  <div className="flex gap-4 text-xs text-muted-foreground mb-3 flex-wrap">
                    {pm.firstUseDate && (
                      <span>
                        Primer uso: {formatDate(pm.firstUseDate, { fixTimezone: true })}
                      </span>
                    )}
                    {pm.lastUseDate && (
                      <span>
                        Último uso: {formatDate(pm.lastUseDate, { fixTimezone: true })}
                        {pm.daysSinceLastUse != null && pm.daysSinceLastUse > 0 && (
                          <> ({pm.daysSinceLastUse} días)</>
                        )}
                      </span>
                    )}
                  </div>
                )}

                {/* Per-method percentage bar */}
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(pm.percentage, 100)}%` }}
                  />
                </div>

                {/* Top expense highlight */}
                {pm.topExpense && (
                  <div className="mb-3 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground">Gasto mayor</span>
                      <span className="font-medium text-foreground">{pm.topExpense.title}</span>
                      <span className="text-muted-foreground">
                        {pm.topExpense.projectName} · {pm.topExpense.categoryName}
                      </span>
                    </div>
                    <span className="tabular-nums font-semibold text-sm">
                      {pm.currency} {formatAmount(pm.topExpense.amount)}
                    </span>
                  </div>
                )}

                {/* Top categories breakdown */}
                {pm.topCategories && pm.topCategories.length > 0 && (
                  <div className="mb-3 pt-2 border-t border-border/50">
                    <span className="text-xs font-medium text-muted-foreground mb-2 block">
                      Principales categorías
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {pm.topCategories.map((cat) => (
                        <div key={cat.categoryName} className="flex items-center gap-3">
                          <span className="text-xs text-foreground w-32 truncate">{cat.categoryName}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/70"
                              style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
                            {cat.percentage.toFixed(1)}%
                          </span>
                          <span className="text-xs tabular-nums font-medium w-24 text-right">
                            {pm.currency} {formatAmount(cat.totalAmount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects using this method */}
                {pm.projects.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <span className="text-xs font-medium text-muted-foreground mb-2 block">
                      Proyectos
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {pm.projects.map((proj) => (
                        <Badge
                          key={proj.projectId}
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {proj.projectName} — {proj.currencyCode ?? pm.currency}{" "}
                          {formatAmount(proj.totalSpent)} ({proj.expenseCount})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent expenses */}
                {pm.expenses.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Gastos
                      </span>
                      {pm.totalExpensesInPeriod != null &&
                        pm.expensesShown != null &&
                        pm.totalExpensesInPeriod > pm.expensesShown && (
                          <span className="text-xs text-muted-foreground">
                            Mostrando {pm.expensesShown} de {pm.totalExpensesInPeriod}
                          </span>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-left py-1.5 pr-3 font-medium">Fecha</th>
                            <th className="text-left py-1.5 pr-3 font-medium">Título</th>
                            <th className="text-left py-1.5 pr-3 font-medium">Proyecto</th>
                            <th className="text-left py-1.5 pr-3 font-medium">Categoría</th>
                            <th className="text-right py-1.5 font-medium">Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pm.expenses.map((exp) => {
                            // Primary = what actually left the account (originalAmount in its native currency).
                            const primaryAmount = exp.originalAmount ?? resolveExpenseAmount(exp)
                            const primaryCurrency = exp.originalCurrency ?? pm.currency
                            // Secondary = equivalent in project currency, shown only when currencies differ.
                            const projCurrency = exp.projectCurrency ?? pm.currency
                            const showConverted =
                              exp.convertedAmount != null && projCurrency !== primaryCurrency
                            return (
                              <tr
                                key={exp.expenseId}
                                className="border-b border-border/50 last:border-0"
                              >
                                <td className="py-1.5 pr-3 tabular-nums text-muted-foreground">
                                  {formatDate(exp.expenseDate, { fixTimezone: true })}
                                </td>
                                <td className="py-1.5 pr-3 font-medium text-foreground">
                                  {exp.title}
                                </td>
                                <td className="py-1.5 pr-3">{exp.projectName}</td>
                                <td className="py-1.5 pr-3">{exp.categoryName}</td>
                                <td className="py-1.5 text-right tabular-nums font-medium">
                                  <div className="flex flex-col items-end gap-0.5">
                                    <span>{primaryCurrency} {formatAmount(primaryAmount, "—")}</span>
                                    {showConverted && (
                                      <span className="text-[10px] text-muted-foreground font-normal">
                                        = {projCurrency} {formatAmount(exp.convertedAmount)}
                                      </span>
                                    )}
                                    {exp.currencyExchanges && exp.currencyExchanges.length > 0 && (
                                      <span className="text-[10px] text-muted-foreground font-normal text-right">
                                        {exp.currencyExchanges
                                          .slice(0, 2)
                                          .map(
                                            (item) =>
                                              `${item.currencyCode} ${formatAmount(item.convertedAmount, "—")}`
                                          )
                                          .join(" · ")}
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
                  </div>
                )}

                {/* Recent incomes */}
                {pm.incomes && pm.incomes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Ingresos
                      </span>
                      {pm.totalIncomesInPeriod != null &&
                        pm.incomesShown != null &&
                        pm.totalIncomesInPeriod > pm.incomesShown && (
                          <span className="text-xs text-muted-foreground">
                            Mostrando {pm.incomesShown} de {pm.totalIncomesInPeriod}
                          </span>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-left py-1.5 pr-3 font-medium">Fecha</th>
                            <th className="text-left py-1.5 pr-3 font-medium">Título</th>
                            <th className="text-left py-1.5 pr-3 font-medium">Proyecto</th>
                            <th className="text-left py-1.5 pr-3 font-medium">Categoría</th>
                            <th className="text-right py-1.5 font-medium">Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pm.incomes.map((inc) => {
                            const primaryAmount = resolveIncomeAmount(inc)
                            const primaryCurrency = inc.originalCurrency ?? pm.currency
                            const showConverted =
                              inc.convertedAmount != null && inc.projectCurrency !== primaryCurrency

                            return (
                              <tr
                                key={inc.incomeId}
                                className="border-b border-border/50 last:border-0"
                              >
                                <td className="py-1.5 pr-3 tabular-nums text-muted-foreground">
                                  {formatDate(inc.incomeDate, { fixTimezone: true })}
                                </td>
                                <td className="py-1.5 pr-3 font-medium text-foreground">
                                  {inc.title}
                                </td>
                                <td className="py-1.5 pr-3">{inc.projectName}</td>
                                <td className="py-1.5 pr-3">{inc.categoryName}</td>
                                <td className="py-1.5 text-right tabular-nums font-medium">
                                  <div className="flex flex-col items-end gap-0.5">
                                    <span>{primaryCurrency} {formatAmount(primaryAmount, "—")}</span>
                                    {showConverted && (
                                      <span className="text-[10px] text-muted-foreground font-normal">
                                        = {inc.projectCurrency} {formatAmount(inc.convertedAmount)}
                                      </span>
                                    )}
                                    {inc.currencyExchanges && inc.currencyExchanges.length > 0 && (
                                      <span className="text-[10px] text-muted-foreground font-normal text-right">
                                        {inc.currencyExchanges
                                          .slice(0, 2)
                                          .map(
                                            (item) =>
                                              `${item.currencyCode} ${formatAmount(item.convertedAmount, "—")}`
                                          )
                                          .join(" · ")}
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
                  </div>
                )}
              </div>
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

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
