"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { PAYMENT_METHOD_ACCENT } from "@/lib/constants"
import { formatDate } from "@/lib/date-utils"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import { User } from "lucide-react"
import type { PaymentMethodResponse } from "@/types/payment-method"
import { useLanguage } from "@/context/language-context"

interface PaymentMethodsListProps {
  paymentMethods: PaymentMethodResponse[]
  onEdit: (pm: PaymentMethodResponse) => void
  onDelete: (pm: PaymentMethodResponse) => void
}

function PaymentMethodsListComponent({ paymentMethods, onEdit, onDelete }: PaymentMethodsListProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const typeLabels: Record<string, string> = {
    bank: t("paymentMethods.typeBank"),
    card: t("paymentMethods.typeCard"),
    cash: t("paymentMethods.typeCash"),
  }

  return (
    <div role="list" aria-label={t("paymentMethods.title")}>
      {/* Header */}
      <div className="flex items-center px-5 py-2.5 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent">
        <span className="flex-1">{t("paymentMethods.columnMethod")}</span>
        <span className="w-20 text-center hidden sm:block">{t("common.type")}</span>
        <span className="w-16 text-center hidden sm:block">{t("common.currency")}</span>
        <span className="w-40 hidden md:block">{t("paymentMethods.columnBankIssuer")}</span>
        <span className="w-32 hidden lg:block">{t("paymentMethods.columnPartner")}</span>
        <span className="w-28 text-right hidden lg:block">{t("paymentMethods.columnUpdated")}</span>
        <span className="w-8" />
      </div>

      {paymentMethods.map((pm) => (
        <div
          key={pm.id}
          role="listitem"
          className={cn(
            "group flex items-center px-5 py-3.5",
            "border-b border-border/50 last:border-b-0",
            "hover:bg-cyan-500/5 transition-colors duration-150",
            "cursor-pointer",
          )}
          onClick={() => router.push(`/payment-methods/${pm.id}`)}
        >
          {/* Accent dot */}
          <div className={cn("size-2.5 rounded-full shrink-0 mr-3.5 ring-2 ring-offset-1 ring-offset-card", PAYMENT_METHOD_ACCENT[pm.type])} />

          {/* Name + subtitle */}
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-sm font-semibold text-foreground truncate leading-snug">
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
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
              {typeLabels[pm.type]}
            </Badge>
          </div>

          {/* Currency */}
          <span className="w-16 text-center text-xs font-bold text-cyan-700 dark:text-cyan-400 hidden sm:block">
            {pm.currency}
          </span>

          {/* Bank / issuer */}
          <span className="w-40 text-xs text-muted-foreground truncate hidden md:block">
            {pm.bankName ?? "—"}
          </span>

          {/* Partner */}
          <div className="w-32 hidden lg:block">
            {pm.partner ? (
              <Badge
                variant="outline"
                className="text-[10px] font-medium text-violet-600 dark:text-violet-400 border-violet-500/40 bg-violet-500/5 gap-1 max-w-full"
              >
                <User className="size-2.5 shrink-0" />
                <span className="truncate">{pm.partner.name}</span>
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground/30">—</span>
            )}
          </div>

          {/* Updated date */}
          <span className="w-28 text-right text-xs text-muted-foreground tabular-nums hidden lg:block">
            {formatDate(pm.updatedAt)}
          </span>

          {/* Menu */}
          <ItemActionMenu
            ariaLabel={t("paymentMethods.actionsAriaLabel")}
            onOpen={() => router.push(`/payment-methods/${pm.id}`)}
            openLabel={t("paymentMethods.viewDetail")}
            onEdit={() => onEdit(pm)}
            onDelete={() => onDelete(pm)}
            stopPropagation
          />
        </div>
      ))}
    </div>
  )
}

export const PaymentMethodsList = memo(PaymentMethodsListComponent)
