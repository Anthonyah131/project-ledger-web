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
import { AlertTriangle, ArrowRight } from "lucide-react"
import { formatDate } from "@/lib/date-utils"
import { formatAmount, formatCurrencyAmount } from "@/lib/format-utils"
import type {
  PartnerBalancesReportResponse,
  PartnerCurrencyTotal,
  PairwiseCurrencyTotal,
} from "@/types/report"
import type { CurrencyExchangeResponse } from "@/types/expense"

interface Props {
  report: PartnerBalancesReportResponse
}

// ── Alt-currency helpers ─────────────────────────────────────────────────────

type PartnerCurrencyField = "othersOweHim" | "heOwesOthers" | "settlementsPaid" | "settlementsReceived" | "netBalance"
type PairwiseCurrencyField = "aOwesB" | "bOwesA" | "settlementsAToB" | "settlementsBToA" | "netBalance"

function PartnerAltAmounts({
  totals,
  field,
  signed = false,
}: {
  totals: PartnerCurrencyTotal[]
  field: PartnerCurrencyField
  signed?: boolean
}) {
  const filtered = totals.filter((ct) => ct[field] !== 0)
  if (filtered.length === 0) return null
  return (
    <>
      {filtered.map((ct) => {
        const val = ct[field]
        return (
          <span key={ct.currencyCode} className="tabular-nums text-[10px] text-muted-foreground/80">
            {signed && val > 0 ? "+" : ""}
            {formatCurrencyAmount(val, ct.currencyCode)}
          </span>
        )
      })}
    </>
  )
}

function PairwiseAltAmounts({
  totals,
  field,
}: {
  totals: PairwiseCurrencyTotal[]
  field: PairwiseCurrencyField
}) {
  const filtered = totals.filter((ct) => ct[field] !== 0)
  if (filtered.length === 0) return null
  return (
    <>
      {filtered.map((ct) => (
        <span key={ct.currencyCode} className="tabular-nums text-[10px] text-muted-foreground/80">
          {formatCurrencyAmount(ct[field], ct.currencyCode)}
        </span>
      ))}
    </>
  )
}

function SettlementExchanges({ exchanges }: { exchanges: CurrencyExchangeResponse[] }) {
  if (exchanges.length === 0) return null
  return (
    <>
      {exchanges.map((ex) => (
        <span key={ex.currencyCode} className="tabular-nums text-[10px] text-muted-foreground/80">
          {formatCurrencyAmount(ex.convertedAmount, ex.currencyCode)}
        </span>
      ))}
    </>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

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
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
              {report.warnings!.length} transacción(es) sin tipos de cambio configurados
            </span>
            <span className="text-xs text-muted-foreground">
              Los totales en monedas alternativas pueden estar incompletos.
            </span>
            <div className="flex flex-col gap-0.5 mt-1">
              {report.warnings!.map((w) => (
                <span key={w.transactionId} className="text-xs text-muted-foreground">
                  · {w.title} — {formatDate(w.date)} ({formatCurrencyAmount(w.convertedAmount, report.currencyCode)})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Summary cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Partners" value={String(report.partners.length)} />
        <SummaryCard label="Settlements" value={String(report.settlements.length)} />
        <SummaryCard label="Moneda" value={report.currencyCode} />
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
                const altTotals = partner.currencyTotals ?? []

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
                        <div className="flex flex-col items-end">
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
                          <PartnerAltAmounts totals={altTotals} field="netBalance" signed />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-muted-foreground">
                      <div className="flex flex-col">
                        <span>Pagó físicamente</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(partner.paidPhysically)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span>Le deben otros</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(partner.othersOweHim)}
                        </span>
                        <PartnerAltAmounts totals={altTotals} field="othersOweHim" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span>Debe a otros</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(partner.heOwesOthers)}
                        </span>
                        <PartnerAltAmounts totals={altTotals} field="heOwesOthers" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span>Settlements pagados</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(partner.settlementsPaid)}
                        </span>
                        <PartnerAltAmounts totals={altTotals} field="settlementsPaid" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span>Settlements recibidos</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(partner.settlementsReceived)}
                        </span>
                        <PartnerAltAmounts totals={altTotals} field="settlementsReceived" />
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
            <div className="flex flex-col gap-3">
              {report.settlements.map((settlement) => {
                const showConverted =
                  settlement.currency !== report.currencyCode &&
                  settlement.convertedAmount !== settlement.amount
                const exchanges = settlement.currencyExchanges ?? []

                return (
                  <div
                    key={settlement.settlementId}
                    className="rounded-lg border bg-muted/30 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-foreground">{settlement.fromPartnerName}</span>
                          <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="font-semibold text-foreground">{settlement.toPartnerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="tabular-nums">{formatDate(settlement.settlementDate)}</span>
                          {settlement.description && (
                            <>
                              <span>·</span>
                              <span className="truncate">{settlement.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className="text-sm tabular-nums font-semibold text-foreground">
                          {report.currencyCode} {formatAmount(settlement.convertedAmount)}
                        </span>
                        {showConverted && (
                          <span className="text-[10px] tabular-nums text-muted-foreground/80">
                            {settlement.currency} {formatAmount(settlement.amount)}
                          </span>
                        )}
                        <SettlementExchanges exchanges={exchanges} />
                      </div>
                    </div>
                  </div>
                )
              })}
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
                const altTotals = pair.currencyTotals ?? []

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
                      {pair.netBalance === 0 ? (
                        <Badge variant="outline" className="font-mono border-border text-muted-foreground">
                          Saldado
                        </Badge>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-sm tabular-nums font-semibold text-foreground">
                            {report.currencyCode} {formatAmount(Math.abs(pair.netBalance))}
                          </span>
                          <PairwiseAltAmounts totals={altTotals.map((ct) => ({ ...ct, netBalance: Math.abs(ct.netBalance) }))} field="netBalance" />
                        </div>
                      )}
                    </div>
                    {/* Gross breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
                      <div className="flex flex-col gap-0.5">
                        <span>{pair.partnerAName} debe a {pair.partnerBName}</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(pair.aOwesB)}
                        </span>
                        <PairwiseAltAmounts totals={altTotals} field="aOwesB" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span>{pair.partnerBName} debe a {pair.partnerAName}</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(pair.bOwesA)}
                        </span>
                        <PairwiseAltAmounts totals={altTotals} field="bOwesA" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span>Settlements {pair.partnerAName} → {pair.partnerBName}</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(pair.settlementsAToB)}
                        </span>
                        <PairwiseAltAmounts totals={altTotals} field="settlementsAToB" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span>Settlements {pair.partnerBName} → {pair.partnerAName}</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {report.currencyCode} {formatAmount(pair.settlementsBToA)}
                        </span>
                        <PairwiseAltAmounts totals={altTotals} field="settlementsBToA" />
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
