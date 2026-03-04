"use client"

import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import { getAccentColorRaw, STATUS_COLORS } from "@/lib/constants"
import { formatAmount, formatDate } from "@/lib/format-utils"
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
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_100px_100px_1fr_auto_auto] items-center gap-4 px-5 py-2 bg-muted/30">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
          Titulo
        </span>
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
          Vence
        </span>
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest text-right">
          Total
        </span>
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
          Progreso
        </span>
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest w-24 text-center">
          Estado
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
            className="group grid grid-cols-[1fr_100px_100px_1fr_auto_auto] items-center gap-4 px-5 py-3 hover:bg-accent/30 transition-colors duration-150 border-t first:border-t-0"
          >
            {/* Title + currency badge */}
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <div className="min-w-0">
                <span className="text-sm font-medium truncate block">{obl.title}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-0.5">
                  {obl.currency}
                </Badge>
              </div>
            </div>

            {/* Due date */}
            <span className="text-xs text-muted-foreground">
              {formatDate(obl.dueDate, { fixTimezone: true, fallback: "Sin vencimiento" })}
            </span>

            {/* Total */}
            <span className="text-sm tabular-nums font-medium text-right">
              {formatAmount(obl.totalAmount, "")}
            </span>

            {/* Progress */}
            <div className="flex flex-col gap-1">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: sc.color,
                  }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground">
                {formatAmount(obl.paidAmount, "")} pagado
              </span>
            </div>

            {/* Status badge */}
            <div className="w-24 flex justify-center">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${sc.bg} ${sc.text}`}
              >
                <span className={`size-1.5 rounded-full ${sc.dot}`} />
                {sc.label}
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
