"use client"

// components/reports/partner-balances-report-results.tsx
// Renders JSON results for the partner balances report.

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import type { PartnerBalancesReportResponse } from "@/types/report"

interface Props {
  report: PartnerBalancesReportResponse
}

export function PartnerBalancesReportResults({ report }: Props) {
  const hasSettlements = report.settlements.length > 0
  const hasPairwise = report.pairwiseBalances.length > 0
  const hasWarnings = (report.warnings?.length ?? 0) > 0

  return (
    <div className="flex flex-col gap-6">
      {/* ── Warnings banner ──────────────────────────────────── */}
      {hasWarnings && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700 dark:text-amber-400">
            {report.warnings!.length} transacción(es) no tienen tipos de cambio
            configurados para todas las monedas. Los totales en monedas
            alternativas pueden estar incompletos.
          </div>
        </div>
      )}

      {/* ── Summary cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Partners"
          value={String(report.partners.length)}
        />
        <SummaryCard
          label="Settlements"
          value={String(report.settlements.length)}
        />
        <SummaryCard
          label="Moneda"
          value={report.currencyCode}
        />
        <SummaryCard
          label="Periodo"
          value={
            report.dateFrom && report.dateTo
              ? `${formatDate(report.dateFrom)} – ${formatDate(report.dateTo)}`
              : "Todo el historial"
          }
        />
      </div>

      {/* ── Partner balances ──────────────────────────────────── */}
      {report.partners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Balances por partner</CardTitle>
            <CardDescription>
              Balance neto de cada partner. Positivo = le deben, negativo = debe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {report.partners.map((partner) => {
                const isPositive = partner.netBalance >= 0
                return (
                  <div
                    key={partner.partnerId}
                    className="rounded-lg border bg-muted/30 px-4 py-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{partner.partnerName}</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`font-mono ${
                            partner.netBalance === 0
                              ? "border-border text-muted-foreground"
                              : isPositive
                                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                : "border-rose-500/30 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {partner.netBalance === 0
                            ? "Saldado"
                            : isPositive
                              ? "Le deben"
                              : "Debe"}
                        </Badge>
                        <span
                          className={`text-sm tabular-nums font-semibold ${
                            partner.netBalance === 0
                              ? "text-muted-foreground"
                              : isPositive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {report.currencyCode} {formatAmount(partner.netBalance)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-muted-foreground">
                      <div className="flex flex-col">
                        <span>Pagó físicamente</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(partner.paidPhysically)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span>Le deben otros</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(partner.othersOweHim)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span>Debe a otros</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(partner.heOwesOthers)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span>Settlements pagados</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(partner.settlementsPaid)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span>Settlements recibidos</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(partner.settlementsReceived)}
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

      {/* ── Settlements list ──────────────────────────────────── */}
      {hasSettlements && (
        <Card>
          <CardHeader>
            <CardTitle>Settlements</CardTitle>
            <CardDescription>
              Pagos entre partners registrados en el periodo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 pr-4 font-medium">Fecha</th>
                    <th className="text-left py-2 pr-4 font-medium">De</th>
                    <th className="text-left py-2 pr-4 font-medium">Para</th>
                    <th className="text-left py-2 pr-4 font-medium">Descripción</th>
                    <th className="text-right py-2 font-medium">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {report.settlements.map((settlement) => {
                    const showConverted =
                      settlement.currency !== report.currencyCode &&
                      settlement.convertedAmount !== settlement.amount

                    return (
                      <tr
                        key={settlement.settlementId}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-2 pr-4 tabular-nums text-muted-foreground">
                          {formatDate(settlement.settlementDate)}
                        </td>
                        <td className="py-2 pr-4 font-medium text-foreground">
                          {settlement.fromPartnerName}
                        </td>
                        <td className="py-2 pr-4 font-medium text-foreground">
                          {settlement.toPartnerName}
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground max-w-40 truncate">
                          {settlement.description || "—"}
                        </td>
                        <td className="py-2 text-right tabular-nums font-medium">
                          <div className="flex flex-col items-end gap-0.5">
                            <span>
                              {report.currencyCode} {formatAmount(settlement.convertedAmount)}
                            </span>
                            {showConverted && (
                              <span className="text-[10px] text-muted-foreground font-normal">
                                {settlement.currency} {formatAmount(settlement.amount)}
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
          </CardContent>
        </Card>
      )}

      {/* ── Pairwise balances ─────────────────────────────────── */}
      {hasPairwise && (
        <Card>
          <CardHeader>
            <CardTitle>Balances entre pares</CardTitle>
            <CardDescription>
              Desglose bruto y neto entre cada par de partners. Positivo = A le debe a B.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {report.pairwiseBalances.map((pair) => {
                const isPositive = pair.netBalance >= 0
                const owes = isPositive ? pair.partnerAName : pair.partnerBName
                const owed = isPositive ? pair.partnerBName : pair.partnerAName

                return (
                  <div
                    key={`${pair.partnerAId}-${pair.partnerBId}`}
                    className="rounded-lg border bg-muted/30 px-4 py-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">
                          {pair.partnerAName} — {pair.partnerBName}
                        </span>
                        {pair.netBalance !== 0 && (
                          <span className="text-xs text-muted-foreground">
                            {owes} le debe a {owed}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-sm tabular-nums font-semibold ${
                          pair.netBalance === 0
                            ? "text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {pair.netBalance === 0 ? (
                          <Badge variant="outline" className="font-mono border-border text-muted-foreground">
                            Saldado
                          </Badge>
                        ) : (
                          `${report.currencyCode} ${formatAmount(Math.abs(pair.netBalance))}`
                        )}
                      </span>
                    </div>
                    {/* Gross breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
                      <div className="flex flex-col">
                        <span>{pair.partnerAName} debe a {pair.partnerBName}</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(pair.aOwesB)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span>{pair.partnerBName} debe a {pair.partnerAName}</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(pair.bOwesA)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span>Settlements {pair.partnerAName} → {pair.partnerBName}</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(pair.settlementsAToB)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span>Settlements {pair.partnerBName} → {pair.partnerAName}</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(pair.settlementsBToA)}
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
