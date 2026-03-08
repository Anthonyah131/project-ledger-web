"use client"

import { memo, useMemo } from "react"
import { cn } from "@/lib/utils"
import { getAccentColor } from "@/lib/constants"
import { formatDate, formatAmount } from "@/lib/format-utils"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import type { IncomeResponse } from "@/types/income"
import type { PaymentMethodResponse } from "@/types/payment-method"

interface IncomesListProps {
  incomes: IncomeResponse[]
  projectCurrency: string
  paymentMethods: PaymentMethodResponse[]
  onEdit: (income: IncomeResponse) => void
  onDelete: (income: IncomeResponse) => void
}

function IncomesListComponent({
  incomes,
  projectCurrency,
  paymentMethods,
  onEdit,
  onDelete,
}: IncomesListProps) {
  const paymentMethodNameById = useMemo(
    () => new Map(paymentMethods.map((pm) => [pm.id, pm.name])),
    [paymentMethods]
  )

  return (
    <div role="list" aria-label="Lista de ingresos">
      <div className="flex items-center px-5 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-widest border-b border-border bg-muted/30">
        <span className="flex-1">Titulo</span>
        <span className="w-28 text-right hidden sm:block">Fecha</span>
        <span className="w-44 text-right hidden md:block">Monto</span>
        <span className="w-44 text-right hidden xl:block">Conversiones</span>
        <span className="w-40 text-right hidden lg:block">Metodo de pago</span>
        <span className="w-36 text-right hidden xl:block">Categoria</span>
        <span className="w-8" />
      </div>

      {incomes.map((income, i) => {
        const showOriginal = income.originalCurrency !== projectCurrency
        const exchanges = income.currencyExchanges ?? []
        const pmName = paymentMethodNameById.get(income.paymentMethodId) ?? "—"

        return (
          <div
            key={income.id}
            role="listitem"
            className={cn(
              "group flex items-center px-5 py-3.5",
              "border-b border-border last:border-b-0",
              "hover:bg-accent/30 transition-colors duration-150"
            )}
          >
            <div className={cn("size-2 rounded-full shrink-0 mr-3.5", getAccentColor(i))} />

            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-foreground truncate leading-snug">
                {income.title}
              </p>
              {income.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {income.description}
                </p>
              )}
            </div>

            <span className="w-28 text-right text-xs text-muted-foreground tabular-nums hidden sm:block">
              {formatDate(income.incomeDate, { fixTimezone: true })}
            </span>

            <div className="w-44 text-right hidden md:block">
              <p className="text-sm font-semibold text-foreground tabular-nums">
                {projectCurrency} {formatAmount(income.convertedAmount)}
              </p>
              {showOriginal && (
                <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                  {income.originalCurrency} {formatAmount(income.originalAmount)}
                </p>
              )}
            </div>

            <div className="w-44 text-right hidden xl:block">
              {exchanges.length > 0 ? (
                <div className="flex flex-col items-end gap-0.5">
                  {exchanges.slice(0, 2).map((exchange) => (
                    <p key={exchange.id} className="text-xs text-muted-foreground tabular-nums">
                      {exchange.currencyCode} {formatAmount(exchange.convertedAmount)}
                    </p>
                  ))}
                  {exchanges.length > 2 && (
                    <p className="text-[10px] text-muted-foreground/70">+{exchanges.length - 2} mas</p>
                  )}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground/30">—</span>
              )}
            </div>

            <span className="w-40 text-right text-xs text-muted-foreground hidden lg:block truncate">
              {pmName}
            </span>

            <span className="w-36 text-right text-xs text-muted-foreground hidden xl:block truncate">
              {income.categoryName}
            </span>

            <ItemActionMenu
              ariaLabel="Acciones del ingreso"
              onEdit={() => onEdit(income)}
              onDelete={() => onDelete(income)}
            />
          </div>
        )
      })}
    </div>
  )
}

export const IncomesList = memo(IncomesListComponent)
