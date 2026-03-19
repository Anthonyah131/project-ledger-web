"use client"

import { memo, useCallback, useMemo, useRef, useState } from "react"
import { GitBranch } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAccentColor } from "@/lib/constants"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import { Badge } from "@/components/ui/badge"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import type { ExpenseResponse } from "@/types/expense"
import type { PaymentMethodResponse } from "@/types/payment-method"
import { buildPaymentMethodLookup } from "@/lib/payment-method-utils"
import { hasMultiPartnerSplits } from "@/lib/split-utils"

interface ExpensesListProps {
  expenses: ExpenseResponse[]
  projectCurrency: string
  paymentMethods: PaymentMethodResponse[]
  onEdit: (expense: ExpenseResponse) => void
  onDelete: (expense: ExpenseResponse) => void
  onToggleActive: (expense: ExpenseResponse, isActive: boolean) => void | Promise<void>
  onView?: (expense: ExpenseResponse) => void
}

function ExpensesListComponent({ expenses, projectCurrency, paymentMethods, onEdit, onDelete, onToggleActive, onView }: ExpensesListProps) {
  const activatingIdsRef = useRef<Set<string>>(new Set())
  const [activatingIds, setActivatingIds] = useState<Set<string>>(() => new Set())

  const paymentMethodInfoById = useMemo(
    () => buildPaymentMethodLookup(paymentMethods),
    [paymentMethods]
  )

  const handleActivate = useCallback(
    async (expense: ExpenseResponse) => {
      if (expense.isActive || activatingIdsRef.current.has(expense.id)) {
        return
      }

      activatingIdsRef.current.add(expense.id)
      setActivatingIds((prev) => new Set(prev).add(expense.id))

      try {
        await Promise.resolve(onToggleActive(expense, true))
      } finally {
        activatingIdsRef.current.delete(expense.id)
        setActivatingIds((prev) => {
          const next = new Set(prev)
          next.delete(expense.id)
          return next
        })
      }
    },
    [onToggleActive]
  )

  return (
    <div role="list" aria-label="Lista de gastos">
      {/* Header */}
      <div className="flex items-center px-5 py-2.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest border-b border-rose-500/20 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent">
        <span className="flex-1">Titulo</span>
        <span className="w-28 text-right hidden sm:block">Fecha</span>
        <span className="w-44 text-right hidden md:block">Monto</span>
        <span className="w-44 text-right hidden xl:block">Conversiones</span>
        <span className="w-40 text-right hidden lg:block">Metodo de pago</span>
        <span className="w-36 text-right hidden xl:block">Categoria</span>
        <span className="w-8" />
      </div>

      {expenses.map((expense, i) => {
        const isActivating = activatingIds.has(expense.id)
        const showOriginal = expense.originalCurrency !== projectCurrency
        const exchanges = expense.currencyExchanges ?? []
        const pmInfo = paymentMethodInfoById.get(expense.paymentMethodId)
        const showSplitBadge = hasMultiPartnerSplits(expense.splits)

        return (
          <div
            key={expense.id}
            role="listitem"
            className={cn(
              "group flex items-center px-5 py-3.5",
              "border-b border-border/50 last:border-b-0",
              "hover:bg-rose-500/5 transition-colors duration-150",
              onView && "cursor-pointer",
            )}
            onClick={onView ? () => onView(expense) : undefined}
          >
            {/* Accent dot */}
            <div className={cn("size-2.5 rounded-full shrink-0 mr-3.5 ring-2 ring-offset-1 ring-offset-card", getAccentColor(i))} />

            {/* Title */}
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-foreground truncate leading-snug">
                {expense.title}
              </p>
              {(!expense.isActive || showSplitBadge) ? (
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {!expense.isActive ? (
                    <Badge
                      variant="outline"
                      className="border-amber-600/50 bg-amber-500/25 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200"
                    >
                      Recordatorio
                    </Badge>
                  ) : null}
                  {showSplitBadge ? (
                    <Badge
                      variant="outline"
                      className="border-violet-500/40 bg-violet-500/10 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300 gap-1"
                    >
                      <GitBranch className="size-2.5" />
                      Split
                    </Badge>
                  ) : null}
                </div>
              ) : null}
              {expense.description ? (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {expense.description}
                </p>
              ) : null}
            </div>

            {/* Date */}
            <span className="w-28 text-right text-xs text-muted-foreground tabular-nums hidden sm:block">
              {formatDate(expense.expenseDate, { fixTimezone: true })}
            </span>

            {/* Amount — primary: convertedAmount in project currency */}
            <div className="w-44 text-right hidden md:block">
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {projectCurrency}{" "}
                {formatAmount(expense.convertedAmount)}
              </p>
              {showOriginal && (
                <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                  {expense.originalCurrency}{" "}
                  {formatAmount(expense.originalAmount)}
                </p>
              )}
            </div>

            {/* Currency exchanges */}
            <div className="w-44 text-right hidden xl:block">
              {exchanges.length > 0 ? (
                <div className="flex flex-col items-end gap-0.5">
                  {exchanges.slice(0, 2).map((exchange) => (
                    <p
                      key={exchange.id}
                      className="text-xs text-muted-foreground tabular-nums"
                    >
                      {exchange.currencyCode} {formatAmount(exchange.convertedAmount)}
                    </p>
                  ))}
                  {exchanges.length > 2 && (
                    <p className="text-[10px] text-muted-foreground/70">
                      +{exchanges.length - 2} mas
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground/30">—</span>
              )}
            </div>

            {/* Payment method */}
            <div className="w-40 text-right hidden lg:block">
              <p className="text-xs text-muted-foreground truncate">{pmInfo?.name ?? "—"}</p>
              {pmInfo && (
                <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
                  {pmInfo.currency}{pmInfo.partnerName ? ` · ${pmInfo.partnerName}` : ""}
                </p>
              )}
            </div>

            {/* Category */}
            <span className="w-36 text-right text-xs text-muted-foreground hidden xl:block truncate">
              {expense.categoryName}
            </span>

            {/* Menu */}
            <ItemActionMenu
              ariaLabel="Acciones del gasto"
              onOpen={onView ? () => onView(expense) : undefined}
              openLabel="Ver detalle"
              onActivate={!expense.isActive ? () => { void handleActivate(expense) } : undefined}
              activateLabel="Activar movimiento"
              activatingLabel="Activando..."
              isActivating={isActivating}
              disabled={isActivating}
              onEdit={() => onEdit(expense)}
              onDelete={() => onDelete(expense)}
              stopPropagation
            />
          </div>
        )
      })}
    </div>
  )
}

export const ExpensesList = memo(ExpensesListComponent)
