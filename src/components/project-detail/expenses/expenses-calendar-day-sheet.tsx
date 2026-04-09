"use client"

import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatDate } from "@/lib/date-utils"
import { formatCurrency } from "@/lib/format-utils"
import type { ExpenseResponse } from "@/types/expense"

interface ExpensesCalendarDaySheetProps {
  date: string | null
  expenses: ExpenseResponse[]
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (date: string) => void
  onEdit: (expense: ExpenseResponse) => void
  onDelete: (expense: ExpenseResponse) => void
  projectCurrency: string
  locale?: string
}

export function ExpensesCalendarDaySheet({
  date,
  expenses,
  open,
  onOpenChange,
  onCreate,
  onEdit,
  onDelete,
  projectCurrency,
  locale = "es",
}: ExpensesCalendarDaySheetProps) {
  if (!date) return null

  const dayTotal = expenses.reduce((sum, exp) => sum + exp.convertedAmount, 0)
  const formattedDate = formatDate(date, {
    withYear: true,
    dayStyle: "numeric",
    locale,
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto flex flex-col gap-0 p-0">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
          <SheetTitle className="text-base capitalize">{formattedDate}</SheetTitle>
          <SheetDescription className="flex items-center gap-2 text-sm">
            {dayTotal > 0 ? (
              <>
                <span className="font-semibold text-foreground">
                  {formatCurrency(dayTotal, projectCurrency)}
                </span>
                <span className="text-muted-foreground/50">·</span>
                <span>{expenses.length} {expenses.length === 1 ? "gasto" : "gastos"}</span>
              </>
            ) : (
              <span>Sin gastos</span>
            )}
          </SheetDescription>
        </SheetHeader>

        {/* Add button */}
        <div className="px-5 py-3 border-b border-border">
          <Button
            onClick={() => {
              onCreate(date)
              onOpenChange(false)
            }}
            size="sm"
            className="w-full gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Registrar gasto en este día
          </Button>
        </div>

        {/* Expense list */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {expenses.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">Sin gastos este día</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="group flex items-start justify-between rounded-lg border border-border bg-card px-3 py-2.5 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{exp.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{exp.categoryName}</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      {formatCurrency(exp.convertedAmount, projectCurrency)}
                    </p>
                  </div>

                  <div className="ml-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        onEdit(exp)
                        onOpenChange(false)
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onDelete(exp)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
