"use client"

import type { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Loader2 } from "lucide-react"

interface ProjectCurrencyConversionSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  needsProjectConversion: boolean
  watchCurrency: string
  projectCurrency: string
  watchAmount: string
  autoProjectRateLoading: boolean
  onAutoProjectConversion: () => void
  convertedAmountLabel: string
  sameCurrencyMessage: string
  sameCurrencyMessageVariant?: "inline" | "card"
  showConvertedAmountWhenSameCurrency?: boolean
  readOnlyWhenNoConversion?: boolean
}

export function ProjectCurrencyConversionSection({
  form,
  needsProjectConversion,
  watchCurrency,
  projectCurrency,
  watchAmount,
  autoProjectRateLoading,
  onAutoProjectConversion,
  convertedAmountLabel,
  sameCurrencyMessage,
  sameCurrencyMessageVariant = "inline",
  showConvertedAmountWhenSameCurrency = false,
  readOnlyWhenNoConversion = false,
}: ProjectCurrencyConversionSectionProps) {
  if (!needsProjectConversion && !showConvertedAmountWhenSameCurrency) {
    return <p className="text-xs text-muted-foreground">{sameCurrencyMessage}</p>
  }

  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 flex flex-col gap-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Conversion a moneda del proyecto
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {needsProjectConversion ? (
          <FormField
            control={form.control}
            name="exchangeRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tasa ({watchCurrency} {"→"} {projectCurrency})
                </FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.0001"
                      min="0"
                      placeholder="0.0000"
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(event.target.value)
                        const rate = Number(event.target.value)
                        const amount = Number(watchAmount)
                        if (
                          Number.isFinite(rate) &&
                          rate > 0 &&
                          Number.isFinite(amount) &&
                          amount > 0
                        ) {
                          form.setValue("convertedAmount", (amount * rate).toFixed(2), {
                            shouldValidate: true,
                          })
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={autoProjectRateLoading}
                      onClick={onAutoProjectConversion}
                    >
                      {autoProjectRateLoading ? (
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
        ) : sameCurrencyMessageVariant === "card" ? (
          <div className="flex items-center rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
            {sameCurrencyMessage}
          </div>
        ) : null}

        {(needsProjectConversion || showConvertedAmountWhenSameCurrency) && (
          <FormField
            control={form.control}
            name="convertedAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{convertedAmountLabel}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    readOnly={!needsProjectConversion && readOnlyWhenNoConversion}
                    className={
                      !needsProjectConversion && readOnlyWhenNoConversion
                        ? "bg-muted/40"
                        : undefined
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  )
}
