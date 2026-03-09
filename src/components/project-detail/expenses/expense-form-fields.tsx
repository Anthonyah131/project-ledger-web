"use client"

import { useEffect, useMemo, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { useFieldArray, useWatch } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
import { Textarea } from "@/components/ui/textarea"
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
import { toast } from "sonner"
import { ProjectCurrencyConversionSection } from "@/components/project-detail/shared/currency-conversion/project-currency-conversion-section"
import { AlternativeCurrencyExchangesSection } from "@/components/project-detail/shared/currency-conversion/alternative-currency-conversions-section"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"
import { getExchangeRate } from "@/services/exchange-rate-service"
import { getTodayIsoDate } from "@/lib/date-utils"

interface ExpenseFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  projectCurrency: string
  watchCurrency: string
  watchAmount: string
  watchExchangeRate: string
  watchConvertedAmount: string
  alternativeCurrencyCodes?: string[]
  /** Whether to show placeholders (used in Create mode). */
  showPlaceholders?: boolean
}

export function ExpenseFormFields({
  form,
  categories,
  paymentMethods,
  projectCurrency,
  watchCurrency,
  watchAmount,
  watchExchangeRate,
  watchConvertedAmount,
  alternativeCurrencyCodes,
  showPlaceholders = false,
}: ExpenseFormFieldsProps) {
  const today = getTodayIsoDate()

  // Enforce originalCurrency from the selected payment method.
  const watchPaymentMethodId = useWatch({ control: form.control, name: "paymentMethodId" })
  const selectedPaymentMethod = paymentMethods.find((p) => p.id === watchPaymentMethodId)

  useEffect(() => {
    if (
      selectedPaymentMethod?.currency &&
      form.getValues("originalCurrency") !== selectedPaymentMethod.currency
    ) {
      form.setValue("originalCurrency", selectedPaymentMethod.currency, {
        shouldValidate: true,
      })
    }
  }, [form, selectedPaymentMethod?.currency])

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
      toast.warning("Selecciona una moneda alternativa primero.")
      return
    }

    if (!Number.isFinite(projectAmount) || projectAmount <= 0) {
      toast.warning("Ingresa monto y tasa base validos para calcular conversion.")
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
      const msg = err instanceof Error ? err.message : "No se pudo obtener el tipo de cambio"
      toast.error("Error al obtener tipo de cambio", { description: msg })
    } finally {
      setAutoRateLoading((prev) => ({ ...prev, [index]: false }))
    }
  }

  async function handleAutoProjectConversion() {
    if (!needsProjectConversion) return

    const amount = Number(watchAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.warning("Ingresa un monto valido antes de calcular la conversion.")
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
      const msg = err instanceof Error ? err.message : "No se pudo obtener el tipo de cambio"
      toast.error("Error al obtener tipo de cambio", { description: msg })
    } finally {
      setAutoProjectRateLoading(false)
    }
  }

  return (
    <>
      {/* Title */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Titulo *</FormLabel>
            <FormControl>
              <Input
                autoFocus
                placeholder={showPlaceholders ? "Ej: Almuerzo equipo" : undefined}
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
              <FormLabel>Monto *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={showPlaceholders ? "0.00" : undefined}
                  {...field}
                />
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
              <FormLabel>Moneda *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  readOnly
                  className="bg-muted/40"
                  placeholder="Selecciona un metodo"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Se define automaticamente por el metodo de pago seleccionado.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Date */}
      <FormField
        control={form.control}
        name="expenseDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha del gasto *</FormLabel>
            <FormControl>
              <DateInput {...field} max={today} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category + Payment Method */}
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar" />
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
              <FormLabel>Metodo de pago *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <ProjectCurrencyConversionSection
        form={form}
        needsProjectConversion={needsProjectConversion}
        watchCurrency={watchCurrency}
        projectCurrency={projectCurrency}
        watchAmount={watchAmount}
        autoProjectRateLoading={autoProjectRateLoading}
        onAutoProjectConversion={handleAutoProjectConversion}
        convertedAmountLabel={`Monto final en ${projectCurrency}`}
        sameCurrencyMessage="Moneda de origen y moneda del proyecto son iguales. La conversion base se asume 1:1."
      />

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripcion</FormLabel>
            <FormControl>
              <Textarea rows={2} className="resize-none" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Receipt number */}
      <FormField
        control={form.control}
        name="receiptNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>No. de recibo / factura</FormLabel>
            <FormControl>
              <Input
                placeholder={showPlaceholders ? "Ej: A-15422" : undefined}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Notes */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notas</FormLabel>
            <FormControl>
              <Textarea rows={2} className="resize-none" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
    </>
  )
}
