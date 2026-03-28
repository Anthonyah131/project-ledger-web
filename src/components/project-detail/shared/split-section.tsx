"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useFieldArray, useWatch } from "react-hook-form"
import type { UseFormReturn } from "react-hook-form"
import { Calculator, GitBranch, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { ProjectPartnerResponse } from "@/types/project-partner"
import { useLanguage } from "@/context/language-context"

type ParentCE = {
  currencyCode?: string
  exchangeRate?: string
  convertedAmount?: string
}

type SplitCE = {
  currencyCode?: string
  exchangeRate?: string
  convertedAmount?: string
}

type RawSplitItem = {
  partnerId?: string
  partnerName?: string
  splitValue?: string
  currencyExchanges?: SplitCE[]
}

/** Build empty CE shells from parent exchanges (no computed amounts). */
function buildEmptyCEs(parentCEs: ParentCE[]): SplitCE[] {
  return parentCEs
    .filter((pce) => pce.currencyCode)
    .map((pce) => ({ currencyCode: pce.currencyCode ?? "", exchangeRate: pce.exchangeRate ?? "", convertedAmount: "" }))
}

/** Pure function: compute split currency-exchanges from parent exchanges. */
function computeSplitCEs(
  splitValue: number,
  parentCEs: ParentCE[],
  isPercentage: boolean,
  convertedAmount: number,
): SplitCE[] {
  if (!parentCEs.length) return []
  const valid = parentCEs.filter(
    (pce) => pce.currencyCode && Number(pce.convertedAmount) > 0,
  )
  if (!valid.length) return []

  return valid.map((pce) => {
    const parentConverted = Number(pce.convertedAmount)
    const splitConverted = isPercentage
      ? parseFloat((parentConverted * splitValue / 100).toFixed(4))
      : convertedAmount > 0
        ? parseFloat((parentConverted * splitValue / convertedAmount).toFixed(4))
        : 0
    return {
      currencyCode: pce.currencyCode ?? "",
      exchangeRate: pce.exchangeRate ?? "",
      convertedAmount: String(splitConverted),
    }
  })
}

interface SplitSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  assignedPartners: ProjectPartnerResponse[]
  partnersEnabled: boolean
  watchConvertedAmount?: string
  projectCurrency?: string
}

export function SplitSection({
  form,
  assignedPartners,
  partnersEnabled,
  watchConvertedAmount = "",
  projectCurrency = "",
}: SplitSectionProps) {
  const { t } = useLanguage()
  const { replace } = useFieldArray({ control: form.control, name: "splits" })

  const splitType = (useWatch({ control: form.control, name: "splitType" }) ?? "percentage") as
    | "percentage"
    | "fixed"

  const rawSplits = useWatch({ control: form.control, name: "splits" }) as
    | RawSplitItem[]
    | undefined

  const parentCurrencyExchanges = useWatch({ control: form.control, name: "currencyExchanges" }) as
    | ParentCE[]
    | undefined

  const n = assignedPartners.length
  const convertedAmount = Number(watchConvertedAmount)
  const isPercentage = splitType === "percentage"

  // Sync field array entries with assigned partners list.
  // On partner list change: reset to current values, preserving existing splitValues and CEs.
  useEffect(() => {
    if (!partnersEnabled || n === 0) return

    const current = (form.getValues("splits") as RawSplitItem[] | undefined) ?? []
    const parentCEs = (form.getValues("currencyExchanges") as ParentCE[] | undefined) ?? []

    const next = assignedPartners.map((p) => {
      const existing = current.find((s) => s.partnerId === p.partnerId)
      const splitValue = existing?.splitValue ?? ""
      const numValue = Number(splitValue)

      const existingCEs = existing?.currencyExchanges ?? []
      const currencyExchanges =
        existingCEs.length > 0
          ? existingCEs
          : numValue > 0
          ? computeSplitCEs(numValue, parentCEs, isPercentage, convertedAmount)
          : buildEmptyCEs(parentCEs)

      return { partnerId: p.partnerId, partnerName: p.partnerName, splitValue, currencyExchanges }
    })

    const isDifferent =
      current.length !== next.length ||
      next.some(
        (item, i) =>
          item.partnerId !== current[i]?.partnerId ||
          item.partnerName !== current[i]?.partnerName
      )

    if (isDifferent) {
      replace(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedPartners, partnersEnabled, replace, form])

  const total = useMemo(
    () =>
      (rawSplits ?? []).reduce((sum, s) => {
        const v = Number(s.splitValue)
        return sum + (Number.isFinite(v) ? v : 0)
      }, 0),
    [rawSplits]
  )

  const hasValues = total > 0
  const expectedTotal = isPercentage ? 100 : convertedAmount
  const isValid = !hasValues || Math.abs(total - expectedTotal) < 0.02

  // Validates parent CEs to know which alternative currencies exist
  const validParentCEs = useMemo(
    () =>
      (parentCurrencyExchanges ?? []).filter(
        (pce) => pce.currencyCode && Number(pce.exchangeRate) > 0 && Number(pce.convertedAmount) > 0
      ),
    [parentCurrencyExchanges]
  )

  const fillEqual = useCallback(() => {
    if (n === 0) return
    const parentCEs = parentCurrencyExchanges ?? []
    const total = isPercentage ? 100 : convertedAmount
    if (!total || total <= 0) return

    const base = Math.floor((total / n) * 100) / 100
    const last = parseFloat((total - base * (n - 1)).toFixed(2))
    replace(
      assignedPartners.map((p, i) => {
        const val = i === n - 1 ? last : base
        return {
          partnerId: p.partnerId,
          partnerName: p.partnerName,
          splitValue: String(val),
          currencyExchanges: computeSplitCEs(val, parentCEs, isPercentage, convertedAmount),
        }
      }),
    )
  }, [n, parentCurrencyExchanges, isPercentage, convertedAmount, replace, assignedPartners])

  // Manual CE recalculation: recalculates all split CEs based on current split values.
  const recalculateCEs = useCallback(() => {
    const parentCEs = parentCurrencyExchanges ?? []
    if (!parentCEs.some((pce) => pce.currencyCode && Number(pce.convertedAmount) > 0)) return
    const currentSplits = (form.getValues("splits") as RawSplitItem[] | undefined) ?? []
    currentSplits.forEach((split, index) => {
      const splitValue = Number(split.splitValue)
      const updatedCEs = splitValue > 0
        ? computeSplitCEs(splitValue, parentCEs, isPercentage, convertedAmount)
        : buildEmptyCEs(parentCEs)
      if (updatedCEs.length > 0) {
        form.setValue(`splits.${index}.currencyExchanges`, updatedCEs, { shouldValidate: false })
      }
    })
  }, [parentCurrencyExchanges, isPercentage, convertedAmount, form])

  if (!partnersEnabled || n === 0) return null

  return (
    <div className="rounded-md border border-border p-4 flex flex-col gap-3">
      {/* Header: title + type toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <GitBranch className="size-4 text-violet-500" />
          {t("splitSection.title")}
        </div>
        <div className="flex rounded-md border border-border overflow-hidden text-xs">
          <button
            type="button"
            className={`px-3 py-1 transition-colors ${
              isPercentage
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
            onClick={() => form.setValue("splitType", "percentage", { shouldValidate: false })}
          >
            {t("splitSection.percentageMode")}
          </button>
          <button
            type="button"
            className={`px-3 py-1 transition-colors ${
              !isPercentage
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
            onClick={() => form.setValue("splitType", "fixed", { shouldValidate: false })}
          >
            {t("splitSection.fixedMode")}
          </button>
        </div>
      </div>

      {/* Description + action buttons */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {isPercentage
            ? t("splitSection.percentageDescription", { currency: projectCurrency || t("common.currency") })
            : t("splitSection.fixedDescription", { currency: projectCurrency || t("common.currency") })}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          {validParentCEs.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={recalculateCEs}
              disabled={!convertedAmount || convertedAmount <= 0}
            >
              <Calculator className="size-3" />
              {t("splitSection.recalculateCEsButton")}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={fillEqual}
            disabled={!isPercentage && (!convertedAmount || convertedAmount <= 0)}
          >
            <RefreshCw className="size-3" />
            {t("splitSection.equalizeButton")}
          </Button>
        </div>
      </div>

      {/* Per-partner rows */}
      <div className="flex flex-col gap-3">
        {assignedPartners.map((partner, index) => {
          const splitValue = Number((rawSplits ?? [])[index]?.splitValue ?? "")
          const resolvedHint =
            isPercentage && splitValue > 0 && convertedAmount > 0
              ? parseFloat((convertedAmount * splitValue / 100).toFixed(2))
              : null

          return (
            <div key={partner.partnerId} className="flex flex-col gap-1.5">
              {/* Main split input row */}
              <FormField
                control={form.control}
                name={`splits.${index}.splitValue`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3 space-y-0">
                    <FormLabel className="flex-1 text-sm font-normal">
                      {partner.partnerName}
                    </FormLabel>
                    <div className="flex items-center gap-1.5">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max={isPercentage ? "100" : undefined}
                          placeholder="0"
                          className="w-24 text-right"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <span className="text-xs text-muted-foreground w-12 shrink-0">
                        {isPercentage ? "%" : (projectCurrency || "")}
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Resolved amount hint for percentage mode */}
              {isPercentage && resolvedHint !== null && (
                <p className="text-xs text-muted-foreground pl-0 text-right pr-16">
                  = {projectCurrency} {resolvedHint.toLocaleString()}
                </p>
              )}

              {/* Per-split currency exchange inputs */}
              {validParentCEs.length > 0 && (
                <div className="ml-2 flex flex-col gap-1 border-l border-border pl-3">
                  {validParentCEs.map((pce, ceIndex) => (
                    <div key={pce.currencyCode} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-10 shrink-0">
                        {pce.currencyCode}
                      </span>
                      <FormField
                        control={form.control}
                        name={`splits.${index}.currencyExchanges.${ceIndex}.convertedAmount`}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="h-7 w-28 text-xs text-right"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <span className="text-xs text-muted-foreground shrink-0">
                        {pce.currencyCode}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Total summary */}
      {hasValues && (
        <div
          className={`flex items-center justify-between text-xs pt-2 border-t border-border ${
            isValid ? "text-muted-foreground" : "text-destructive"
          }`}
        >
          <span>{t("splitSection.totalLabel")}</span>
          <span className="font-mono">
            {isPercentage
              ? `${total.toFixed(2)}% / 100%`
              : `${projectCurrency} ${total.toFixed(2)} / ${
                  convertedAmount > 0 ? convertedAmount.toFixed(2) : "?"
                }`}
          </span>
        </div>
      )}

      {hasValues && !isValid && (
        <p className="text-xs text-destructive">
          {isPercentage
            ? total > 100
              ? t("splitSection.errorOver", { amount: (total - 100).toFixed(2) })
              : t("splitSection.errorUnder", { amount: (100 - total).toFixed(2) })
            : t("splitSection.errorFixed")}
        </p>
      )}
    </div>
  )
}
