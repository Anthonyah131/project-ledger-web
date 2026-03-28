"use client"

import { memo, useState } from "react"
import { Controller, useFieldArray, useWatch } from "react-hook-form"
import { ArrowRightLeft, GitBranch, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/context/language-context"
import { getExchangeRate } from "@/services/exchange-rate-service"
import { toastApiError } from "@/lib/error-utils"
import type { BulkImportMode } from "@/hooks/forms/use-bulk-import-form"
import type { ObligationResponse } from "@/types/obligation"

// ─── Split Entry ───────────────────────────────────────────────────────────────

interface SplitEntryProps {
  index: number
  sIndex: number
  projectCurrency: string
  alternativeCurrencyCodes: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  splitType: "percentage" | "fixed"
}

const SplitEntry = memo(function SplitEntry({
  index,
  sIndex,
  projectCurrency,
  form,
  splitType,
}: SplitEntryProps) {
  const { t } = useLanguage()
  const { fields: splitCEFields } = useFieldArray({
    control: form.control,
    name: `items.${index}.splits.${sIndex}.currencyExchanges`,
  })

  const partnerName = form.getValues(`items.${index}.splits.${sIndex}.partnerName`)

  // Reactive values for split amount preview
  const watchedSplitValue = useWatch({
    control: form.control,
    name: `items.${index}.splits.${sIndex}.splitValue`,
  })
  const watchedConvertedAmount = useWatch({
    control: form.control,
    name: `items.${index}.convertedAmount`,
  })

  // Compute the preview amount in project currency
  const splitPreview = (() => {
    const sv = Number(watchedSplitValue)
    const ca = Number(watchedConvertedAmount)
    if (!sv || sv <= 0) return null
    const result = splitType === "percentage" ? (ca * sv) / 100 : sv
    return Number.isFinite(result) && result > 0 ? parseFloat(result.toFixed(2)) : null
  })()

  function handleAutoProportional() {
    const splitValue = Number(form.getValues(`items.${index}.splits.${sIndex}.splitValue`))
    if (!splitValue || splitValue <= 0) return

    const parentConvertedAmount = Number(form.getValues(`items.${index}.convertedAmount`))

    splitCEFields.forEach((_, ceIndex) => {
      const parentCEAmount = Number(
        form.getValues(`items.${index}.currencyExchanges.${ceIndex}.convertedAmount`),
      )
      const parentCERate = form.getValues(
        `items.${index}.currencyExchanges.${ceIndex}.exchangeRate`,
      )
      if (!parentCEAmount || parentCEAmount <= 0) return

      const splitCEAmount =
        splitType === "percentage"
          ? parseFloat(((parentCEAmount * splitValue) / 100).toFixed(4))
          : parentConvertedAmount > 0
            ? parseFloat(((parentCEAmount * splitValue) / parentConvertedAmount).toFixed(4))
            : 0

      if (splitCEAmount > 0) {
        form.setValue(
          `items.${index}.splits.${sIndex}.currencyExchanges.${ceIndex}.convertedAmount`,
          String(splitCEAmount),
        )
        form.setValue(
          `items.${index}.splits.${sIndex}.currencyExchanges.${ceIndex}.exchangeRate`,
          parentCERate,
        )
      }
    })
  }

  return (
    <div className="rounded-lg border border-border/60 bg-background px-3 py-2.5 space-y-2 min-w-56">
      {/* Partner name + split value + preview */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-foreground truncate max-w-28">
          {partnerName}
        </span>
        <Input
          {...form.register(`items.${index}.splits.${sIndex}.splitValue`)}
          type="number"
          step="0.01"
          min="0"
          placeholder={t("bulkImport.splitValuePlaceholder")}
          className="h-7 text-xs font-mono w-20 shrink-0"
        />
        {splitPreview !== null && (
          <Badge
            variant="secondary"
            className="text-[10px] font-mono tabular-nums h-5 shrink-0"
          >
            ≈ {splitPreview.toLocaleString()} {projectCurrency}
          </Badge>
        )}
        {splitCEFields.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 text-[10px] px-1.5 ml-auto shrink-0"
            onClick={handleAutoProportional}
            title={t("bulkImport.autoProportional")}
          >
            {t("bulkImport.autoProportional")}
          </Button>
        )}
      </div>

      {/* Per-split alt currency exchanges */}
      {splitCEFields.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-dashed border-border/30">
          {splitCEFields.map((ceField, ceIndex) => {
            const ceCode = form.getValues(
              `items.${index}.splits.${sIndex}.currencyExchanges.${ceIndex}.currencyCode`,
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ceCErr = (form.formState.errors?.items as any)?.[index]
              ?.splits?.[sIndex]?.currencyExchanges?.[ceIndex]?.convertedAmount
            return (
              <div
                key={ceField.id}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2 py-1",
                  ceCErr
                    ? "border-destructive/60 bg-destructive/5"
                    : "border-border/40 bg-muted/30",
                )}
              >
                <span className={cn(
                  "text-[10px] font-bold font-mono w-8 shrink-0",
                  ceCErr ? "text-destructive" : "text-muted-foreground",
                )}>
                  {ceCode}
                </span>
                <Input
                  {...form.register(
                    `items.${index}.splits.${sIndex}.currencyExchanges.${ceIndex}.convertedAmount`,
                  )}
                  type="number"
                  step="0.0001"
                  placeholder="0.0000"
                  className={cn(
                    "h-6 text-[11px] font-mono w-24",
                    ceCErr && "border-destructive focus-visible:ring-destructive/30",
                  )}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

// ─── Secondary Row ─────────────────────────────────────────────────────────────

export interface SecondaryRowProps {
  index: number
  mode: BulkImportMode
  projectCurrency: string
  alternativeCurrencyCodes: string[]
  partnersEnabled: boolean
  obligations: ObligationResponse[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  showExchangeRate: boolean
  showAccountAmount: boolean
  pmCurrency: string
}

export const SecondaryRow = memo(function SecondaryRow({
  index,
  mode,
  projectCurrency,
  alternativeCurrencyCodes,
  partnersEnabled,
  obligations,
  form,
  showExchangeRate,
  showAccountAmount,
  pmCurrency,
}: SecondaryRowProps) {
  const { t } = useLanguage()
  const [rateLoading, setRateLoading] = useState(false)
  const [ceLoadingMap, setCeLoadingMap] = useState<Record<number, boolean>>({})

  const { fields: ceFields } = useFieldArray({
    control: form.control,
    name: `items.${index}.currencyExchanges`,
  })

  const { fields: splitFields } = useFieldArray({
    control: form.control,
    name: `items.${index}.splits`,
  })

  const watchedAmount = useWatch({ control: form.control, name: `items.${index}.originalAmount` })
  const watchedConvertedAmount = useWatch({
    control: form.control,
    name: `items.${index}.convertedAmount`,
  })
  const watchedSplitType = useWatch({ control: form.control, name: `items.${index}.splitType` })
  const splitType = (watchedSplitType ?? "percentage") as "percentage" | "fixed"

  const watchedObligationId = useWatch({ control: form.control, name: `items.${index}.obligationId` })
  const watchedOriginalCurrency = useWatch({ control: form.control, name: `items.${index}.originalCurrency` })
  const selectedObligation = obligations.find((o) => o.id === watchedObligationId)
  const showObligationEquivalent =
    mode === "expenses" &&
    !!selectedObligation &&
    !!watchedOriginalCurrency &&
    watchedOriginalCurrency !== selectedObligation.currency

  const unpaidObligations = obligations.filter((o) => o.status !== "paid")

  async function handleAutoMainRate() {
    const amount = Number(watchedAmount)
    if (!amount || amount <= 0 || !pmCurrency || !projectCurrency) return
    setRateLoading(true)
    try {
      const resp = await getExchangeRate({ from: pmCurrency, to: projectCurrency, amount })
      form.setValue(`items.${index}.exchangeRate`, String(resp.rate))
      form.setValue(`items.${index}.convertedAmount`, String(resp.convertedAmount))
    } catch (err) {
      toastApiError(err, t("bulkImport.rateError"))
    } finally {
      setRateLoading(false)
    }
  }

  async function handleAutoAltRate(ceIndex: number, toCurrency: string) {
    const convertedAmount = Number(watchedConvertedAmount)
    if (!convertedAmount || convertedAmount <= 0 || !projectCurrency) return
    setCeLoadingMap((prev) => ({ ...prev, [ceIndex]: true }))
    try {
      const resp = await getExchangeRate({
        from: projectCurrency,
        to: toCurrency,
        amount: convertedAmount,
      })
      form.setValue(`items.${index}.currencyExchanges.${ceIndex}.exchangeRate`, String(resp.rate))
      form.setValue(
        `items.${index}.currencyExchanges.${ceIndex}.convertedAmount`,
        String(resp.convertedAmount),
      )
    } catch (err) {
      toastApiError(err, t("bulkImport.rateError"))
    } finally {
      setCeLoadingMap((prev) => ({ ...prev, [ceIndex]: false }))
    }
  }

  return (
    <div className="px-5 pt-3 pb-4 border-t border-dashed border-border/30 bg-muted/20 space-y-4">
      {/* Row 1: converted amount + description + notes + exchange rate + account amount */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Converted amount (moved from primary row) */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t("bulkImport.colConvertedAmount")} ({projectCurrency})
          </p>
          <Input
            {...form.register(`items.${index}.convertedAmount`)}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className="h-8 text-xs font-mono font-semibold"
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t("bulkImport.colDescription")}
          </p>
          <Input
            {...form.register(`items.${index}.description`)}
            placeholder={t("bulkImport.colDescription")}
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t("bulkImport.colNotes")}
          </p>
          <Input
            {...form.register(`items.${index}.notes`)}
            placeholder={t("bulkImport.colNotes")}
            className="h-8 text-xs"
          />
        </div>

        {mode === "expenses" && unpaidObligations.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t("bulkImport.colObligation")}
            </p>
            <Controller
              control={form.control}
              name={`items.${index}.obligationId`}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => {
                    field.onChange(v === "__none__" ? "" : v)
                    form.setValue(`items.${index}.obligationEquivalentAmount`, "")
                  }}
                >
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue placeholder={t("bulkImport.selectObligation")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" className="text-xs text-muted-foreground">
                      {t("bulkImport.noObligation")}
                    </SelectItem>
                    {unpaidObligations.map((ob) => (
                      <SelectItem key={ob.id} value={ob.id} className="text-xs">
                        {ob.title}
                        <span className="ml-1 text-muted-foreground">
                          ({ob.remainingAmount.toLocaleString()} {ob.currency})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        {showObligationEquivalent && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t("bulkImport.colObligationEquivalent", { currency: selectedObligation!.currency })}
            </p>
            <Input
              {...form.register(`items.${index}.obligationEquivalentAmount`)}
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="h-8 text-xs font-mono"
            />
          </div>
        )}

        {showExchangeRate && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {pmCurrency} → {projectCurrency} {t("bulkImport.colExchangeRate")}
            </p>
            <div className="flex gap-1.5">
              <Input
                {...form.register(`items.${index}.exchangeRate`)}
                type="number"
                step="0.000001"
                min="0.000001"
                placeholder="1.000000"
                className="h-8 text-xs font-mono flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2 text-[11px] shrink-0"
                onClick={handleAutoMainRate}
                disabled={rateLoading}
              >
                {rateLoading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  t("bulkImport.autoRate")
                )}
              </Button>
            </div>
          </div>
        )}

        {showAccountAmount && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t("bulkImport.colAccountAmount")} ({pmCurrency})
            </p>
            <Input
              {...form.register(`items.${index}.accountAmount`)}
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="h-8 text-xs font-mono"
            />
          </div>
        )}
      </div>

      {/* Row 2: Alternative currency conversions */}
      {ceFields.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="size-3 text-muted-foreground" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t("bulkImport.colAltCurrencies")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {ceFields.map((field, ceIndex) => {
              const currencyCode = form.getValues(
                `items.${index}.currencyExchanges.${ceIndex}.currencyCode`,
              )
              const isLoading = ceLoadingMap[ceIndex] ?? false
              return (
                <div
                  key={field.id}
                  className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2"
                >
                  <span className="text-xs font-bold font-mono w-10 shrink-0 text-foreground">
                    {currencyCode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">×</span>
                    <Input
                      {...form.register(
                        `items.${index}.currencyExchanges.${ceIndex}.exchangeRate`,
                      )}
                      type="number"
                      step="0.000001"
                      placeholder="1.000000"
                      className="h-7 text-xs font-mono w-24"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">=</span>
                  <Input
                    {...form.register(
                      `items.${index}.currencyExchanges.${ceIndex}.convertedAmount`,
                    )}
                    type="number"
                    step="0.0001"
                    placeholder="0.00"
                    className="h-7 text-xs font-mono w-28"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-1.5 text-[11px] text-muted-foreground hover:text-foreground shrink-0"
                    onClick={() => handleAutoAltRate(ceIndex, currencyCode)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      t("bulkImport.autoRate")
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Row 3: Splits */}
      {partnersEnabled && splitFields.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <GitBranch className={cn(
                "size-3",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (form.formState.errors?.items as any)?.[index]?.splits?.message
                  ? "text-destructive"
                  : "text-muted-foreground",
              )} />
              <p className={cn(
                "text-[10px] font-semibold uppercase tracking-widest",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (form.formState.errors?.items as any)?.[index]?.splits?.message
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}>
                {t("bulkImport.colSplits")}
              </p>
            </div>
            <Controller
              control={form.control}
              name={`items.${index}.splitType`}
              render={({ field }) => (
                <Select value={field.value ?? "percentage"} onValueChange={field.onChange}>
                  <SelectTrigger className="h-6 text-[11px] w-24 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage" className="text-xs">
                      {t("bulkImport.splitPercentage")}
                    </SelectItem>
                    <SelectItem value="fixed" className="text-xs">
                      {t("bulkImport.splitFixed")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {splitFields.map((field, sIndex) => (
              <SplitEntry
                key={field.id}
                index={index}
                sIndex={sIndex}
                projectCurrency={projectCurrency}
                alternativeCurrencyCodes={alternativeCurrencyCodes}
                form={form}
                splitType={splitType}
              />
            ))}
          </div>
          {/* Root-level splits error (e.g. all blank / sum mismatch) */}
          {(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (form.formState.errors?.items as any)?.[index]?.splits?.message
            return msg ? (
              <p className="text-[11px] text-destructive font-medium">{msg}</p>
            ) : null
          })()}
        </div>
      )}
    </div>
  )
})
