"use client"

import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  formatMonthLong,
  getMonthGrid,
  getWeekdayNamesShort,
  addMonths,
  getTodayIsoDate,
} from "@/lib/date-utils"
import { formatCurrency } from "@/lib/format-utils"
import type { IncomeResponse } from "@/types/income"

interface IncomesCalendarProps {
  incomes: IncomeResponse[]
  month: string // "YYYY-MM"
  onMonthChange: (month: string) => void
  onDayClick: (date: string) => void
  projectCurrency: string
  locale?: string
}

export function IncomesCalendar({
  incomes,
  month,
  onMonthChange,
  onDayClick,
  projectCurrency,
  locale = "es",
}: IncomesCalendarProps) {
  const monthLabel = formatMonthLong(month, locale)
  const weekdayNames = getWeekdayNamesShort(locale)
  const grid = getMonthGrid(month)
  const today = getTodayIsoDate()

  // Group incomes by date
  const incomesByDate = new Map<string, IncomeResponse[]>()
  incomes.forEach((inc) => {
    const date = inc.incomeDate
    if (!incomesByDate.has(date)) incomesByDate.set(date, [])
    incomesByDate.get(date)!.push(inc)
  })

  const [yearPart, monthPart] = month.split("-")
  const isOutsideMonth = (date: string) => !date.startsWith(`${yearPart}-${monthPart}`)

  // Month totals for header
  const monthIncomes = incomes.filter((i) => i.incomeDate.startsWith(month))
  const monthTotal = monthIncomes.reduce((s, i) => s + i.convertedAmount, 0)

  // Max day total for relative bar sizing
  const dayTotals = grid.map((date) => {
    const dayIncs = incomesByDate.get(date) ?? []
    return dayIncs.reduce((s, i) => s + i.convertedAmount, 0)
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
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span>{formatCurrency(monthTotal, projectCurrency)}</span>
                <span className="text-muted-foreground/60">·</span>
                <span>{monthIncomes.length} ingresos</span>
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
            onMonthChange(today.slice(0, 7))
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
          const dayIncomes = incomesByDate.get(date) ?? []
          const dayTotal = dayIncomes.reduce((s, i) => s + i.convertedAmount, 0)
          const isToday = date === today
          const outside = isOutsideMonth(date)
          const barPercent = dayTotal > 0 ? (dayTotal / maxDayTotal) * 100 : 0
          const dayOfWeek = idx % 7
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

          const categoryIds = [...new Set(dayIncomes.map((i) => i.categoryId))].slice(0, 4)

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
              {/* Income intensity bar at top */}
              {barPercent > 0 && !outside && (
                <div
                  className="absolute top-0 left-0 h-[3px] bg-emerald-400/70 transition-all"
                  style={{ width: `${barPercent}%` }}
                />
              )}

              {/* Day number */}
              <div className="mb-1">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold
                    ${isToday
                      ? "bg-emerald-500 text-white"
                      : "text-foreground/70 group-hover:text-foreground"
                    }`}
                >
                  {Number(date.split("-")[2])}
                </span>
              </div>

              {/* Amount */}
              {dayTotal > 0 && (
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
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
                  {dayIncomes.length > 4 && (
                    <span className="text-[10px] text-muted-foreground leading-none">
                      +{dayIncomes.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Count label */}
              {dayIncomes.length > 0 && (
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {dayIncomes.length === 1 ? "1 ingreso" : `${dayIncomes.length} ingresos`}
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
    "hsl(160, 64%, 55%)",
    "hsl(140, 71%, 45%)",
    "hsl(180, 60%, 50%)",
    "hsl(120, 50%, 55%)",
    "hsl(200, 70%, 55%)",
    "hsl(100, 55%, 50%)",
    "hsl(170, 80%, 45%)",
    "hsl(150, 60%, 60%)",
  ]

  let hash = 0
  for (let i = 0; i < categoryId.length; i++) {
    hash = ((hash << 5) - hash) + categoryId.charCodeAt(i)
    hash |= 0
  }

  return colors[Math.abs(hash) % colors.length]
}
