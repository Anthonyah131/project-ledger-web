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
import { PaymentMethodReportMethodCard } from "./payment-method-report-method-card"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import type { PaymentMethodReportResponse } from "@/types/report"
import { useLanguage } from "@/context/language-context"

interface Props {
  report: PaymentMethodReportResponse
}

export function PaymentMethodReportResults({ report }: Props) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-6">
      {/* ── Summary cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard
          label={t("reports.pm.label")}
          value={String(report.paymentMethods.length)}
        />
        <SummaryCard
          label={t("reports.shared.period")}
          value={
            report.dateFrom && report.dateTo
              ? `${formatDate(report.dateFrom)} – ${formatDate(report.dateTo)}`
              : t("reports.shared.allHistory")
          }
        />
        <SummaryCard
          label={t("reports.shared.generated")}
          value={formatDate(report.generatedAt)}
        />
      </div>

      {/* ── Payment methods breakdown ─────────────────────────── */}
      {report.paymentMethods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("reports.pm.label")}</CardTitle>
            <CardDescription>
              {t("reports.pm.breakdownDesc")}
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

      {/* ── Monthly trend (per method) ────────────────────────── */}
      {report.monthlyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("reports.shared.monthlyTrendTitle")}</CardTitle>
            <CardDescription>
              {t("reports.pm.monthlyTrendDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {report.monthlyTrend.map((mt) => (
                <div
                  key={`${mt.year}-${mt.month}`}
                  className="rounded-lg border bg-muted/30 px-4 py-3"
                >
                  <span className="text-sm font-medium block mb-2">
                    {mt.monthLabel}
                  </span>
                  <div className="flex flex-col gap-2">
                    {mt.byMethod.map((bm) => {
                      const income = bm.totalIncome ?? 0
                      const net = bm.netFlow ?? income - bm.totalSpent

                      return (
                        <div
                          key={bm.paymentMethodId}
                          className="flex items-center gap-3 text-xs"
                        >
                          <div className="flex items-center gap-1.5 w-40 shrink-0">
                            <span className="font-medium truncate">{bm.name}</span>
                            <Badge variant="secondary" className="text-[9px] font-mono px-1 py-0">
                              {bm.currency}
                            </Badge>
                          </div>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                net >= 0 ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  Math.abs(net) /
                                    Math.max(
                                      ...mt.byMethod.map((m) =>
                                        Math.abs(m.netFlow ?? (m.totalIncome ?? 0) - m.totalSpent)
                                      ),
                                      1,
                                    ) * 100,
                                  100,
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-muted-foreground w-10 text-center tabular-nums">
                            {bm.expenseCount}/{bm.incomeCount ?? 0}
                          </span>
                          <div className="tabular-nums w-52 text-right flex flex-col">
                            <span>{t("reports.shared.trendSpent")} {bm.currency} {formatAmount(bm.totalSpent)}</span>
                            <span>{t("reports.shared.trendIncome")} {bm.currency} {formatAmount(income)}</span>
                            <span className="font-semibold">{t("reports.shared.trendNet")} {bm.currency} {formatAmount(net)}</span>
                          </div>
                        </div>
                      )
                    })}
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
