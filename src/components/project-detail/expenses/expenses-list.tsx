"use client"

import { cn } from "@/lib/utils"
import { getAccentColor } from "@/lib/constants"
import { formatDate, formatAmount } from "@/lib/format-utils"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import type { ExpenseResponse } from "@/types/expense"
import type { PaymentMethodResponse } from "@/types/payment-method"

interface ExpensesListProps {
  expenses: ExpenseResponse[]
  projectCurrency: string
  paymentMethods: PaymentMethodResponse[]
  onEdit: (expense: ExpenseResponse) => void
  onDelete: (expense: ExpenseResponse) => void
}

export function ExpensesList({ expenses, projectCurrency, paymentMethods, onEdit, onDelete }: ExpensesListProps) {
  return (
    <div role="list" aria-label="Lista de gastos">
      {/* Header */}
      <div className="flex items-center px-5 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-widest border-b border-border bg-muted/30">
        <span className="flex-1">Titulo</span>
        <span className="w-28 text-right hidden sm:block">Fecha</span>
        <span className="w-44 text-right hidden md:block">Monto</span>
        <span className="w-36 text-right hidden xl:block">Alternativo</span>
        <span className="w-40 text-right hidden lg:block">Metodo de pago</span>
        <span className="w-36 text-right hidden xl:block">Categoria</span>
        <span className="w-8" />
      </div>

      {expenses.map((expense, i) => {
        const showOriginal = expense.originalCurrency !== projectCurrency
        const hasAlt = !!expense.altCurrency && expense.altAmount != null
        const pmName = paymentMethods.find((pm) => pm.id === expense.paymentMethodId)?.name ?? "—"

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

            {/* Alt amount */}
            <div className="w-36 text-right hidden xl:block">
              {hasAlt ? (
                <p className="text-xs text-muted-foreground tabular-nums">
                  {expense.altCurrency}{" "}
                  {formatAmount(expense.altAmount!)}
                </p>
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
              onEdit={() => onEdit(expense)}
              onDelete={() => onDelete(expense)}
            />
          </div>
        )
      })}
    </div>
  )
}
