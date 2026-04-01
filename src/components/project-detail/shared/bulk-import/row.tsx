"use client"

import { memo, useEffect, useState } from "react"
import { Controller, useWatch } from "react-hook-form"
import { AlertCircle, CheckCircle2, ChevronDown, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/context/language-context"
import { SecondaryRow } from "./secondary-row"
import type { BulkImportMode } from "@/hooks/forms/use-bulk-import-form"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { ObligationResponse } from "@/types/obligation"

// Recursively counts validation errors at any nesting depth
function countErrors(obj: unknown): number {
  if (!obj || typeof obj !== "object") return 0
  const o = obj as Record<string, unknown>
  if (typeof o.message === "string") return 1
  return Object.values(o).reduce((n: number, v) => n + countErrors(v), 0)
}

// Shared grid template — must match the header columns in bulk-import-view.tsx
// Desktop: full columns
export const ROW_GRID_COLS =
  "1.75rem minmax(8rem, 1fr) 6.5rem 8.5rem minmax(8rem, 9rem) minmax(9rem, 11rem) auto"
// Mobile: simplified 2-column layout handled separately

interface RowProps {
  index: number
  mode: BulkImportMode
  projectCurrency: string
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  alternativeCurrencyCodes: string[]
  partnersEnabled: boolean
  obligations: ObligationResponse[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  onRemove: (i: number) => void
}

export const BulkImportRow = memo(function BulkImportRow({
  index,
  mode,
  projectCurrency,
  categories,
  paymentMethods,
  alternativeCurrencyCodes,
  partnersEnabled,
  obligations,
  form,
  onRemove,
}: RowProps) {
  const { t } = useLanguage()
  const errors = form.formState.errors?.items?.[index]
  const errorCount = errors ? countErrors(errors) : 0

  const watchedPM = useWatch({ control: form.control, name: `items.${index}.paymentMethodId` })
  const watchedCurrency = useWatch({ control: form.control, name: `items.${index}.originalCurrency` })
  const watchedAmount = useWatch({ control: form.control, name: `items.${index}.originalAmount` })
  const watchedRate = useWatch({ control: form.control, name: `items.${index}.exchangeRate` })
  const watchedTitle = useWatch({ control: form.control, name: `items.${index}.title` })
  const watchedDate = useWatch({ control: form.control, name: `items.${index}.date` })
  const watchedCategory = useWatch({ control: form.control, name: `items.${index}.categoryId` })

  const selectedPM = paymentMethods.find((p) => p.id === watchedPM)
  const pmCurrency = selectedPM?.currency ?? ""
  const normalizedOriginalCurrency = String(watchedCurrency ?? "").trim().toUpperCase()
  const normalizedProjectCurrency = String(projectCurrency ?? "").trim().toUpperCase()
  const showExchangeRate =
    normalizedOriginalCurrency.length > 0 &&
    normalizedProjectCurrency.length > 0 &&
    normalizedOriginalCurrency !== normalizedProjectCurrency
  const showAccountAmount =
    mode === "incomes" &&
    pmCurrency !== "" &&
    pmCurrency !== watchedCurrency &&
    pmCurrency !== projectCurrency

  // Primary is complete when all required primary fields are filled
  const isPrimaryComplete = !!(watchedTitle && watchedPM && watchedAmount && watchedDate && watchedCategory)
  const isComplete = isPrimaryComplete && errorCount === 0

  const hasSecondaryFields =
    showExchangeRate || showAccountAmount || alternativeCurrencyCodes.length > 0 || partnersEnabled

  // Secondary row is shown only when primary is complete (no useEffect needed — derived during render)
  const [collapsed, setCollapsed] = useState(false)
  const expanded = isPrimaryComplete && hasSecondaryFields && !collapsed

  // Narrow to stable method references (rerender-dependencies rule)
  const setValue = form.setValue
  const getValues = form.getValues

  // Sync originalCurrency from selected payment method
  useEffect(() => {
    if (mode !== "expenses") return

    if (pmCurrency && getValues(`items.${index}.originalCurrency`) !== pmCurrency) {
      setValue(`items.${index}.originalCurrency`, pmCurrency)
      if (pmCurrency === projectCurrency) {
        setValue(`items.${index}.exchangeRate`, "1")
      }
    }
  }, [mode, pmCurrency, index, setValue, getValues, projectCurrency])

  // Auto-calculate convertedAmount = amount × rate
  useEffect(() => {
    const amount = Number(watchedAmount)
    const rate = Number(watchedRate)
    if (Number.isFinite(amount) && amount > 0 && Number.isFinite(rate) && rate > 0) {
      setValue(
        `items.${index}.convertedAmount`,
        String(parseFloat((amount * rate).toFixed(2))),
      )
    }
  }, [watchedAmount, watchedRate, index, setValue])

  const hoverClass = mode === "expenses" ? "hover:bg-rose-500/5" : "hover:bg-emerald-500/5"

  return (
    <div
      className={cn(
        "border-b border-border/50 last:border-b-0 transition-colors duration-150",
        errorCount > 0 && "bg-destructive/5",
      )}
    >
      {/* ── Primary row - Desktop ── */}
      <div
        className={cn("hidden sm:grid group items-center px-5 py-3 gap-x-3", hoverClass)}
        style={{ gridTemplateColumns: ROW_GRID_COLS }}
      >
        {/* Status indicator */}
        <div className="flex items-center justify-center">
          {errorCount > 0 ? (
            <AlertCircle className="size-3.5 text-destructive" />
          ) : isComplete ? (
            <CheckCircle2 className="size-3.5 text-emerald-500 opacity-70" />
          ) : (
            <span className="text-[11px] font-mono text-muted-foreground/50 tabular-nums">
              {index + 1}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="min-w-0">
          <Input
            {...form.register(`items.${index}.title`)}
            placeholder={t("bulkImport.colTitle")}
            className={cn(
              "h-9 text-sm w-full",
              errors?.title && "border-destructive focus-visible:ring-destructive/30",
            )}
          />
        </div>

        {/* Amount */}
        <div>
          <Input
            {...form.register(`items.${index}.originalAmount`)}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className={cn(
              "h-9 text-sm font-mono w-full",
              errors?.originalAmount && "border-destructive focus-visible:ring-destructive/30",
            )}
          />
        </div>

        {/* Date */}
        <div>
          <Input
            {...form.register(`items.${index}.date`)}
            type="date"
            className={cn(
              "h-9 text-sm w-full",
              errors?.date && "border-destructive focus-visible:ring-destructive/30",
            )}
          />
        </div>

        {/* Category */}
        <div>
          <Controller
            control={form.control}
            name={`items.${index}.categoryId`}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={cn(
                    "h-9 text-sm w-full",
                    errors?.categoryId && "border-destructive focus-visible:ring-destructive/30",
                  )}
                >
                  <SelectValue placeholder={t("bulkImport.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-sm">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Payment Method */}
        <div>
          <Controller
            control={form.control}
            name={`items.${index}.paymentMethodId`}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={cn(
                    "h-9 text-sm w-full",
                    errors?.paymentMethodId && "border-destructive focus-visible:ring-destructive/30",
                  )}
                >
                  <SelectValue placeholder={t("bulkImport.selectPaymentMethod")} />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id} className="text-sm">
                      {pm.name}
                      {pm.currency && (
                        <span className="ml-1 text-muted-foreground">({pm.currency})</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Actions: expand toggle + delete */}
        <div className="flex items-center justify-end gap-1">
          {hasSecondaryFields && (
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className={cn(
                "h-7 w-7 rounded-md flex items-center justify-center shrink-0 transition-colors",
                expanded
                  ? "text-primary bg-primary/10"
                  : isPrimaryComplete
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                    : "text-muted-foreground/30 cursor-not-allowed",
              )}
              disabled={!isPrimaryComplete}
              title={expanded ? t("bulkImport.collapseRow") : t("bulkImport.expandRow")}
            >
              <ChevronDown
                className={cn("size-3.5 transition-transform duration-200", expanded && "rotate-180")}
              />
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
            aria-label={t("bulkImport.removeRow")}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── Primary row - Mobile ── */}
      <div className={cn("sm:hidden group px-4 py-3 space-y-3", hoverClass)}>
        {/* Header: Status + Title + Delete */}
        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center pt-2.5 shrink-0">
            {errorCount > 0 ? (
              <AlertCircle className="size-3.5 text-destructive" />
            ) : isComplete ? (
              <CheckCircle2 className="size-3.5 text-emerald-500 opacity-70" />
            ) : (
              <span className="text-[11px] font-mono text-muted-foreground/50 tabular-nums">
                {index + 1}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Input
              {...form.register(`items.${index}.title`)}
              placeholder={t("bulkImport.colTitle")}
              className={cn(
                "h-9 text-sm w-full",
                errors?.title && "border-destructive focus-visible:ring-destructive/30",
              )}
            />
          </div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="h-9 w-9 rounded-md flex items-center justify-center shrink-0 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all"
            aria-label={t("bulkImport.removeRow")}
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        {/* Amount + Date row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              {t("bulkImport.colAmount")}
            </label>
            <Input
              {...form.register(`items.${index}.originalAmount`)}
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className={cn(
                "h-9 text-sm font-mono w-full",
                errors?.originalAmount && "border-destructive focus-visible:ring-destructive/30",
              )}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              {t("bulkImport.colDate")}
            </label>
            <Input
              {...form.register(`items.${index}.date`)}
              type="date"
              className={cn(
                "h-9 text-sm w-full",
                errors?.date && "border-destructive focus-visible:ring-destructive/30",
              )}
            />
          </div>
        </div>

        {/* Category + Payment Method row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              {t("bulkImport.colCategory")}
            </label>
            <Controller
              control={form.control}
              name={`items.${index}.categoryId`}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(
                      "h-9 text-sm w-full",
                      errors?.categoryId && "border-destructive focus-visible:ring-destructive/30",
                    )}
                  >
                    <SelectValue placeholder={t("bulkImport.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-sm">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              {t("bulkImport.colPaymentMethod")}
            </label>
            <Controller
              control={form.control}
              name={`items.${index}.paymentMethodId`}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(
                      "h-9 text-sm w-full",
                      errors?.paymentMethodId && "border-destructive focus-visible:ring-destructive/30",
                    )}
                  >
                    <SelectValue placeholder={t("bulkImport.selectPaymentMethod")} />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((pm) => (
                      <SelectItem key={pm.id} value={pm.id} className="text-sm">
                        {pm.name}
                        {pm.currency && (
                          <span className="ml-1 text-muted-foreground">({pm.currency})</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Expand toggle for secondary fields */}
        {hasSecondaryFields && isPrimaryComplete && (
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "w-full h-8 rounded-md flex items-center justify-center gap-1.5 text-xs transition-colors",
              expanded
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50",
            )}
          >
            <ChevronDown
              className={cn("size-3.5 transition-transform duration-200", expanded && "rotate-180")}
            />
            {expanded ? t("bulkImport.collapseRow") : t("bulkImport.expandRow")}
          </button>
        )}
      </div>

      {/* ── Secondary row — only visible when primary is filled ── */}
      {expanded && (
        <SecondaryRow
          index={index}
          mode={mode}
          projectCurrency={projectCurrency}
          alternativeCurrencyCodes={alternativeCurrencyCodes}
          partnersEnabled={partnersEnabled}
          obligations={obligations}
          paymentMethods={paymentMethods}
          form={form}
          showExchangeRate={showExchangeRate}
          showAccountAmount={showAccountAmount}
          pmCurrency={pmCurrency}
        />
      )}
    </div>
  )
})
