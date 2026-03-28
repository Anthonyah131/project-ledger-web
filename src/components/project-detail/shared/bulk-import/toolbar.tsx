"use client"

import { memo, useCallback, useRef, useState } from "react"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardPaste,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/context/language-context"
import type { ParseResult } from "@/lib/bulk-import-utils"
import type { BulkImportMode } from "@/hooks/forms/use-bulk-import-form"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"

// ─── Format Guide ─────────────────────────────────────────────────────────────

export const FormatGuide = memo(function FormatGuide({
  defaultOpen,
  mode,
}: {
  defaultOpen: boolean
  mode: BulkImportMode
}) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(defaultOpen)

  const accentBg =
    mode === "expenses"
      ? "bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-400"
      : "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"

  return (
    <div className={cn("rounded-xl border overflow-hidden", accentBg)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <span className="font-bold text-[11px] uppercase tracking-widest">
          {t("bulkImport.formatGuide.title")}
        </span>
        {open ? (
          <ChevronDown className="size-3.5 opacity-60" />
        ) : (
          <ChevronRight className="size-3.5 opacity-60" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-current/20 space-y-3">
          <p className="text-xs text-muted-foreground pt-3">
            {t("bulkImport.formatGuide.subtitle")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {([1, 2, 3, 4] as const).map((n) => (
              <div key={n} className="rounded-lg border border-border/60 bg-card p-3 space-y-1">
                <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
                  Col {n}
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {t(`bulkImport.formatGuide.col${n}Name` as any)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {t(`bulkImport.formatGuide.col${n}Type` as any)} —{" "}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {t(`bulkImport.formatGuide.col${n}Hint` as any)}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/70 italic">
            {t("bulkImport.formatGuide.tip")}
          </p>
        </div>
      )}
    </div>
  )
})

// ─── Parse Banner ─────────────────────────────────────────────────────────────

export const ParseBanner = memo(function ParseBanner({
  parseResult,
}: {
  parseResult: ParseResult | null
}) {
  const { t } = useLanguage()
  if (!parseResult) return null

  if (parseResult.error) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
        <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
        <p className="text-sm text-destructive/90">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {t(`bulkImport.${parseResult.error}` as any)}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5">
        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
          {t("bulkImport.toast.pasteDetected", { count: parseResult.stats.parsedRows })}
        </p>
      </div>
      {parseResult.warnings.map((w) => (
        <div
          key={w}
          className="flex items-start gap-2.5 rounded-xl border border-amber-400/30 bg-amber-500/5 px-4 py-2.5"
        >
          <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {t(`bulkImport.${w}` as any)}
          </p>
        </div>
      ))}
    </div>
  )
})

// ─── Paste Area ───────────────────────────────────────────────────────────────

export const InlinePasteArea = memo(function InlinePasteArea({
  onPaste,
  hasError,
  mode,
}: {
  onPaste: (text: string) => void
  hasError: boolean
  mode: BulkImportMode
}) {
  const { t } = useLanguage()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault()
      const text = e.clipboardData.getData("text")
      if (text) onPaste(text)
    },
    [onPaste],
  )

  const iconBg = mode === "expenses" ? "bg-rose-500/10" : "bg-emerald-500/10"
  const iconColor = mode === "expenses" ? "text-rose-500" : "text-emerald-500"
  const borderHover = mode === "expenses" ? "hover:border-rose-500/40" : "hover:border-emerald-500/40"

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-5 py-14 px-6",
        "rounded-xl border-2 border-dashed transition-all duration-200",
        hasError
          ? "border-destructive/40 bg-destructive/5"
          : cn("border-border/50 bg-card", borderHover),
      )}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className={cn(
            "size-14 rounded-full flex items-center justify-center",
            hasError ? "bg-destructive/10" : iconBg,
          )}
        >
          <ClipboardPaste className={cn("size-7", hasError ? "text-destructive" : iconColor)} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold">{t("bulkImport.pastePrompt")}</p>
          <p className="text-xs text-muted-foreground max-w-sm">{t("bulkImport.subtitle")}</p>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        onPaste={handlePaste}
        onClick={() => textareaRef.current?.focus()}
        aria-label={t("bulkImport.pasteAreaLabel")}
        placeholder={t("bulkImport.pasteAreaLabel")}
        className={cn(
          "w-full max-w-lg h-24 p-3 text-xs font-mono",
          "rounded-lg border-2 border-dashed",
          "bg-background/60 text-muted-foreground placeholder:text-muted-foreground/30",
          "focus:outline-none resize-none transition-colors cursor-text",
          hasError ? "border-destructive/40" : "border-border/60",
        )}
        readOnly
      />
    </div>
  )
})

// ─── Apply-to-all Bar ─────────────────────────────────────────────────────────

export const ApplyToAllBar = memo(function ApplyToAllBar({
  mode,
  categories,
  paymentMethods,
  onApplyToAll,
  onApplyToEmpty,
}: {
  mode: BulkImportMode
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onApplyToAll: (field: any, value: string) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onApplyToEmpty: (field: any, value: string) => void
}) {
  const { t } = useLanguage()
  const catRef = useRef<string>("")
  const pmRef = useRef<string>("")

  const gradient =
    mode === "expenses"
      ? "border-b border-rose-500/20 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent"
      : "border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent"

  const labelColor =
    mode === "expenses"
      ? "text-rose-600 dark:text-rose-400"
      : "text-emerald-600 dark:text-emerald-400"

  return (
    <>
      {/* Desktop Layout */}
      <div className={cn("hidden sm:flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-2.5 text-xs", gradient)}>
        <span className={cn("font-bold text-[11px] uppercase tracking-widest shrink-0", labelColor)}>
          {t("bulkImport.applyToAll")}
        </span>

        <div className="flex items-center gap-1.5">
          <Select onValueChange={(v) => { catRef.current = v }}>
            <SelectTrigger className="h-7 text-xs w-40 bg-background/60 border-border/60">
              <SelectValue placeholder={t("bulkImport.selectCategory")} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2"
            onClick={() => catRef.current && onApplyToAll("categoryId", catRef.current)}
          >
            {t("bulkImport.applyToAll")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2"
            onClick={() => catRef.current && onApplyToEmpty("categoryId", catRef.current)}
          >
            {t("bulkImport.applyToEmpty")}
          </Button>
        </div>

        <div className="w-px h-4 bg-border/50 shrink-0" />

        <div className="flex items-center gap-1.5">
          <Select onValueChange={(v) => { pmRef.current = v }}>
            <SelectTrigger className="h-7 text-xs w-44 bg-background/60 border-border/60">
              <SelectValue placeholder={t("bulkImport.selectPaymentMethod")} />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((pm) => (
                <SelectItem key={pm.id} value={pm.id} className="text-xs">
                  {pm.name}
                  {pm.currency && (
                    <span className="ml-1 text-muted-foreground">({pm.currency})</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2"
            onClick={() => pmRef.current && onApplyToAll("paymentMethodId", pmRef.current)}
          >
            {t("bulkImport.applyToAll")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2"
            onClick={() => pmRef.current && onApplyToEmpty("paymentMethodId", pmRef.current)}
          >
            {t("bulkImport.applyToEmpty")}
          </Button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className={cn("sm:hidden px-4 py-3 space-y-3", gradient)}>
        <span className={cn("font-bold text-[11px] uppercase tracking-widest block", labelColor)}>
          {t("bulkImport.applyToAll")}
        </span>

        {/* Category row */}
        <div className="space-y-2">
          <Select onValueChange={(v) => { catRef.current = v }}>
            <SelectTrigger className="h-9 text-xs w-full bg-background/60 border-border/60">
              <SelectValue placeholder={t("bulkImport.selectCategory")} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-[11px] w-full"
              onClick={() => catRef.current && onApplyToAll("categoryId", catRef.current)}
            >
              {t("bulkImport.applyToAll")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-[11px] w-full"
              onClick={() => catRef.current && onApplyToEmpty("categoryId", catRef.current)}
            >
              {t("bulkImport.applyToEmpty")}
            </Button>
          </div>
        </div>

        {/* Payment method row */}
        <div className="space-y-2">
          <Select onValueChange={(v) => { pmRef.current = v }}>
            <SelectTrigger className="h-9 text-xs w-full bg-background/60 border-border/60">
              <SelectValue placeholder={t("bulkImport.selectPaymentMethod")} />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((pm) => (
                <SelectItem key={pm.id} value={pm.id} className="text-xs">
                  {pm.name}
                  {pm.currency && (
                    <span className="ml-1 text-muted-foreground">({pm.currency})</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-[11px] w-full"
              onClick={() => pmRef.current && onApplyToAll("paymentMethodId", pmRef.current)}
            >
              {t("bulkImport.applyToAll")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-[11px] w-full"
              onClick={() => pmRef.current && onApplyToEmpty("paymentMethodId", pmRef.current)}
            >
              {t("bulkImport.applyToEmpty")}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
})
