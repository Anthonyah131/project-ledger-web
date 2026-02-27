"use client"

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ExpenseResponse } from "@/types/expense"
import type { PaymentMethodResponse } from "@/types/payment-method"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ExpensesListProps {
  expenses: ExpenseResponse[]
  projectCurrency: string
  paymentMethods: PaymentMethodResponse[]
  onEdit: (expense: ExpenseResponse) => void
  onDelete: (expense: ExpenseResponse) => void
}

const ACCENT_COLORS = [
  "bg-primary",
  "bg-[oklch(0.60_0.16_155)]",
  "bg-[oklch(0.58_0.16_30)]",
  "bg-[oklch(0.55_0.14_280)]",
  "bg-[oklch(0.58_0.14_200)]",
  "bg-foreground/70",
  "bg-[oklch(0.62_0.14_55)]",
  "bg-[oklch(0.50_0.12_250)]",
]

function getAccent(index: number) {
  return ACCENT_COLORS[index % ACCENT_COLORS.length]
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("es", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
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
            <div className={cn("size-2 rounded-full shrink-0 mr-3.5", getAccent(i))} />

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
              {formatDate(expense.expenseDate)}
            </span>

            {/* Amount — primary: convertedAmount in project currency */}
            <div className="w-44 text-right hidden md:block">
              <p className="text-sm font-semibold text-foreground tabular-nums">
                {projectCurrency}{" "}
                {formatAmount(expense.convertedAmount, projectCurrency)}
              </p>
              {showOriginal && (
                <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                  {expense.originalCurrency}{" "}
                  {formatAmount(expense.originalAmount, expense.originalCurrency)}
                </p>
              )}
            </div>

            {/* Alt amount */}
            <div className="w-36 text-right hidden xl:block">
              {hasAlt ? (
                <p className="text-xs text-muted-foreground tabular-nums">
                  {expense.altCurrency}{" "}
                  {formatAmount(expense.altAmount!, expense.altCurrency!)}
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
                  aria-label="Acciones del gasto"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(expense)}>
                  <Pencil className="size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(expense)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      })}
    </div>
  )
}
