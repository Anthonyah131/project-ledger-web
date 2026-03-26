"use client"

import { Pencil, Trash2, ArrowRight } from "lucide-react"
import { formatDate } from "@/lib/date-utils"
import { useLanguage } from "@/context/language-context"
import type { PartnerSettlementResponse } from "@/types/partner-settlement"

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

interface SettlementsListProps {
  settlements: PartnerSettlementResponse[]
  projectCurrency: string
  canEdit: boolean
  onEdit: (settlement: PartnerSettlementResponse) => void
  onDelete: (settlement: PartnerSettlementResponse) => void
}

export function SettlementsList({
  settlements,
  projectCurrency,
  canEdit,
  onEdit,
  onDelete,
}: SettlementsListProps) {
  const { t } = useLanguage()
  return (
    <div className="rounded-xl border border-violet-500/20 bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-5 py-2.5 text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest border-b border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent">
        <span className="flex-1">{t("partnerSettlements.colFromTo")}</span>
        <span className="w-32 text-right hidden sm:block">{t("common.date")}</span>
        <span className="w-36 text-right">{t("common.amount")}</span>
        {canEdit && <span className="w-16" />}
      </div>

      {/* Rows */}
      {settlements.map((s) => {
        const isMultiCurrency = s.currency !== projectCurrency && s.exchangeRate !== 1
        return (
          <div
            key={s.id}
            className="group flex items-center px-5 py-3.5 border-b border-border/50 last:border-b-0 hover:bg-violet-500/5 transition-colors duration-150"
          >
            {/* Partners */}
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <span className="truncate max-w-[120px]">{s.fromPartnerName}</span>
                <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate max-w-[120px]">{s.toPartnerName}</span>
              </div>
              {s.description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.description}</p>
              )}
            </div>

            {/* Date */}
            <span className="w-32 text-right text-xs text-muted-foreground hidden sm:block shrink-0">
              {formatDate(s.settlementDate)}
            </span>

            {/* Amount */}
            <div className="w-36 text-right shrink-0">
              <p className="text-sm font-semibold tabular-nums text-foreground">
                {formatAmount(s.convertedAmount, projectCurrency)}
              </p>
              {isMultiCurrency && (
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  {formatAmount(s.amount, s.currency)} × {s.exchangeRate}
                </p>
              )}
            </div>

            {/* Actions */}
            {canEdit && (
              <div className="w-16 flex justify-end gap-1 shrink-0">
                <button
                  onClick={() => onEdit(s)}
                  className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={t("partnerSettlements.editAria")}
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => onDelete(s)}
                  className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={t("partnerSettlements.deleteAria")}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
