"use client"

import { useRouter } from "next/navigation"
import { Pencil, Trash2, ArrowRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { PaymentMethodResponse, PaymentMethodType } from "@/types/payment-method"

const TYPE_LABEL: Record<PaymentMethodType, string> = {
  bank: "Banco",
  cash: "Efectivo",
  card: "Tarjeta",
}

const ACCENT_BAR: Record<PaymentMethodType, string> = {
  bank: "bg-[oklch(0.55_0.14_280)]",
  card: "bg-primary",
  cash: "bg-[oklch(0.60_0.16_155)]",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
  })
}

interface ShelfViewProps {
  paymentMethods: PaymentMethodResponse[]
  onEdit: (pm: PaymentMethodResponse) => void
  onDelete: (pm: PaymentMethodResponse) => void
}

export function PaymentMethodsShelfView({ paymentMethods, onEdit, onDelete }: ShelfViewProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border"
      role="list"
      aria-label="Métodos de pago"
    >
      {paymentMethods.map((pm) => (
        <PaymentMethodCard key={pm.id} pm={pm} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}

function PaymentMethodCard({
  pm,
  onEdit,
  onDelete,
}: {
  pm: PaymentMethodResponse
  onEdit: (pm: PaymentMethodResponse) => void
  onDelete: (pm: PaymentMethodResponse) => void
}) {
  const router = useRouter()

  return (
    <div
      role="listitem"
      className={cn(
        "group relative bg-card flex flex-col",
        "transition-colors duration-150",
        "hover:bg-accent/30 cursor-pointer",
      )}
      onClick={() => router.push(`/payment-methods/${pm.id}/expenses`)}
    >
      <div className="flex flex-1 gap-4 p-5">
        {/* Accent bar */}
        <div className={cn("w-1 shrink-0 rounded-full self-stretch", ACCENT_BAR[pm.type])} />

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Top: name + menu */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground leading-snug truncate">
                {pm.name}
              </h3>
              {(pm.bankName || pm.description) && (
                <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">
                  {pm.bankName ?? pm.description}
                </p>
              )}
            </div>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "shrink-0 flex items-center justify-center size-7 rounded-md",
                    "text-muted-foreground/0 group-hover:text-muted-foreground",
                    "hover:bg-accent hover:text-foreground",
                    "transition-all duration-150",
                    "focus-visible:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  )}
                  aria-label="Acciones del método de pago"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/payment-methods/${pm.id}/expenses`)
                  }}
                >
                  <ArrowRight className="size-4" />
                  Ver gastos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onEdit(pm) }}
                >
                  <Pencil className="size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(pm) }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bottom: metadata */}
          <div className="flex items-center gap-2 mt-auto">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">
              {TYPE_LABEL[pm.type]}
            </Badge>
            <span className="text-border">{"/"}</span>
            <span className="text-xs font-medium text-foreground/80">{pm.currency}</span>
            {pm.accountNumber && (
              <>
                <span className="text-border">{"/"}</span>
                <span className="text-xs text-muted-foreground truncate">{pm.accountNumber}</span>
              </>
            )}
            <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
              {formatDate(pm.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
