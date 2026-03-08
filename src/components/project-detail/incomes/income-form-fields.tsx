"use client"

import { useEffect, useMemo, useState } from "react"
import { useFieldArray, useWatch } from "react-hook-form"
import type { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
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
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"
import { getExchangeRate } from "@/services/exchange-rate-service"

interface IncomeFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  projectCurrency: string
  watchCurrency: string
  watchAmount: string
  watchExchangeRate: string
  alternativeCurrencyCodes?: string[]
  showPlaceholders?: boolean
}

export function IncomeFormFields({
  form,
  categories,
  paymentMethods,
  projectCurrency,
  watchCurrency,
  watchAmount,
  watchExchangeRate,
  alternativeCurrencyCodes,
  showPlaceholders = false,
}: IncomeFormFieldsProps) {
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

  const watchCurrencyExchanges =
    (useWatch({ control: form.control, name: "currencyExchanges" }) as
      | Array<{ currencyCode?: string }>
      | undefined) ?? []

  const projectAmount = Number(watchAmount) * Number(watchExchangeRate)
  const [autoRateLoading, setAutoRateLoading] = useState<Record<number, boolean>>({})

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

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Titulo *</FormLabel>
            <FormControl>
              <Input
                autoFocus
                placeholder={showPlaceholders ? "Ej: Pago cliente ACME" : undefined}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="originalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto *</FormLabel>
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

      <FormField
        control={form.control}
        name="incomeDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha del ingreso *</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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

      <FormField
        control={form.control}
        name="exchangeRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Tasa de cambio{" "}
              <span className="font-normal text-xs text-muted-foreground">
                ({watchCurrency} {"→"} {projectCurrency})
              </span>
            </FormLabel>
            <FormControl>
              <Input type="number" step="0.0001" min="0" {...field} />
            </FormControl>
            {watchAmount && Number(watchExchangeRate) > 0 && (
              <p className="text-xs text-muted-foreground">
                Monto en {projectCurrency}:{" "}
                <span className="font-medium text-foreground">
                  {(Number(watchAmount) * Number(watchExchangeRate)).toLocaleString("es", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="receiptNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Numero de recibo</FormLabel>
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
            <FormLabel>Descripcion</FormLabel>
            <FormControl>
              <Textarea rows={2} className="resize-none" {...field} />
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
            <FormLabel>Notas</FormLabel>
            <FormControl>
              <Textarea rows={2} className="resize-none" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="rounded-xl border border-border/70 bg-muted/20 p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Conversiones a monedas alternativas
          </p>
          <span className="rounded-full border border-border/80 bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {requiresAlternativeConversions ? "Obligatorio" : "Opcional"}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          {requiresAlternativeConversions
            ? "Debes completar una conversion por cada moneda alternativa configurada en el proyecto."
            : "No hay monedas alternativas vinculadas al proyecto. Configuralas en la pestaña Monedas para habilitar conversiones."}
        </p>

        <div className="flex flex-col gap-4">
          {fields.length === 0 && (
            <p className="text-xs text-muted-foreground">Sin conversiones configuradas.</p>
          )}

          {fields.map((field, index) => {
            const selectedCurrency = watchCurrencyExchanges[index]?.currencyCode ?? ""

            return (
              <div
                key={field.id}
                className="rounded-lg border border-border/70 bg-background p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    Conversion {index + 1}
                  </p>
                  {!requiresAlternativeConversions && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      aria-label="Eliminar conversion"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`currencyExchanges.${index}.currencyCode`}
                    render={({ field: currencyField }) => (
                      <FormItem>
                        <FormLabel>Moneda</FormLabel>
                        {requiresAlternativeConversions ? (
                          <FormControl>
                            <Input value={currencyField.value || ""} readOnly className="bg-muted/40" />
                          </FormControl>
                        ) : (
                          <Select value={currencyField.value} onValueChange={currencyField.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {selectableCurrencyCodes.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`currencyExchanges.${index}.exchangeRate`}
                    render={({ field: rateField }) => (
                      <FormItem>
                        <FormLabel>
                          Tasa ({projectCurrency} {"→"} {selectedCurrency || "?"})
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              step="0.0001"
                              min="0"
                              placeholder="0.0000"
                              value={rateField.value}
                              onChange={(e) => {
                                rateField.onChange(e.target.value)
                                const rate = Number(e.target.value)
                                if (rate > 0 && projectAmount > 0) {
                                  form.setValue(
                                    `currencyExchanges.${index}.convertedAmount`,
                                    (projectAmount * rate).toFixed(2),
                                    { shouldValidate: true }
                                  )
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={!!autoRateLoading[index]}
                              onClick={() => handleAutoRate(index, selectedCurrency)}
                            >
                              {autoRateLoading[index] ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                "Auto"
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`currencyExchanges.${index}.convertedAmount`}
                    render={({ field: amountField }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Monto {selectedCurrency || ""}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={amountField.value}
                            onChange={(e) => amountField.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
