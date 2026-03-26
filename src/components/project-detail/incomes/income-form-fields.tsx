"use client"

import { useEffect, useMemo, useState } from "react"
import { useFieldArray, useWatch } from "react-hook-form"
import type { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { GitBranch, SlidersHorizontal } from "lucide-react"
import { ProjectCurrencyConversionSection } from "@/components/project-detail/shared/currency-conversion/project-currency-conversion-section"
import { AlternativeCurrencyExchangesSection } from "@/components/project-detail/shared/currency-conversion/alternative-currency-conversions-section"
import { SplitSection } from "@/components/project-detail/shared/split-section"
import type { CategoryResponse } from "@/types/category"
import type { CurrencyResponse } from "@/types/currency"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { ProjectPartnerResponse } from "@/types/project-partner"
import { getExchangeRate } from "@/services/exchange-rate-service"
import { getTodayIsoDate } from "@/lib/date-utils"
import { formatPaymentMethodLabel } from "@/lib/payment-method-utils"
import { useLanguage } from "@/context/language-context"

interface IncomeFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  availableCurrencies: CurrencyResponse[]
  projectCurrency: string
  watchCurrency: string
  watchAmount: string
  watchExchangeRate: string
  watchConvertedAmount: string
  alternativeCurrencyCodes?: string[]
  showPlaceholders?: boolean
  partnersEnabled?: boolean
  assignedPartners?: ProjectPartnerResponse[]
}

export function IncomeFormFields({
  form,
  categories,
  paymentMethods,
  availableCurrencies,
  projectCurrency,
  watchCurrency,
  watchAmount,
  watchExchangeRate,
  watchConvertedAmount,
  alternativeCurrencyCodes,
  showPlaceholders = false,
  partnersEnabled = false,
  assignedPartners = [],
}: IncomeFormFieldsProps) {
  const { t } = useLanguage()
  const today = getTodayIsoDate()

  const watchPaymentMethodId = useWatch({ control: form.control, name: "paymentMethodId" })
  const selectedPaymentMethod = paymentMethods.find((p) => p.id === watchPaymentMethodId)

  const { fields, remove, replace } = useFieldArray({
    control: form.control,
    name: "currencyExchanges",
  })

  const rawCurrencyExchanges = useWatch({
    control: form.control,
    name: "currencyExchanges",
  }) as Array<{ currencyCode?: string }> | undefined
  const watchCurrencyExchanges = useMemo(
    () => rawCurrencyExchanges ?? [],
    [rawCurrencyExchanges],
  )

  const normalizedProjectCurrency = projectCurrency.trim().toUpperCase()
  const normalizedOriginalCurrency = watchCurrency.trim().toUpperCase()

  const currencyOptions = useMemo(() => {
    const byCode = new Map<string, CurrencyResponse>()
    availableCurrencies.forEach((currency) => {
      byCode.set(currency.code.toUpperCase(), currency)
    })

    if (normalizedOriginalCurrency.length > 0 && !byCode.has(normalizedOriginalCurrency)) {
      byCode.set(normalizedOriginalCurrency, {
        code: normalizedOriginalCurrency,
        name: normalizedOriginalCurrency,
        symbol: normalizedOriginalCurrency,
        decimalPlaces: 2,
        isActive: true,
      })
    }

    return Array.from(byCode.values()).sort((left, right) =>
      left.code.localeCompare(right.code)
    )
  }, [availableCurrencies, normalizedOriginalCurrency])

  const accountCurrency = selectedPaymentMethod?.currency?.trim().toUpperCase() ?? ""

  // Show account amount field when payment method currency differs from BOTH origin and project currency
  const requiresManualAccountAmount =
    accountCurrency.length > 0 &&
    normalizedOriginalCurrency.length > 0 &&
    normalizedProjectCurrency.length > 0 &&
    accountCurrency !== normalizedOriginalCurrency &&
    accountCurrency !== normalizedProjectCurrency

  const needsProjectConversion =
    normalizedProjectCurrency.length > 0 &&
    normalizedOriginalCurrency.length > 0 &&
    normalizedProjectCurrency !== normalizedOriginalCurrency

  const projectAmount = needsProjectConversion
    ? Number(watchConvertedAmount)
    : Number(watchAmount)

  const [autoRateLoading, setAutoRateLoading] = useState<Record<number, boolean>>({})
  const [autoProjectRateLoading, setAutoProjectRateLoading] = useState(false)

  useEffect(() => {
    if (!needsProjectConversion) {
      form.setValue("exchangeRate", "1", { shouldValidate: true })
      if (watchAmount.trim().length > 0) {
        form.setValue("convertedAmount", watchAmount, { shouldValidate: true })
      }
      return
    }

    if (watchConvertedAmount.trim().length === 0 && watchAmount.trim().length > 0) {
      const derived = Number(watchAmount) * (Number(watchExchangeRate) || 1)
      if (Number.isFinite(derived) && derived > 0) {
        form.setValue("convertedAmount", derived.toFixed(2), { shouldValidate: true })
      }
    }
  }, [
    form,
    needsProjectConversion,
    watchAmount,
    watchConvertedAmount,
    watchExchangeRate,
  ])

  const projectRelatedCurrencyCodes = useMemo(
    () =>
      Array.from(new Set(alternativeCurrencyCodes ?? [])).filter(
        (code) => code !== projectCurrency
      ),
    [alternativeCurrencyCodes, projectCurrency]
  )

  const requiresAlternativeConversions = projectRelatedCurrencyCodes.length > 0

  const selectableCurrencyCodes = useMemo(() => {
    const selectedCodes = watchCurrencyExchanges
      .map((item) => item.currencyCode)
      .filter((code): code is string => Boolean(code))

    return Array.from(new Set([...projectRelatedCurrencyCodes, ...selectedCodes]))
  }, [projectRelatedCurrencyCodes, watchCurrencyExchanges])

  useEffect(() => {
    if (!requiresAlternativeConversions) return

    const currentValues =
      (form.getValues("currencyExchanges") as
        | Array<{
            currencyCode?: string
            exchangeRate?: string
            convertedAmount?: string
          }>
        | undefined) ?? []

    const nextValues = projectRelatedCurrencyCodes.map((currencyCode) => {
      const existing = currentValues.find((item) => item.currencyCode === currencyCode)
      return {
        currencyCode,
        exchangeRate: existing?.exchangeRate ?? "",
        convertedAmount: existing?.convertedAmount ?? "",
      }
    })

    const hasChanges =
      currentValues.length !== nextValues.length ||
      currentValues.some(
        (item, index) =>
          item.currencyCode !== nextValues[index]?.currencyCode ||
          String(item.exchangeRate ?? "") !== String(nextValues[index]?.exchangeRate ?? "") ||
          String(item.convertedAmount ?? "") !==
            String(nextValues[index]?.convertedAmount ?? "")
      )

    if (hasChanges) {
      replace(nextValues)
    }
  }, [form, projectRelatedCurrencyCodes, replace, requiresAlternativeConversions])

  async function handleAutoRate(index: number, targetCurrency: string) {
    if (!targetCurrency) {
      toast.warning(t("incomes.selectAltCurrencyFirst"))
      return
    }

    if (!Number.isFinite(projectAmount) || projectAmount <= 0) {
      toast.warning(t("incomes.enterValidAmountForConversion"))
      return
    }

    setAutoRateLoading((prev) => ({ ...prev, [index]: true }))
    try {
      const response = await getExchangeRate({
        from: projectCurrency,
        to: targetCurrency,
        amount: projectAmount,
      })

      form.setValue(`currencyExchanges.${index}.exchangeRate`, String(response.rate), {
        shouldValidate: true,
      })
      form.setValue(
        `currencyExchanges.${index}.convertedAmount`,
        String(response.convertedAmount),
        { shouldValidate: true }
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("incomes.noRateError")
      toast.error(t("incomes.rateErrorTitle"), { description: msg })
    } finally {
      setAutoRateLoading((prev) => ({ ...prev, [index]: false }))
    }
  }

  async function handleAutoProjectConversion() {
    if (!needsProjectConversion) return

    const amount = Number(watchAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.warning(t("incomes.enterValidAmountBeforeConversion"))
      return
    }

    setAutoProjectRateLoading(true)
    try {
      const response = await getExchangeRate({
        from: watchCurrency,
        to: projectCurrency,
        amount,
      })
      form.setValue("exchangeRate", String(response.rate), { shouldValidate: true })
      form.setValue("convertedAmount", String(response.convertedAmount), {
        shouldValidate: true,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("incomes.noRateError")
      toast.error(t("incomes.rateErrorTitle"), { description: msg })
    } finally {
      setAutoProjectRateLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Campos obligatorios ─────────────────────────────────────── */}

      {/* Title */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("incomes.titleLabel")} {t("common.required")}</FormLabel>
            <FormControl>
              <Input
                autoFocus
                placeholder={showPlaceholders ? t("incomes.conceptPlaceholder") : undefined}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Amount + Currency */}
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="originalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.amount")} {t("common.required")}</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="originalCurrency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.currency")} {t("common.required")}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("expenses.selectPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencyOptions.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Date */}
      <FormField
        control={form.control}
        name="incomeDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("incomes.dateLabel")} {t("common.required")}</FormLabel>
            <FormControl>
              <DateInput {...field} max={today} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category + Payment Method (Cuenta destino) */}
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("expenses.categoryLabel")} {t("common.required")}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("expenses.selectPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentMethodId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("incomes.accountDestLabel")} {t("common.required")}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("expenses.selectPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {formatPaymentMethodLabel(pm)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPaymentMethod && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <Badge variant="outline" className="text-[10px] font-medium">
                    {selectedPaymentMethod.currency}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-medium text-sky-600 dark:text-sky-400 border-sky-500/40">
                    {{ bank: t("paymentMethods.typeBank"), cash: t("paymentMethods.typeCash"), card: t("paymentMethods.typeCard") }[selectedPaymentMethod.type]}
                  </Badge>
                  {selectedPaymentMethod.bankName && (
                    <Badge variant="outline" className="text-[10px] font-medium text-slate-600 dark:text-slate-400 border-slate-500/40">
                      {selectedPaymentMethod.bankName}
                    </Badge>
                  )}
                  {selectedPaymentMethod.partner && (
                    <Badge variant="outline" className="text-[10px] font-medium text-violet-600 dark:text-violet-400 border-violet-500/40">
                      {selectedPaymentMethod.partner.name}
                    </Badge>
                  )}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Contabilizar — arriba con los campos obligatorios */}
      <FormField
        control={form.control}
        name="isActive"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md border border-border p-3">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} />
            </FormControl>
            <div className="leading-none">
              <FormLabel className="cursor-pointer">{t("incomes.countabilizeLabel")}</FormLabel>
              <p className="text-xs text-muted-foreground mt-1">
                {t("incomes.countabilizeHint")}
              </p>
            </div>
          </FormItem>
        )}
      />

      {/* ── Conversiones de moneda (condicional) ────────────────────── */}
      {needsProjectConversion && (
        <ProjectCurrencyConversionSection
          form={form}
          needsProjectConversion={needsProjectConversion}
          watchCurrency={watchCurrency}
          projectCurrency={projectCurrency}
          watchAmount={watchAmount}
          autoProjectRateLoading={autoProjectRateLoading}
          onAutoProjectConversion={handleAutoProjectConversion}
          convertedAmountLabel={t("incomes.convertedAmountLabel", { currency: projectCurrency })}
          sameCurrencyMessage=""
        />
      )}

      {requiresManualAccountAmount && (
        <FormField
          control={form.control}
          name="accountAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("incomes.depositedAmountLabel", { currency: accountCurrency })} {t("common.required")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                {t("incomes.depositedAmountHint", { currency: accountCurrency, incomeCurrency: normalizedOriginalCurrency })}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {requiresAlternativeConversions && (
        <AlternativeCurrencyExchangesSection
          form={form}
          fields={fields}
          watchCurrencyExchanges={watchCurrencyExchanges}
          requiresAlternativeConversions={requiresAlternativeConversions}
          selectableCurrencyCodes={selectableCurrencyCodes}
          projectCurrency={projectCurrency}
          projectAmount={projectAmount}
          autoRateLoading={autoRateLoading}
          onAutoRate={handleAutoRate}
          onRemoveExchange={remove}
        />
      )}

      {/* ── Acordeones ──────────────────────────────────────────────── */}
      <Accordion type="multiple" className="rounded-md border border-border">
        {/* Campos opcionales */}
        <AccordionItem value="optional" className="px-3">
          <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:no-underline hover:text-foreground">
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-3.5" />
              {t("expenses.optionalFieldsSection")}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4 pb-1">
              <FormField
                control={form.control}
                name="receiptNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("incomes.receiptLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={showPlaceholders ? "REC-001" : undefined} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.description")}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.notes")}</FormLabel>
                    <FormControl>
                      <Textarea rows={2} className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* División entre partners */}
        <AccordionItem value="splits" className="px-3">
          <AccordionTrigger
            disabled={!partnersEnabled}
            className="text-sm font-medium text-muted-foreground hover:no-underline hover:text-foreground disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <GitBranch className="size-3.5" />
              {t("incomes.splitSection")}
              {!partnersEnabled && (
                <span className="text-[10px] font-normal text-muted-foreground/60">{t("incomes.splitDisabled")}</span>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pb-1">
              <SplitSection
                form={form}
                assignedPartners={assignedPartners}
                partnersEnabled={partnersEnabled}
                watchConvertedAmount={projectAmount > 0 ? String(projectAmount) : ""}
                projectCurrency={projectCurrency}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
