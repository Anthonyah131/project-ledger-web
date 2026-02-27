"use client"

import { Pencil, Trash2, MoreHorizontal } from "lucide-react"
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

// Same accent palette as project list-view, mapped per type
const ACCENT_DOT: Record<PaymentMethodType, string> = {
  bank: "bg-[oklch(0.55_0.14_280)]",
  card: "bg-primary",
  cash: "bg-[oklch(0.60_0.16_155)]",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

interface PaymentMethodsListProps {
  paymentMethods: PaymentMethodResponse[]
  onEdit: (pm: PaymentMethodResponse) => void
  onDelete: (pm: PaymentMethodResponse) => void
}

export function PaymentMethodsList({ paymentMethods, onEdit, onDelete }: PaymentMethodsListProps) {
  return (
    <div role="list" aria-label="Métodos de pago">
      {/* Header */}
      <div className="flex items-center px-5 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-widest border-b border-border bg-muted/30">
        <span className="flex-1">Método</span>
        <span className="w-20 text-center hidden sm:block">Tipo</span>
        <span className="w-16 text-center hidden sm:block">Moneda</span>
        <span className="w-40 hidden md:block">Banco / Emisor</span>
        <span className="w-28 text-right hidden lg:block">Actualizado</span>
        <span className="w-8" />
      </div>

      {paymentMethods.map((pm) => (
        <div
          key={pm.id}
          role="listitem"
          className={cn(
            "group flex items-center px-5 py-3.5",
            "border-b border-border last:border-b-0",
            "hover:bg-accent/30 transition-colors duration-150",
          )}
        >
          {/* Accent dot */}
          <div className={cn("size-2 rounded-full shrink-0 mr-3.5", ACCENT_DOT[pm.type])} />

          {/* Name + subtitle */}
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-sm font-medium text-foreground truncate leading-snug">
              {pm.name}
            </p>
            {(pm.accountNumber || pm.description) && (
              <p className="text-xs text-muted-foreground truncate mt-0.5 leading-relaxed">
                {pm.accountNumber ?? pm.description}
              </p>
            )}
          </div>

          {/* Type badge */}
          <div className="w-20 flex justify-center sm:flex">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">
              {TYPE_LABEL[pm.type]}
            </Badge>
          </div>

          {/* Currency */}
          <span className="w-16 text-center text-xs font-medium text-foreground/80 hidden sm:block">
            {pm.currency}
          </span>

          {/* Bank / issuer */}
          <span className="w-40 text-xs text-muted-foreground truncate hidden md:block">
            {pm.bankName ?? "—"}
          </span>

          {/* Updated date */}
          <span className="w-28 text-right text-xs text-muted-foreground tabular-nums hidden lg:block">
            {formatDate(pm.updatedAt)}
          </span>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "shrink-0 ml-2 flex items-center justify-center size-7 rounded-md",
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
              <DropdownMenuItem onClick={() => onEdit(pm)}>
                <Pencil className="size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(pm)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  )
}
