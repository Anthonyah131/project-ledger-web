"use client"

import type { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
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
import { useLanguage } from "@/context/language-context"

interface AlternativeCurrencyExchangesSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  fields: Array<{ id: string }>
  watchCurrencyExchanges: Array<{ currencyCode?: string }>
  requiresAlternativeConversions: boolean
  selectableCurrencyCodes: string[]
  projectCurrency: string
  projectAmount: number
  autoRateLoading: Record<number, boolean>
  onAutoRate: (index: number, targetCurrency: string) => void | Promise<void>
  onRemoveExchange: (index: number) => void
}

export function AlternativeCurrencyExchangesSection({
  form,
  fields,
  watchCurrencyExchanges,
  requiresAlternativeConversions,
  selectableCurrencyCodes,
  projectCurrency,
  projectAmount,
  autoRateLoading,
  onAutoRate,
  onRemoveExchange,
}: AlternativeCurrencyExchangesSectionProps) {
  const { t } = useLanguage()

  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t("currencyConversion.altSection")}
        </p>
        <span className="rounded-full border border-border/80 bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {requiresAlternativeConversions ? t("currencyConversion.required") : t("currencyConversion.optional")}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        {requiresAlternativeConversions
          ? t("currencyConversion.requiredHint")
          : t("currencyConversion.optionalHint")}
      </p>

      <div className="flex flex-col gap-4">
        {fields.length === 0 && (
          <p className="text-xs text-muted-foreground">{t("currencyConversion.empty")}</p>
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
                  {t("currencyConversion.itemLabel", { index: index + 1 })}
                </p>
                {!requiresAlternativeConversions && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveExchange(index)}
                    aria-label={t("currencyConversion.removeAriaLabel")}
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
                      <FormLabel>{t("currencyConversion.currencyLabel")}</FormLabel>
                      {requiresAlternativeConversions ? (
                        <FormControl>
                          <Input value={currencyField.value || ""} readOnly className="bg-muted/40" />
                        </FormControl>
                      ) : (
                        <Select value={currencyField.value} onValueChange={currencyField.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("currencyConversion.currencyPlaceholder")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectableCurrencyCodes.map((currencyCode) => (
                              <SelectItem key={currencyCode} value={currencyCode}>
                                {currencyCode}
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
                        {t("currencyConversion.rateLabel", { from: projectCurrency, to: selectedCurrency || "?" })}
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.000001"
                            min="0"
                            placeholder="0.000000"
                            value={rateField.value}
                            onChange={(event) => {
                              rateField.onChange(event.target.value)
                              const rate = Number(event.target.value)
                              if (rate > 0 && projectAmount > 0) {
                                form.setValue(
                                  `currencyExchanges.${index}.convertedAmount`,
                                  (projectAmount * rate).toFixed(4),
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
                            onClick={() => onAutoRate(index, selectedCurrency)}
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
                      <FormLabel>{t("currencyConversion.amountLabel", { currency: selectedCurrency || "" })}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          min="0"
                          placeholder="0.0000"
                          value={amountField.value}
                          onChange={(event) => {
                            amountField.onChange(event.target.value)
                            const convertedAmt = Number(event.target.value)
                            if (convertedAmt > 0 && projectAmount > 0) {
                              form.setValue(
                                `currencyExchanges.${index}.exchangeRate`,
                                (convertedAmt / projectAmount).toFixed(6),
                                { shouldValidate: true }
                              )
                            }
                          }}
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
  )
}
