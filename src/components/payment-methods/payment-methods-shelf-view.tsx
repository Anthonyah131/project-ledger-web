"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { PAYMENT_METHOD_TYPE_LABEL, PAYMENT_METHOD_ACCENT } from "@/lib/constants"
import { formatDate } from "@/lib/date-utils"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import type { PaymentMethodResponse } from "@/types/payment-method"

interface ShelfViewProps {
  paymentMethods: PaymentMethodResponse[]
  onEdit: (pm: PaymentMethodResponse) => void
  onDelete: (pm: PaymentMethodResponse) => void
}

function PaymentMethodsShelfViewComponent({ paymentMethods, onEdit, onDelete }: ShelfViewProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-cyan-500/10"
      role="list"
      aria-label="Métodos de pago"
    >
      {paymentMethods.map((pm) => (
        <PaymentMethodCard key={pm.id} pm={pm} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}

export const PaymentMethodsShelfView = memo(PaymentMethodsShelfViewComponent)

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
        "transition-all duration-150",
        "hover:bg-cyan-500/5 hover:shadow-sm cursor-pointer",
      )}
      onClick={() => router.push(`/payment-methods/${pm.id}`)}
    >
      <div className="flex flex-1 gap-4 p-5">
        {/* Accent bar — thicker, glowing */}
        <div className={cn("w-1.5 shrink-0 rounded-full self-stretch shadow-sm", PAYMENT_METHOD_ACCENT[pm.type])} />

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Top: name + menu */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground leading-snug truncate">
                {pm.name}
              </h3>
              {(pm.bankName || pm.description) && (
                <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">
                  {pm.bankName ?? pm.description}
                </p>
              )}
            </div>

            {/* Menu */}
            <ItemActionMenu
              ariaLabel="Acciones del método de pago"
              onOpen={() => router.push(`/payment-methods/${pm.id}`)}
              openLabel="Ver detalle"
              onEdit={() => onEdit(pm)}
              onDelete={() => onDelete(pm)}
              stopPropagation
            />
          </div>

          {/* Bottom: metadata */}
          <div className="flex items-center gap-2 mt-auto">
            <Badge className="text-[10px] px-1.5 py-0 h-4 font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
              {PAYMENT_METHOD_TYPE_LABEL[pm.type]}
            </Badge>
            <span className="text-border">{"/"}</span>
            <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400">{pm.currency}</span>
            {pm.accountNumber && (
              <>
                <span className="text-border">{"/"}</span>
                <span className="text-xs text-muted-foreground truncate">{pm.accountNumber}</span>
              </>
            )}
            <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
              {formatDate(pm.updatedAt, { withYear: false })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
