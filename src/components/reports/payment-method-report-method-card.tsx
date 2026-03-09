"use client"

import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import type {
  PaymentMethodReportExpense,
  PaymentMethodReportIncome,
  PaymentMethodReportMethod,
} from "@/types/report"

/** Resolves amount from a payment method expense — handles both new `convertedAmount`
 * and the legacy `amount` field until the backend migration is complete. */
function resolveExpenseAmount(expense: PaymentMethodReportExpense): number | undefined {
  return expense.convertedAmount ?? (expense as unknown as { amount?: number }).amount
}

function resolveIncomeAmount(income: PaymentMethodReportIncome): number | undefined {
  return income.originalAmount ?? income.convertedAmount
}

interface PaymentMethodReportMethodCardProps {
  method: PaymentMethodReportMethod
}

export function PaymentMethodReportMethodCard({ method }: PaymentMethodReportMethodCardProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold">{method.name}</h4>
          <Badge variant="outline" className="text-[10px]">
            {method.type}
          </Badge>
          <Badge variant="secondary" className="text-[10px] font-mono">
            {method.currency}
          </Badge>
          {method.isInactive && (
            <Badge variant="outline" className="text-[10px] border-yellow-500/40 text-yellow-400">
              Inactivo
            </Badge>
          )}
        </div>
        <div className="flex flex-col items-end text-xs tabular-nums">
          <span>Gastos: {method.currency} {formatAmount(method.totalSpent)}</span>
          <span>Ingresos: {method.currency} {formatAmount(method.totalIncome ?? 0)}</span>
          <span className="font-semibold">
            Neto: {method.currency} {formatAmount(method.netFlow ?? (method.totalIncome ?? 0) - method.totalSpent)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3 text-xs">
        <StatItem label="Gastos" value={String(method.expenseCount)} />
        <StatItem label="Ingresos" value={String(method.incomeCount ?? 0)} />
        <StatItem label="% del total" value={`${method.percentage.toFixed(1)}%`} />
        <StatItem
          label="Prom. gasto"
          value={`${method.currency} ${formatAmount(method.averageExpenseAmount)}`}
        />
        <StatItem
          label="Prom. ingreso"
          value={`${method.currency} ${formatAmount(method.averageIncomeAmount ?? null, "—")}`}
        />
        <StatItem
          label="Flujo neto"
          value={`${method.currency} ${formatAmount(method.netFlow ?? (method.totalIncome ?? 0) - method.totalSpent)}`}
        />
        <StatItem label="Banco" value={method.bankName ?? "—"} />
      </div>

      {(method.firstUseDate || method.lastUseDate) && (
        <div className="flex gap-4 text-xs text-muted-foreground mb-3 flex-wrap">
          {method.firstUseDate && (
            <span>
              Primer uso: {formatDate(method.firstUseDate, { fixTimezone: true })}
            </span>
          )}
          {method.lastUseDate && (
            <span>
              Último uso: {formatDate(method.lastUseDate, { fixTimezone: true })}
              {method.daysSinceLastUse != null && method.daysSinceLastUse > 0 && (
                <> ({method.daysSinceLastUse} días)</>
              )}
            </span>
          )}
        </div>
      )}

      <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(method.percentage, 100)}%` }}
        />
      </div>

      {method.topExpense && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Gasto mayor</span>
            <span className="font-medium text-foreground">{method.topExpense.title}</span>
            <span className="text-muted-foreground">
              {method.topExpense.projectName} · {method.topExpense.categoryName}
            </span>
          </div>
          <span className="tabular-nums font-semibold text-sm">
            {method.currency} {formatAmount(method.topExpense.amount)}
          </span>
        </div>
      )}

      {method.topCategories && method.topCategories.length > 0 && (
        <div className="mb-3 pt-2 border-t border-border/50">
          <span className="text-xs font-medium text-muted-foreground mb-2 block">
            Principales categorías
          </span>
          <div className="flex flex-col gap-1.5">
            {method.topCategories.map((category) => (
              <div key={category.categoryName} className="flex items-center gap-3">
                <span className="text-xs text-foreground w-32 truncate">{category.categoryName}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${Math.min(category.percentage, 100)}%` }}
                  />
                </div>
                <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
                  {category.percentage.toFixed(1)}%
                </span>
                <span className="text-xs tabular-nums font-medium w-24 text-right">
                  {method.currency} {formatAmount(category.totalAmount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {method.projects.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <span className="text-xs font-medium text-muted-foreground mb-2 block">
            Proyectos
          </span>
          <div className="flex flex-wrap gap-2">
            {method.projects.map((project) => (
              <Badge key={project.projectId} variant="secondary" className="text-[10px]">
                {project.projectName} — {project.currencyCode ?? method.currency}{" "}
                {formatAmount(project.totalSpent)} ({project.expenseCount})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {method.expenses.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Gastos</span>
            {method.totalExpensesInPeriod != null &&
              method.expensesShown != null &&
              method.totalExpensesInPeriod > method.expensesShown && (
                <span className="text-xs text-muted-foreground">
                  Mostrando {method.expensesShown} de {method.totalExpensesInPeriod}
                </span>
              )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-1.5 pr-3 font-medium">Fecha</th>
                  <th className="text-left py-1.5 pr-3 font-medium">Título</th>
                  <th className="text-left py-1.5 pr-3 font-medium">Proyecto</th>
                  <th className="text-left py-1.5 pr-3 font-medium">Categoría</th>
                  <th className="text-right py-1.5 font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {method.expenses.map((expense) => {
                  const primaryAmount = expense.originalAmount ?? resolveExpenseAmount(expense)
                  const primaryCurrency = expense.originalCurrency ?? method.currency
                  const projectCurrency = expense.projectCurrency ?? method.currency
                  const showConverted =
                    expense.convertedAmount != null && projectCurrency !== primaryCurrency

                  return (
                    <tr
                      key={expense.expenseId}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-1.5 pr-3 tabular-nums text-muted-foreground">
                        {formatDate(expense.expenseDate, { fixTimezone: true })}
                      </td>
                      <td className="py-1.5 pr-3 font-medium text-foreground">{expense.title}</td>
                      <td className="py-1.5 pr-3">{expense.projectName}</td>
                      <td className="py-1.5 pr-3">{expense.categoryName}</td>
                      <td className="py-1.5 text-right tabular-nums font-medium">
                        <div className="flex flex-col items-end gap-0.5">
                          <span>{primaryCurrency} {formatAmount(primaryAmount, "—")}</span>
                          {showConverted && (
                            <span className="text-[10px] text-muted-foreground font-normal">
                              = {projectCurrency} {formatAmount(expense.convertedAmount)}
                            </span>
                          )}
                          {expense.currencyExchanges && expense.currencyExchanges.length > 0 && (
                            <span className="text-[10px] text-muted-foreground font-normal text-right">
                              {expense.currencyExchanges
                                .slice(0, 2)
                                .map(
                                  (item) => `${item.currencyCode} ${formatAmount(item.convertedAmount, "—")}`
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
        </div>
      )}

      {method.incomes && method.incomes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Ingresos</span>
            {method.totalIncomesInPeriod != null &&
              method.incomesShown != null &&
              method.totalIncomesInPeriod > method.incomesShown && (
                <span className="text-xs text-muted-foreground">
                  Mostrando {method.incomesShown} de {method.totalIncomesInPeriod}
                </span>
              )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-1.5 pr-3 font-medium">Fecha</th>
                  <th className="text-left py-1.5 pr-3 font-medium">Título</th>
                  <th className="text-left py-1.5 pr-3 font-medium">Proyecto</th>
                  <th className="text-left py-1.5 pr-3 font-medium">Categoría</th>
                  <th className="text-right py-1.5 pr-3 font-medium">Monto cuenta</th>
                  <th className="text-left py-1.5 pr-3 font-medium">Mon. cuenta</th>
                  <th className="text-right py-1.5 font-medium">Monto proyecto</th>
                </tr>
              </thead>
              <tbody>
                {method.incomes.map((income) => {
                  const accountAmount = income.accountAmount ?? resolveIncomeAmount(income)
                  const accountCurrency = income.accountCurrency ?? income.originalCurrency ?? method.currency
                  const projectCurrency = income.projectCurrency ?? accountCurrency
                  const showProjectEquivalent =
                    income.convertedAmount != null && projectCurrency !== accountCurrency

                  return (
                    <tr
                      key={income.incomeId}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-1.5 pr-3 tabular-nums text-muted-foreground">
                        {formatDate(income.incomeDate, { fixTimezone: true })}
                      </td>
                      <td className="py-1.5 pr-3 font-medium text-foreground">{income.title}</td>
                      <td className="py-1.5 pr-3">{income.projectName}</td>
                      <td className="py-1.5 pr-3">{income.categoryName}</td>
                      <td className="py-1.5 pr-3 text-right tabular-nums font-medium">
                        {formatAmount(accountAmount, "—")}
                      </td>
                      <td className="py-1.5 pr-3 font-medium">{accountCurrency || "—"}</td>
                      <td className="py-1.5 text-right tabular-nums font-medium">
                        <div className="flex flex-col items-end gap-0.5">
                          <span>{projectCurrency} {formatAmount(income.convertedAmount, "—")}</span>
                          {showProjectEquivalent && (
                            <span className="text-[10px] text-muted-foreground font-normal">
                              = {accountCurrency} {formatAmount(accountAmount, "—")}
                            </span>
                          )}
                          {income.currencyExchanges && income.currencyExchanges.length > 0 && (
                            <span className="text-[10px] text-muted-foreground font-normal text-right">
                              {income.currencyExchanges
                                .slice(0, 2)
                                .map(
                                  (item) => `${item.currencyCode} ${formatAmount(item.convertedAmount, "—")}`
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
        </div>
      )}
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
