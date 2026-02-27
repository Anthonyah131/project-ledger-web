"use client"

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { ObligationResponse, ObligationStatus } from "@/types/obligation"

const ACCENT_COLORS = [
  "oklch(0.55 0.20 255)",
  "oklch(0.55 0.20 290)",
  "oklch(0.55 0.20 330)",
  "oklch(0.60 0.18 20)",
  "oklch(0.60 0.16 55)",
  "oklch(0.55 0.18 145)",
  "oklch(0.50 0.15 200)",
  "oklch(0.55 0.18 175)",
]

const STATUS_COLORS: Record<ObligationStatus, { dot: string; bg: string; text: string; label: string }> = {
  open: {
    dot: "bg-primary",
    bg: "bg-primary/10",
    text: "text-primary",
    label: "Abierta",
  },
  partially_paid: {
    dot: "bg-[oklch(0.62_0.14_85)]",
    bg: "bg-[oklch(0.62_0.14_85)]/10",
    text: "text-[oklch(0.62_0.14_85)]",
    label: "Pago parcial",
  },
  paid: {
    dot: "bg-[oklch(0.60_0.16_155)]",
    bg: "bg-[oklch(0.60_0.16_155)]/10",
    text: "text-[oklch(0.60_0.16_155)]",
    label: "Pagada",
  },
  overdue: {
    dot: "bg-[oklch(0.58_0.16_30)]",
    bg: "bg-[oklch(0.58_0.16_30)]/10",
    text: "text-[oklch(0.58_0.16_30)]",
    label: "Vencida",
  },
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("es", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(date: string | null): string {
  if (!date) return "Sin vencimiento"
  const d = new Date(`${date}T00:00:00`)
  return d.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })
}

interface ObligationsListProps {
  obligations: ObligationResponse[]
  onEdit: (obl: ObligationResponse) => void
  onDelete: (obl: ObligationResponse) => void
}

export function ObligationsList({
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
        const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length]
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
              {formatDate(obl.dueDate)}
            </span>

            {/* Total */}
            <span className="text-sm tabular-nums font-medium text-right">
              {formatAmount(obl.totalAmount)}
            </span>

            {/* Progress */}
            <div className="flex flex-col gap-1">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: sc.dot.startsWith("bg-primary")
                      ? "var(--primary)"
                      : sc.dot.replace("bg-", "").replace("[", "").replace("]", ""),
                  }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground">
                {formatAmount(obl.paidAmount)} pagado
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors"
                  >
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Opciones</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(obl)}>
                    <Pencil className="size-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(obl)}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )
      })}
    </div>
  )
}
