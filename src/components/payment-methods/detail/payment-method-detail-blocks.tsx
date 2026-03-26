"use client"

import type { ComponentType } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import { useLanguage } from "@/context/language-context"
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
    <div className="rounded-xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/5 to-transparent p-4 flex items-start gap-3 shadow-sm">
      <div className="size-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-bold text-foreground mt-1 truncate">{value}</p>
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
      <div className="size-11 rounded-xl bg-gradient-to-br from-cyan-500/10 to-sky-500/5 flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-500/15">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{title}</p>
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
  const { t } = useLanguage()
  // Use accountAmount/accountCurrency (amount in the payment method's currency).
  // Fall back for historical expenses that don't have accountAmount yet.
  const accountAmount = expense.accountAmount ?? (
    expense.originalCurrency === paymentMethodCurrency
      ? expense.originalAmount
      : expense.convertedAmount
  )
  const accountCurrency = expense.accountCurrency ?? paymentMethodCurrency
  const showOriginal = expense.originalCurrency !== accountCurrency

  return (
    <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 hover:bg-rose-500/5 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground truncate">{expense.title}</p>
        <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
          <span>{formatDate(expense.expenseDate, { fixTimezone: true })}</span>
          <span>·</span>
          <span>{expense.categoryName}</span>
          {!expense.isActive && (
            <>
              <span>·</span>
              <Badge variant="outline" className="border-amber-600/50 bg-amber-500/25 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200">{t("paymentMethods.badgeReminder")}</Badge>
            </>
          )}
          {expense.receiptNumber && (
            <>
              <span>·</span>
              <span>{t("paymentMethods.refLabel", { number: expense.receiptNumber })}</span>
            </>
          )}
        </div>
      </div>

      <div className="sm:text-right">
        <p className="text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums">
          {accountCurrency} {formatAmount(accountAmount, "0.00")}
        </p>
        {showOriginal && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {expense.originalCurrency} {formatAmount(expense.originalAmount, "0.00")}
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onOpenProject}
        className="border-cyan-500/30 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50"
      >
        {t("paymentMethods.viewProject")}
      </Button>
    </div>
  )
}

interface IncomeRowProps {
  income: PaymentMethodIncomeItem
  onOpenProject: () => void
}

export function IncomeRow({ income, onOpenProject }: IncomeRowProps) {
  const { t } = useLanguage()
  const accountAmount = income.accountAmount ?? income.originalAmount
  const accountCurrency = income.accountCurrency ?? income.originalCurrency
  const projectCurrency = income.projectCurrency
  const showProjectEquivalent =
    projectCurrency != null &&
    projectCurrency.length > 0 &&
    projectCurrency !== accountCurrency

  return (
    <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 hover:bg-emerald-500/5 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground truncate">{income.title}</p>
        <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
          <span>{formatDate(income.incomeDate, { fixTimezone: true })}</span>
          <span>·</span>
          <span>{income.categoryName}</span>
          {!income.isActive && (
            <>
              <span>·</span>
              <Badge variant="outline" className="border-amber-600/50 bg-amber-500/25 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200">{t("paymentMethods.badgeReminder")}</Badge>
            </>
          )}
          {income.projectName && (
            <>
              <span>·</span>
              <span>{income.projectName}</span>
            </>
          )}
          {income.receiptNumber && (
            <>
              <span>·</span>
              <span>{t("paymentMethods.refLabel", { number: income.receiptNumber })}</span>
            </>
          )}
        </div>
      </div>

      <div className="sm:text-right">
        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
          {accountCurrency} {formatAmount(accountAmount, "0.00")}
        </p>
        {showProjectEquivalent && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {projectCurrency} {formatAmount(income.convertedAmount, "0.00")}
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onOpenProject}
        className="border-cyan-500/30 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50"
      >
        {t("paymentMethods.viewProject")}
      </Button>
    </div>
  )
}
