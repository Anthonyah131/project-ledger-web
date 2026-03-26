"use client"

import { TrendingUp, TrendingDown, Minus, History, Lightbulb, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrencyAmount } from "@/lib/format-utils"
import { useLanguage } from "@/context/language-context"
import type {
  PartnerBalanceItem,
  PartnerCurrencyTotal,
  PairwiseBalanceItem,
  MissingCurrencyExchangeWarning,
  PartnersBalanceResponse,
} from "@/types/partner-settlement"

// ─── Alt-currency amounts helper ───────────────────────────────────────────────

type PartnerCurrencyNumericField = "othersOweHim" | "heOwesOthers" | "settlementsPaid" | "settlementsReceived" | "netBalance"

interface AltAmountsProps {
  totals: PartnerCurrencyTotal[]
  field: PartnerCurrencyNumericField
  signed?: boolean
}

function AltAmounts({ totals, field, signed = false }: AltAmountsProps) {
  const filtered = totals.filter((ct) => (ct[field] as number) !== 0)
  if (filtered.length === 0) return null
  return (
    <>
      {filtered.map((ct) => {
        const val = ct[field] as number
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

// ─── Individual partner card ───────────────────────────────────────────────────

interface PartnerBalanceCardProps {
  partner: PartnerBalanceItem
  currency: string
  onViewHistory: (partner: PartnerBalanceItem) => void
}

function PartnerBalanceCard({ partner, currency, onViewHistory }: PartnerBalanceCardProps) {
  const { t } = useLanguage()
  const isPositive = partner.netBalance > 0
  const isNegative = partner.netBalance < 0
  const isZero = partner.netBalance === 0

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5 flex flex-col gap-4 hover:border-violet-500/40 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{partner.partnerName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("partnerSettlements.paidPhysically", { amount: formatCurrencyAmount(partner.paidPhysically, currency) })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 size-7 text-muted-foreground hover:text-foreground"
          onClick={() => onViewHistory(partner)}
          title={t("partnerSettlements.viewHistory")}
        >
          <History className="size-3.5" />
        </Button>
      </div>

      {/* Net balance */}
      <div className="flex items-center gap-2">
        {isPositive && <TrendingUp className="size-4 text-emerald-500 shrink-0" />}
        {isNegative && <TrendingDown className="size-4 text-rose-500 shrink-0" />}
        {isZero && <Minus className="size-4 text-muted-foreground shrink-0" />}
        <div>
          <p
            className={`text-xl font-bold tabular-nums ${
              isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : isNegative
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-muted-foreground"
            }`}
          >
            {isPositive && "+"}
            {formatCurrencyAmount(partner.netBalance, currency)}
          </p>
          {partner.currencyTotals.map((ct) => (
            <p key={ct.currencyCode} className={`text-[11px] tabular-nums ${ct.netBalance > 0 ? "text-emerald-600/70 dark:text-emerald-400/70" : ct.netBalance < 0 ? "text-rose-600/70 dark:text-rose-400/70" : "text-muted-foreground"}`}>
              {ct.netBalance > 0 ? "+" : ""}
              {formatCurrencyAmount(ct.netBalance, ct.currencyCode)}
            </p>
          ))}
          <p className="text-[11px] text-muted-foreground">
            {isPositive ? t("partnerSettlements.owedLabel") : isNegative ? t("partnerSettlements.owesLabel") : t("partnerSettlements.balancedLabel")}
          </p>
        </div>
      </div>

      {/* Detail breakdown */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-border/50">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("partnerSettlements.othersOweHim")}</span>
          <div className="flex flex-col items-end gap-0.5">
            <span className="tabular-nums font-medium text-foreground">
              {formatCurrencyAmount(partner.othersOweHim, currency)}
            </span>
            <AltAmounts totals={partner.currencyTotals} field="othersOweHim" />
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("partnerSettlements.heOwesOthers")}</span>
          <div className="flex flex-col items-end gap-0.5">
            <span className="tabular-nums font-medium text-foreground">
              {formatCurrencyAmount(partner.heOwesOthers, currency)}
            </span>
            <AltAmounts totals={partner.currencyTotals} field="heOwesOthers" />
          </div>
        </div>
        {(partner.settlementsPaid > 0 || partner.settlementsReceived > 0) && (
          <>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("partnerSettlements.settlementsPaidLabel")}</span>
              <div className="flex flex-col items-end gap-0.5">
                <span className="tabular-nums font-medium text-foreground">
                  {formatCurrencyAmount(partner.settlementsPaid, currency)}
                </span>
                <AltAmounts totals={partner.currencyTotals} field="settlementsPaid" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("partnerSettlements.settlementsReceivedLabel")}</span>
              <div className="flex flex-col items-end gap-0.5">
                <span className="tabular-nums font-medium text-foreground">
                  {formatCurrencyAmount(partner.settlementsReceived, currency)}
                </span>
                <AltAmounts totals={partner.currencyTotals} field="settlementsReceived" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Pairwise section ──────────────────────────────────────────────────────────

interface PairwiseSectionProps {
  pairwiseBalances: PairwiseBalanceItem[]
  currency: string
}

function PairwiseSection({ pairwiseBalances, currency }: PairwiseSectionProps) {
  const { t } = useLanguage()
  if (pairwiseBalances.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        {t("partnerSettlements.pairwiseTitle")}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pairwiseBalances.map((pw) => {
          // netBalance < 0 → B owes A; netBalance > 0 → A owes B
          const bOwesA = pw.netBalance < 0
          const balanced = pw.netBalance === 0
          const debtorName = bOwesA ? pw.partnerBName : pw.partnerAName
          const creditorName = bOwesA ? pw.partnerAName : pw.partnerBName
          const amount = Math.abs(pw.netBalance)

          return (
            <div
              key={`${pw.partnerAId}-${pw.partnerBId}`}
              className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between text-sm font-medium text-foreground">
                <span>{pw.partnerAName}</span>
                <span className="text-muted-foreground">↔</span>
                <span>{pw.partnerBName}</span>
              </div>
              {balanced ? (
                <p className="text-xs text-muted-foreground text-center">{t("partnerSettlements.pairwiseBalanced")}</p>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs text-muted-foreground text-center">
                    <span className="font-semibold text-foreground">{debtorName}</span>
                    {` ${t("partnerSettlements.pairwiseOwes")} `}
                    <span className={`font-semibold tabular-nums ${bOwesA ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {formatCurrencyAmount(amount, currency)}
                    </span>
                    {` ${t("partnerSettlements.pairwiseTo")} `}
                    <span className="font-semibold text-foreground">{creditorName}</span>
                  </p>
                  {(() => {
                    const nonZero = pw.currencyTotals.filter((ct) => ct.netBalance !== 0)
                    return nonZero.length > 0 ? (
                      <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5">
                        {nonZero.map((ct) => (
                          <span key={ct.currencyCode} className="text-[10px] tabular-nums text-muted-foreground/80">
                            {formatCurrencyAmount(Math.abs(ct.netBalance), ct.currencyCode)}
                          </span>
                        ))}
                      </div>
                    ) : null
                  })()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Warnings banner ───────────────────────────────────────────────────────────

interface WarningsBannerProps {
  warnings: MissingCurrencyExchangeWarning[]
  currency: string
}

function WarningsBanner({ warnings, currency }: WarningsBannerProps) {
  const { t } = useLanguage()
  if (warnings.length === 0) return null

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex gap-3">
      <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
          {t("partnerSettlements.warningsTitle")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("partnerSettlements.warningsDesc")}
        </p>
        <div className="flex flex-col gap-0.5 mt-1">
          {warnings.map((w) => (
            <p key={w.transactionId} className="text-xs text-muted-foreground">
              · {w.title} — {w.date} ({formatCurrencyAmount(w.convertedAmount, currency)})
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────────

interface PartnerBalanceCardsProps {
  balance: PartnersBalanceResponse
  onViewHistory: (partner: PartnerBalanceItem) => void
  onSuggest: () => void
}

export function PartnerBalanceCards({
  balance,
  onViewHistory,
  onSuggest,
}: PartnerBalanceCardsProps) {
  const { t } = useLanguage()
  if (balance.partners.length === 0) return null

  const allBalanced = balance.partners.every((p) => p.netBalance === 0)

  return (
    <div className="flex flex-col gap-5">
      {/* Warnings */}
      <WarningsBanner warnings={balance.warnings} currency={balance.currency} />

      {/* Individual cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {balance.partners.map((partner) => (
          <PartnerBalanceCard
            key={partner.partnerId}
            partner={partner}
            currency={balance.currency}
            onViewHistory={onViewHistory}
          />
        ))}
      </div>

      {/* Pairwise */}
      <PairwiseSection pairwiseBalances={balance.pairwiseBalances} currency={balance.currency} />

      {/* Suggest button */}
      {!allBalanced && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onSuggest}>
            <Lightbulb className="size-4" />
            {t("partnerSettlements.howToSettle")}
          </Button>
        </div>
      )}
    </div>
  )
}
