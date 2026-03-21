"use client"

import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import type {
  PaymentMethodReportMethod,
} from "@/types/report"

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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3 text-xs">
        <StatItem label="Gastos" value={String(method.expenseCount)} />
        <StatItem label="Ingresos" value={String(method.incomeCount ?? 0)} />
        <StatItem
          label="Prom. gasto"
          value={`${method.currency} ${formatAmount(method.averageExpenseAmount)}`}
        />
        <StatItem
          label="Prom. ingreso"
          value={`${method.currency} ${formatAmount(method.averageIncomeAmount ?? null, "—")}`}
        />
        <StatItem label="Banco" value={method.bankName ?? "—"} />
      </div>

      {(method.firstUseDate || method.lastUseDate) && (
        <div className="flex gap-4 text-xs text-muted-foreground mb-3 flex-wrap">
          {method.firstUseDate && (
            <span>
              Primer uso: {formatDate(method.firstUseDate)}
            </span>
          )}
          {method.lastUseDate && (
            <span>
              Último uso: {formatDate(method.lastUseDate)}
              {method.daysSinceLastUse != null && method.daysSinceLastUse > 0 && (
                <> ({method.daysSinceLastUse} días)</>
              )}
            </span>
          )}
        </div>
      )}

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
                {project.projectName} — {method.currency}{" "}
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
                  Mostrando {method.expensesShown} de {method.totalExpensesInPeriod} — exporta a Excel/PDF para ver todos
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
                {method.expenses.map((expense) => (
                  <tr
                    key={expense.expenseId}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-1.5 pr-3 tabular-nums text-muted-foreground">
                      {formatDate(expense.expenseDate)}
                    </td>
                    <td className="py-1.5 pr-3 font-medium text-foreground">{expense.title}</td>
                    <td className="py-1.5 pr-3">{expense.projectName}</td>
                    <td className="py-1.5 pr-3">{expense.categoryName}</td>
                    <td className="py-1.5 text-right tabular-nums font-medium">
                      {method.currency} {formatAmount(expense.amount)}
                    </td>
                  </tr>
                ))}
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
                  Mostrando {method.incomesShown} de {method.totalIncomesInPeriod} — exporta a Excel/PDF para ver todos
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
                {method.incomes.map((income) => (
                  <tr
                    key={income.incomeId}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-1.5 pr-3 tabular-nums text-muted-foreground">
                      {formatDate(income.incomeDate)}
                    </td>
                    <td className="py-1.5 pr-3 font-medium text-foreground">{income.title}</td>
                    <td className="py-1.5 pr-3">{income.projectName}</td>
                    <td className="py-1.5 pr-3">{income.categoryName}</td>
                    <td className="py-1.5 text-right tabular-nums font-medium">
                      {method.currency} {formatAmount(income.amount)}
                    </td>
                  </tr>
                ))}
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
