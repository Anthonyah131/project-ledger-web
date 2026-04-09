"use client"

import { ChevronLeft, ChevronRight, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  formatMonthLong,
  getMonthGrid,
  getWeekdayNamesShort,
  addMonths,
  getTodayIsoDate,
} from "@/lib/date-utils"
import { formatCurrency } from "@/lib/format-utils"
import type { ExpenseResponse } from "@/types/expense"

interface ExpensesCalendarProps {
  expenses: ExpenseResponse[]
  month: string // "YYYY-MM"
  onMonthChange: (month: string) => void
  onDayClick: (date: string) => void
  projectCurrency: string
  locale?: string
}

export function ExpensesCalendar({
  expenses,
  month,
  onMonthChange,
  onDayClick,
  projectCurrency,
  locale = "es",
}: ExpensesCalendarProps) {
  const monthLabel = formatMonthLong(month, locale)
  const weekdayNames = getWeekdayNamesShort(locale)
  const grid = getMonthGrid(month)
  const today = getTodayIsoDate()

  // Group expenses by date
  const expensesByDate = new Map<string, ExpenseResponse[]>()
  expenses.forEach((exp) => {
    const date = exp.expenseDate
    if (!expensesByDate.has(date)) expensesByDate.set(date, [])
    expensesByDate.get(date)!.push(exp)
  })

  const [yearPart, monthPart] = month.split("-")
  const isOutsideMonth = (date: string) => !date.startsWith(`${yearPart}-${monthPart}`)

  // Month totals for header
  const monthExpenses = expenses.filter((e) => e.expenseDate.startsWith(month))
  const monthTotal = monthExpenses.reduce((s, e) => s + e.convertedAmount, 0)

  // Max day total for relative bar sizing
  const dayTotals = grid.map((date) => {
    const dayExps = expensesByDate.get(date) ?? []
    return dayExps.reduce((s, e) => s + e.convertedAmount, 0)
  })
  const maxDayTotal = Math.max(...dayTotals, 1)

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onMonthChange(addMonths(month, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-sm font-semibold capitalize">{monthLabel}</h2>
            {monthTotal > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 text-rose-500" />
                <span>{formatCurrency(monthTotal, projectCurrency)}</span>
                <span className="text-muted-foreground/60">·</span>
                <span>{monthExpenses.length} gastos</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onMonthChange(addMonths(month, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => {
            const t = today.slice(0, 7)
            onMonthChange(t)
          }}
        >
          Hoy
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekdayNames.map((name, i) => (
          <div
            key={name}
            className={`py-2 text-center text-[11px] font-medium uppercase tracking-wide ${
              i === 0 || i === 6
                ? "text-muted-foreground/50"
                : "text-muted-foreground"
            }`}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-border">
        {grid.map((date, idx) => {
          const dayExpenses = expensesByDate.get(date) ?? []
          const dayTotal = dayExpenses.reduce((s, e) => s + e.convertedAmount, 0)
          const isToday = date === today
          const outside = isOutsideMonth(date)
          const barPercent = dayTotal > 0 ? (dayTotal / maxDayTotal) * 100 : 0
          const dayOfWeek = idx % 7
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

          const categoryIds = [...new Set(dayExpenses.map((e) => e.categoryId))].slice(0, 4)

          return (
            <button
              key={date}
              onClick={() => onDayClick(date)}
              className={`relative min-h-[88px] p-2 text-left transition-colors group
                ${outside ? "opacity-30" : ""}
                ${isWeekend && !outside ? "bg-muted/30" : "bg-card"}
                hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
              `}
            >
              {/* Spend intensity bar at top */}
              {barPercent > 0 && !outside && (
                <div
                  className="absolute top-0 left-0 h-[3px] bg-rose-400/70 transition-all"
                  style={{ width: `${barPercent}%` }}
                />
              )}

              {/* Day number */}
              <div className={`mb-1 flex items-center justify-between`}>
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold
                    ${isToday
                      ? "bg-rose-500 text-white"
                      : "text-foreground/70 group-hover:text-foreground"
                    }`}
                >
                  {Number(date.split("-")[2])}
                </span>
              </div>

              {/* Amount */}
              {dayTotal > 0 && (
                <div className="text-[11px] font-bold text-foreground leading-tight">
                  {formatCurrency(dayTotal, projectCurrency)}
                </div>
              )}

              {/* Category dots */}
              {categoryIds.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {categoryIds.map((catId) => (
                    <div
                      key={catId}
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: getCategoryColor(catId) }}
                    />
                  ))}
                  {dayExpenses.length > 4 && (
                    <span className="text-[10px] text-muted-foreground leading-none">
                      +{dayExpenses.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Count label */}
              {dayExpenses.length > 0 && (
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {dayExpenses.length === 1 ? "1 gasto" : `${dayExpenses.length} gastos`}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Deterministic color for category based on ID hash. */
function getCategoryColor(categoryId: string): string {
  const colors = [
    "hsl(0, 84%, 60%)",
    "hsl(280, 85%, 65%)",
    "hsl(220, 90%, 65%)",
    "hsl(40, 96%, 60%)",
    "hsl(160, 64%, 70%)",
    "hsl(30, 100%, 60%)",
    "hsl(340, 82%, 52%)",
    "hsl(140, 71%, 50%)",
  ]

  let hash = 0
  for (let i = 0; i < categoryId.length; i++) {
    hash = ((hash << 5) - hash) + categoryId.charCodeAt(i)
    hash |= 0
  }

  return colors[Math.abs(hash) % colors.length]
}
