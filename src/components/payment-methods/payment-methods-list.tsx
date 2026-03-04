"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { PAYMENT_METHOD_TYPE_LABEL, PAYMENT_METHOD_ACCENT } from "@/lib/constants"
import { formatDate } from "@/lib/format-utils"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import type { PaymentMethodResponse } from "@/types/payment-method"

interface PaymentMethodsListProps {
  paymentMethods: PaymentMethodResponse[]
  onEdit: (pm: PaymentMethodResponse) => void
  onDelete: (pm: PaymentMethodResponse) => void
}

function PaymentMethodsListComponent({ paymentMethods, onEdit, onDelete }: PaymentMethodsListProps) {
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
          <div className={cn("size-2 rounded-full shrink-0 mr-3.5", PAYMENT_METHOD_ACCENT[pm.type])} />

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
              {PAYMENT_METHOD_TYPE_LABEL[pm.type]}
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
          <ItemActionMenu
            ariaLabel="Acciones del método de pago"
            onEdit={() => onEdit(pm)}
            onDelete={() => onDelete(pm)}
          />
        </div>
      ))}
    </div>
  )
}

export const PaymentMethodsList = memo(PaymentMethodsListComponent)
