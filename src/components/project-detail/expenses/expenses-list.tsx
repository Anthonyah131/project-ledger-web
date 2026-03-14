"use client"

import { memo, useCallback, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { getAccentColor } from "@/lib/constants"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import { Badge } from "@/components/ui/badge"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import type { ExpenseResponse } from "@/types/expense"
import type { PaymentMethodResponse } from "@/types/payment-method"

interface ExpensesListProps {
  expenses: ExpenseResponse[]
  projectCurrency: string
  paymentMethods: PaymentMethodResponse[]
  onEdit: (expense: ExpenseResponse) => void
  onDelete: (expense: ExpenseResponse) => void
  onToggleActive: (expense: ExpenseResponse, isActive: boolean) => void | Promise<void>
}

function ExpensesListComponent({ expenses, projectCurrency, paymentMethods, onEdit, onDelete, onToggleActive }: ExpensesListProps) {
  const activatingIdsRef = useRef<Set<string>>(new Set())
  const [activatingIds, setActivatingIds] = useState<Set<string>>(() => new Set())

  const paymentMethodNameById = useMemo(
    () => new Map(paymentMethods.map((pm) => [pm.id, pm.name])),
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
      <div className="flex items-center px-5 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-widest border-b border-border bg-muted/30">
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
        const pmName = paymentMethodNameById.get(expense.paymentMethodId) ?? "—"

        return (
          <div
            key={expense.id}
            role="listitem"
            className={cn(
              "group flex items-center px-5 py-3.5",
              "border-b border-border last:border-b-0",
              "hover:bg-accent/30 transition-colors duration-150",
            )}
          >
            {/* Accent dot */}
            <div className={cn("size-2 rounded-full shrink-0 mr-3.5", getAccentColor(i))} />

            {/* Title */}
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-foreground truncate leading-snug">
                {expense.title}
              </p>
              {!expense.isActive && (
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className="border-amber-500/40 bg-amber-500/15 text-[10px] font-semibold uppercase tracking-wide text-amber-950 dark:text-amber-200"
                  >
                    Recordatorio
                  </Badge>
                </div>
              )}
              {expense.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {expense.description}
                </p>
              )}
            </div>

            {/* Date */}
            <span className="w-28 text-right text-xs text-muted-foreground tabular-nums hidden sm:block">
              {formatDate(expense.expenseDate, { fixTimezone: true })}
            </span>

            {/* Amount — primary: convertedAmount in project currency */}
            <div className="w-44 text-right hidden md:block">
              <p className="text-sm font-semibold text-foreground tabular-nums">
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
            <span className="w-40 text-right text-xs text-muted-foreground hidden lg:block truncate">
              {pmName}
            </span>

            {/* Category */}
            <span className="w-36 text-right text-xs text-muted-foreground hidden xl:block truncate">
              {expense.categoryName}
            </span>

            {/* Menu */}
            <ItemActionMenu
              ariaLabel="Acciones del gasto"
              onActivate={!expense.isActive ? () => { void handleActivate(expense) } : undefined}
              activateLabel="Activar movimiento"
              activatingLabel="Activando..."
              isActivating={isActivating}
              disabled={isActivating}
              onEdit={() => onEdit(expense)}
              onDelete={() => onDelete(expense)}
            />
          </div>
        )
      })}
    </div>
  )
}

export const ExpensesList = memo(ExpensesListComponent)
