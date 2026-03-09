"use client"

import type { ComponentType } from "react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import type {
  PaymentMethodExpenseItem,
  PaymentMethodIncomeItem,
} from "@/types/payment-method"

interface InfoCardProps {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}

export function InfoCard({ icon: Icon, label, value }: InfoCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex items-start gap-3">
      <div className="text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-foreground mt-1 truncate">{value}</p>
      </div>
    </div>
  )
}

interface EmptyBlockProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

export function EmptyBlock({ icon: Icon, title, description }: EmptyBlockProps) {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
      <div className="size-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  )
}

interface ExpenseRowProps {
  expense: PaymentMethodExpenseItem
  paymentMethodCurrency: string
  onOpenProject: () => void
}

export function ExpenseRow({ expense, paymentMethodCurrency, onOpenProject }: ExpenseRowProps) {
  const showOriginal = expense.originalCurrency !== paymentMethodCurrency

  return (
    <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{expense.title}</p>
        <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
          <span>{formatDate(expense.expenseDate, { fixTimezone: true })}</span>
          <span>·</span>
          <span>{expense.categoryName}</span>
          {expense.receiptNumber && (
            <>
              <span>·</span>
              <span>Ref: {expense.receiptNumber}</span>
            </>
          )}
        </div>
      </div>

      <div className="sm:text-right">
        <p className="text-sm font-semibold text-foreground tabular-nums">
          {paymentMethodCurrency} {formatAmount(expense.convertedAmount, "0.00")}
        </p>
        {showOriginal && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {expense.originalCurrency} {formatAmount(expense.originalAmount, "0.00")}
          </p>
        )}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={onOpenProject}>
        Ver proyecto
      </Button>
    </div>
  )
}

interface IncomeRowProps {
  income: PaymentMethodIncomeItem
  onOpenProject: () => void
}

export function IncomeRow({ income, onOpenProject }: IncomeRowProps) {
  const accountAmount = income.accountAmount ?? income.originalAmount
  const accountCurrency = income.accountCurrency ?? income.originalCurrency
  const projectCurrency = income.projectCurrency
  const showProjectEquivalent =
    projectCurrency != null &&
    projectCurrency.length > 0 &&
    projectCurrency !== accountCurrency

  return (
    <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{income.title}</p>
        <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
          <span>{formatDate(income.incomeDate, { fixTimezone: true })}</span>
          <span>·</span>
          <span>{income.categoryName}</span>
          {income.projectName && (
            <>
              <span>·</span>
              <span>{income.projectName}</span>
            </>
          )}
          {income.receiptNumber && (
            <>
              <span>·</span>
              <span>Ref: {income.receiptNumber}</span>
            </>
          )}
        </div>
      </div>

      <div className="sm:text-right">
        <p className="text-sm font-semibold text-foreground tabular-nums">
          {accountCurrency} {formatAmount(accountAmount, "0.00")}
        </p>
        {showProjectEquivalent && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {projectCurrency} {formatAmount(income.convertedAmount, "0.00")}
          </p>
        )}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={onOpenProject}>
        Ver proyecto
      </Button>
    </div>
  )
}
