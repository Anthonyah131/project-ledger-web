"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import type { ExpenseReportExpenseItem, ProjectExpenseReportResponse } from "@/types/report"
import { useLanguage } from "@/context/language-context"

/** Resolves the display amount from a report expense item.
 * Handles both field names: new `convertedAmount` and legacy `amount`. */
function resolveAmount(expense: ExpenseReportExpenseItem): number | undefined {
  return expense.convertedAmount ?? (expense as unknown as { amount?: number }).amount
}

interface ExpenseReportMonthlySectionsCardProps {
  report: ProjectExpenseReportResponse
}

export function ExpenseReportMonthlySectionsCard({ report }: ExpenseReportMonthlySectionsCardProps) {
  const { t } = useLanguage()

  if (report.sections.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("reports.shared.monthlyDetailTitle")}</CardTitle>
        <CardDescription>{t("reports.expense.monthlyDetailDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {report.sections.map((section) => (
          <div
            key={`${section.year}-${section.month}`}
            className="rounded-lg border bg-muted/30 p-4"
          >
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">{section.monthLabel}</h4>
                {section.topExpense && (
                  <span
                    className="text-xs text-muted-foreground hidden sm:inline"
                    title={t("reports.expense.topExpenseTitle", { title: section.topExpense.title })}
                  >
                    · {section.topExpense.title}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap justify-end">
                <span>{t("reports.shared.expensesCount", { count: section.sectionCount })}</span>
                {section.sectionIncomeCount != null && (
                  <span>{t("reports.shared.incomesCount", { count: section.sectionIncomeCount })}</span>
                )}
                {section.percentageOfTotal != null && (
                  <span className="tabular-nums text-muted-foreground/70">
                    {section.percentageOfTotal.toFixed(1)}%
                  </span>
                )}
                <Badge variant="secondary" className="font-mono">
                  {t("reports.expense.sectionLabel")} {report.currencyCode} {formatAmount(section.sectionTotal)}
                </Badge>
                {section.sectionIncomeTotal != null && (
                  <Badge variant="outline" className="font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                    {t("reports.expense.sectionIncomeLabel")} {report.currencyCode} {formatAmount(section.sectionIncomeTotal)}
                  </Badge>
                )}
                {section.sectionNetBalance != null && (
                  <Badge
                    variant="outline"
                    className={`font-mono ${
                      section.sectionNetBalance >= 0
                        ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "border-rose-500/30 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {t("reports.expense.sectionNetLabel")} {report.currencyCode} {formatAmount(section.sectionNetBalance)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Alternative currency subtotals for this section */}
            {section.alternativeCurrencies && section.alternativeCurrencies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {section.alternativeCurrencies.map((alt) => (
                  <Badge
                    key={alt.currencyCode}
                    variant="outline"
                    className="font-mono text-[10px] border-primary/20 text-primary/70"
                  >
                    {alt.currencyCode}: {t("reports.expense.altSpent")} {formatAmount(alt.totalSpent)}
                    {alt.totalIncome > 0 && ` · ${t("reports.expense.altIncome")} ${formatAmount(alt.totalIncome)}`}
                    {` · ${t("reports.expense.altNet")} ${formatAmount(alt.netBalance)}`}
                  </Badge>
                ))}
              </div>
            )}

            {section.expenses.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2 pr-4 font-medium">{t("reports.shared.colDate")}</th>
                        <th className="text-left py-2 pr-4 font-medium">{t("reports.shared.colTitle")}</th>
                        <th className="text-left py-2 pr-4 font-medium">{t("reports.shared.colCategory")}</th>
                        <th className="text-left py-2 pr-4 font-medium">{t("reports.shared.colMethod")}</th>
                        <th className="text-right py-2 font-medium">{t("reports.shared.colAmount")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.expenses.map((expense, index) => {
                        const displayAmount = resolveAmount(expense)
                        const showOriginal =
                          expense.originalCurrency &&
                          expense.originalCurrency !== report.currencyCode &&
                          expense.originalAmount != null

                        return (
                          <tr
                            key={`${section.year}-${section.month}-${expense.expenseId ?? index}`}
                            className="border-b border-border/50 last:border-0"
                          >
                            <td className="py-2 pr-4 tabular-nums text-muted-foreground">
                              {formatDate(expense.expenseDate, { fixTimezone: true })}
                            </td>
                            <td className="py-2 pr-4 font-medium text-foreground max-w-45 truncate">
                              {expense.title}
                              {expense.isObligationPayment && (
                                <Badge
                                  variant="outline"
                                  className="ml-1.5 text-[10px] px-1 py-0 border-primary/40 text-primary"
                                >
                                  {t("reports.expense.obligationBadge")}
                                </Badge>
                              )}
                            </td>
                            <td className="py-2 pr-4">{expense.categoryName}</td>
                            <td className="py-2 pr-4">{expense.paymentMethodName}</td>
                            <td className="py-2 text-right tabular-nums font-medium">
                              <div className="flex flex-col items-end gap-0.5">
                                <span>{formatAmount(displayAmount, "—")}</span>
                                {showOriginal && (
                                  <span className="text-[10px] text-muted-foreground font-normal">
                                    {expense.originalCurrency} {formatAmount(expense.originalAmount, "—")}
                                  </span>
                                )}
                                {expense.currencyExchanges && expense.currencyExchanges.length > 0 && (
                                  <span className="text-[10px] text-muted-foreground font-normal text-right">
                                    {expense.currencyExchanges
                                      .slice(0, 2)
                                      .map(
                                        (item) =>
                                          `${item.currencyCode} ${formatAmount(item.convertedAmount, "—")}`
                                      )
                                      .join(" · ")}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {section.sectionCount > section.expenses.length && (
                  <div className="mt-3 rounded-md border border-dashed border-muted-foreground/25 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
                    {t("reports.expense.showingOf", { shown: section.expenses.length, total: section.sectionCount })}
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t("reports.expense.noMonthDetail")}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
