"use client"

import { useMemo } from "react"
import { ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react"

import { formatCompactCurrency, formatCurrency } from "@/lib/format-utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/context/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardTopTransaction } from "@/types/dashboard"
import { cn } from "@/lib/utils"

interface DashboardMonthlyTopTransactionsProps {
  transactions: DashboardTopTransaction[]
  currencyCode: string
  scopeLabel: string
}

function TransactionRow({
  transaction,
  currencyCode,
  isMobile,
}: {
  transaction: DashboardTopTransaction
  currencyCode: string
  isMobile: boolean
}) {
  const isExpense = transaction.type === "expense"
  const sign = isExpense ? "-" : "+"

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/35 px-3 py-2.5 text-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/55 hover:shadow-sm">
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full",
            isExpense
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          )}
        >
          {isExpense ? (
            <ArrowDownLeft className="size-3.5" />
          ) : (
            <ArrowUpRight className="size-3.5" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{transaction.description}</p>
          <p className="text-[11px] text-muted-foreground">
            {transaction.category_name}
            {isMobile ? "" : ` · ${transaction.payment_method_name}`}
          </p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            "font-semibold tabular-nums",
            isExpense ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
          )}
        >
          {sign}
          {isMobile
            ? formatCompactCurrency(transaction.amount, currencyCode)
            : formatCurrency(transaction.amount, currencyCode)}
        </p>
        <p className="text-[11px] text-muted-foreground">{transaction.date}</p>
      </div>
    </div>
  )
}

export function DashboardMonthlyTopTransactions({
  transactions,
  currencyCode,
  scopeLabel,
}: DashboardMonthlyTopTransactionsProps) {
  const isMobile = useIsMobile()
  const { t } = useLanguage()

  const totalAmount = useMemo(
    () => transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
    [transactions]
  )

  return (
    <Card className="border-border/70 bg-card/80 shadow-[0_4px_20px_0_rgba(140,92,255,0.1)] transition-all hover:shadow-[0_8px_32px_0_rgba(140,92,255,0.18)]">
      <CardHeader className="pb-2 xl:pb-3">
        <CardTitle className="text-base font-semibold tracking-tight">
          {t("dashboard.monthly.topTransactions.title")}
        </CardTitle>
        <CardDescription>
          {t("dashboard.monthly.topTransactions.description", { scope: scopeLabel.toLowerCase() })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted">
              <Receipt className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.monthly.topTransactions.empty")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              {t("dashboard.monthly.topTransactions.emptyHint")}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              {transactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  currencyCode={currencyCode}
                  isMobile={isMobile}
                />
              ))}
            </div>

            {!isMobile && (
              <div className="mt-3 flex items-center justify-between rounded-md border border-border/60 bg-muted/25 px-3 py-2 text-[11px] text-muted-foreground">
                <span>
                  {t("dashboard.monthly.topTransactions.footerTotal", { count: transactions.length })}
                </span>
                <span className="font-medium tabular-nums text-foreground">
                  {formatCurrency(totalAmount, currencyCode)}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
