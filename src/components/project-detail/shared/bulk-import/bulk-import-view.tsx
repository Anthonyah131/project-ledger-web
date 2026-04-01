"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowUp, ChevronDown, Plus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/context/language-context"
import { useBulkImportForm, type BulkImportMode } from "@/hooks/forms/use-bulk-import-form"
import type { BulkCreateExpensesRequest } from "@/types/expense"
import type { BulkCreateIncomesRequest } from "@/types/income"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { ProjectPartnerResponse } from "@/types/project-partner"
import type { ObligationResponse } from "@/types/obligation"
import { FormatGuide, ParseBanner, InlinePasteArea, ApplyToAllBar } from "./toolbar"
import { BulkImportRow, ROW_GRID_COLS } from "./row"

// Stable empty defaults — avoids new array instances on every render, breaking memo()
const EMPTY_STRINGS: string[] = []
const EMPTY_PARTNERS: ProjectPartnerResponse[] = []
const EMPTY_OBLIGATIONS: ObligationResponse[] = []

export interface BulkImportViewProps {
  mode: BulkImportMode
  projectCurrency: string
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  alternativeCurrencyCodes?: string[]
  partnersEnabled?: boolean
  assignedPartners?: ProjectPartnerResponse[]
  obligations?: ObligationResponse[]
  onSubmitExpenses?: (data: BulkCreateExpensesRequest) => Promise<void>
  onSubmitIncomes?: (data: BulkCreateIncomesRequest) => Promise<void>
  onClose: () => void
}

export function BulkImportView({
  mode,
  projectCurrency,
  categories,
  paymentMethods,
  alternativeCurrencyCodes = EMPTY_STRINGS,
  partnersEnabled = false,
  assignedPartners = EMPTY_PARTNERS,
  obligations = EMPTY_OBLIGATIONS,
  onSubmitExpenses,
  onSubmitIncomes,
  onClose,
}: BulkImportViewProps) {
  const { t } = useLanguage()
  const tableTopRef = useRef<HTMLDivElement>(null)
  const tableBottomRef = useRef<HTMLDivElement>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const {
    form,
    fields,
    submitting,
    parseResult,
    obligations: activeObligations,
    addRow,
    removeRow,
    clearAll,
    handlePaste,
    applyToAll,
    applyToEmpty,
    onSubmit,
    handleClose,
    canAddMore,
    itemCount,
    maxItems,
  } = useBulkImportForm({
    mode,
    projectCurrency,
    categories,
    paymentMethods,
    alternativeCurrencyCodes,
    partnersEnabled,
    assignedPartners,
    obligations,
    onSubmitExpenses,
    onSubmitIncomes,
    onClose,
  })

  // Show floating back-to-top button when scrolled past the table header
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowBackToTop(!entry.isIntersecting),
      { threshold: 0 },
    )
    const el = tableTopRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [fields.length]) // re-attach when rows appear/disappear

  const scrollToTop = useCallback(() => {
    tableTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const scrollToBottom = useCallback(() => {
    tableBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [])

  const hasRows = fields.length > 0
  const title = mode === "expenses" ? t("bulkImport.expenseTitle") : t("bulkImport.incomeTitle")

  const headerGradient =
    mode === "expenses"
      ? "border-b border-rose-500/20 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent"
      : "border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent"

  const headerText =
    mode === "expenses"
      ? "text-rose-600 dark:text-rose-400"
      : "text-emerald-600 dark:text-emerald-400"

  const submitBtn =
    mode === "expenses"
      ? "bg-rose-600 hover:bg-rose-700 text-white"
      : "bg-emerald-600 hover:bg-emerald-700 text-white"

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="gap-1.5 text-muted-foreground h-8 px-2"
          >
            <ArrowLeft className="size-4" />
            {t("bulkImport.backToList")}
          </Button>
          <div className="w-px h-5 bg-border" />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        {hasRows && (
          <span className={cn("text-[11px] font-semibold tabular-nums uppercase tracking-wide", headerText)}>
            {t("bulkImport.rowCount", { count: itemCount, max: maxItems })}
          </span>
        )}
      </div>

      {/* ── Format guide ── */}
      <FormatGuide defaultOpen={!hasRows} mode={mode} />

      {/* ── Parse feedback ── */}
      <ParseBanner parseResult={parseResult} />

      {/* ── Paste area or table ── */}
      {!hasRows ? (
        <InlinePasteArea onPaste={handlePaste} hasError={!!parseResult?.error} mode={mode} />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card" ref={tableTopRef}>
          {/* Apply-to-all toolbar */}
          <ApplyToAllBar
            mode={mode}
            categories={categories}
            paymentMethods={paymentMethods}
            onApplyToAll={applyToAll}
            onApplyToEmpty={applyToEmpty}
          />

          {/* Column header + "jump to bottom" — overflow-x only (no vertical scroll: show all rows) */}
          <div className="overflow-x-auto">
            <div className="min-w-140">
              {/* Column header row - Desktop */}
              <div
                className={cn(
                  "hidden sm:grid items-center px-5 py-2.5 gap-x-3 text-[11px] font-bold uppercase tracking-widest",
                  headerGradient,
                  headerText,
                )}
                style={{ gridTemplateColumns: ROW_GRID_COLS }}
              >
                <div />
                <div>{t("bulkImport.colTitle")}</div>
                <div>{t("bulkImport.colAmount")}</div>
                <div>{t("bulkImport.colDate")}</div>
                <div>{t("bulkImport.colCategory")}</div>
                <div>{t("bulkImport.colPaymentMethod")}</div>
                {/* actions column: scroll-to-bottom button */}
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    className={cn(
                      "h-6 w-6 rounded-md flex items-center justify-center transition-colors",
                      "text-current/60 hover:text-current hover:bg-black/10 dark:hover:bg-white/10",
                    )}
                    title={t("bulkImport.jumpToBottom")}
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Column header row - Mobile */}
              <div
                className={cn(
                  "flex sm:hidden items-center justify-between px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest",
                  headerGradient,
                  headerText,
                )}
              >
                <span>{t("bulkImport.rowCount", { count: itemCount, max: maxItems })}</span>
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className={cn(
                    "h-6 w-6 rounded-md flex items-center justify-center transition-colors",
                    "text-current/60 hover:text-current hover:bg-black/10 dark:hover:bg-white/10",
                  )}
                  title={t("bulkImport.jumpToBottom")}
                >
                  <ChevronDown className="size-3.5" />
                </button>
              </div>

              {/* All rows — no vertical scroll cap */}
              {fields.map((field, index) => (
                <BulkImportRow
                  key={field.id}
                  index={index}
                  mode={mode}
                  projectCurrency={projectCurrency}
                  categories={categories}
                  paymentMethods={paymentMethods}
                  alternativeCurrencyCodes={alternativeCurrencyCodes}
                  partnersEnabled={partnersEnabled}
                  obligations={activeObligations}
                  form={form}
                  onRemove={removeRow}
                />
              ))}

              {/* Bottom sentinel + "jump to top" button */}
              <div
                ref={tableBottomRef}
                className={cn(
                  "flex items-center justify-end px-5 py-2 border-t border-border/30",
                  headerGradient,
                )}
              >
                <button
                  type="button"
                  onClick={scrollToTop}
                  className={cn(
                    "h-6 w-6 rounded-md flex items-center justify-center transition-colors",
                    "text-current/60 hover:text-current hover:bg-black/10 dark:hover:bg-white/10",
                  )}
                  title={t("bulkImport.scrollToTop")}
                >
                  <ArrowUp className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Action bar ── */}
      <div className="flex items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-2">
          {hasRows && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRow}
                disabled={!canAddMore}
                className="gap-1.5 h-8 text-xs"
              >
                <Plus className="size-3.5" />
                {t("bulkImport.addRow")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="gap-1.5 h-8 text-xs text-muted-foreground"
              >
                <RotateCcw className="size-3.5" />
                {t("bulkImport.clearAll")}
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={handleClose}
          >
            {t("common.cancel")}
          </Button>
          {hasRows && (
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className={cn("h-8 text-xs font-semibold", submitBtn)}
            >
              {submitting
                ? t("bulkImport.importing")
                : t("bulkImport.importButton", {
                    count: itemCount,
                    type:
                      mode === "expenses"
                        ? t("bulkImport.typeExpenses")
                        : t("bulkImport.typeIncomes"),
                  })}
            </Button>
          )}
        </div>
      </div>

      {/* ── Floating back-to-top (appears when table top is off-screen) ── */}
      {showBackToTop && hasRows && (
        <div className="sticky bottom-4 flex justify-end pointer-events-none">
          <button
            type="button"
            onClick={scrollToTop}
            className={cn(
              "pointer-events-auto h-9 w-9 rounded-full shadow-lg",
              "flex items-center justify-center transition-all",
              "bg-background border border-border hover:border-primary/40",
              "text-muted-foreground hover:text-primary",
            )}
            title={t("bulkImport.scrollToTop")}
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      )}
    </form>
  )
}
