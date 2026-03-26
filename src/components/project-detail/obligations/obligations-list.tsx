"use client"

import { memo } from "react"
import { useLanguage } from "@/context/language-context"
import { Badge } from "@/components/ui/badge"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import { getAccentColorRaw, STATUS_COLORS, getObligationStatusLabel } from "@/lib/constants"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import type { ObligationResponse } from "@/types/obligation"

interface ObligationsListProps {
  obligations: ObligationResponse[]
  onEdit: (obl: ObligationResponse) => void
  onDelete: (obl: ObligationResponse) => void
}

function ObligationsListComponent({
  obligations,
  onEdit,
  onDelete,
}: ObligationsListProps) {
  const { t } = useLanguage()
  return (
    <div className="rounded-xl border border-violet-500/20 bg-card shadow-sm shadow-violet-500/5 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_100px_100px_1fr_auto_auto] items-center gap-4 px-5 py-2.5 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent border-b border-violet-500/20">
        <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
          {t("obligations.colTitle")}
        </span>
        <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
          {t("obligations.colDueDate")}
        </span>
        <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest text-right">
          {t("obligations.colTotal")}
        </span>
        <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
          {t("obligations.colProgress")}
        </span>
        <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest w-24 text-center">
          {t("obligations.colStatus")}
        </span>
        <span className="w-8" />
      </div>

      {/* Rows */}
      {obligations.map((obl, idx) => {
        const accent = getAccentColorRaw(idx)
        const sc = STATUS_COLORS[obl.status]
        const pct = obl.totalAmount > 0
          ? Math.min(100, Math.round((obl.paidAmount / obl.totalAmount) * 100))
          : 0

        return (
          <div
            key={obl.id}
            className="group grid grid-cols-[1fr_100px_100px_1fr_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-violet-500/5 transition-colors duration-150 border-t border-border/50 first:border-t-0"
          >
            {/* Title + currency badge */}
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="size-2.5 shrink-0 rounded-full ring-2 ring-offset-1 ring-offset-card"
                style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}60` }}
              />
              <div className="min-w-0">
                <span className="text-sm font-semibold truncate block">{obl.title}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-0.5 border-violet-500/30 text-violet-600 dark:text-violet-400">
                  {obl.currency}
                </Badge>
              </div>
            </div>

            {/* Due date */}
            <span className="text-xs text-muted-foreground">
              {formatDate(obl.dueDate, { fixTimezone: true, fallback: t("obligations.noDueDate") })}
            </span>

            {/* Total */}
            <span className="text-sm tabular-nums font-bold text-right">
              {formatAmount(obl.totalAmount, "")}
            </span>

            {/* Progress */}
            <div className="flex flex-col gap-1">
              <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden border border-border/50">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: sc.color,
                    boxShadow: `0 0 4px ${sc.color}80`,
                  }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground">
                {formatAmount(obl.paidAmount, "")} {t("obligations.paidLabel")}
              </span>
            </div>

            {/* Status badge */}
            <div className="w-24 flex justify-center">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sc.bg} ${sc.text}`}
              >
                <span className={`size-1.5 rounded-full ${sc.dot}`} />
                {getObligationStatusLabel(obl.status, t)}
              </span>
            </div>

            {/* Actions */}
            <div className="w-8 flex justify-end">
              <ItemActionMenu
                variant="ghost"
                onEdit={() => onEdit(obl)}
                onDelete={() => onDelete(obl)}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const ObligationsList = memo(ObligationsListComponent)
