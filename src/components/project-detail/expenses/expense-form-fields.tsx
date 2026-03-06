"use client"

import { useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"
import { useWatch } from "react-hook-form"
import { Input } from "@/components/ui/input"
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
import { ISO_CURRENCIES } from "@/types/project"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"

interface ExpenseFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  projectCurrency: string
  watchCurrency: string
  watchAmount: string
  watchExchangeRate: string
  watchAltCurrency: string
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
  watchAltCurrency,
  showPlaceholders = false,
}: ExpenseFormFieldsProps) {
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
              <Input type="date" {...field} />
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

      {/* Exchange Rate */}
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

      {/* Alt-currency section */}
      <div className="rounded-lg border border-dashed border-border px-3 pt-2 pb-3 flex flex-col gap-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Moneda alternativa (opcional)
        </p>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="altCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda</FormLabel>
                <Select
                  value={field.value || "none"}
                  onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Ninguna" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Ninguna</SelectItem>
                    {ISO_CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {watchAltCurrency && (
            <FormField
              control={form.control}
              name="altExchangeRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tasa ({projectCurrency} {"→"} {watchAltCurrency})
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      min="0"
                      placeholder="0.0000"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value)
                        const rate = Number(e.target.value)
                        const converted = Number(watchAmount) * Number(watchExchangeRate)
                        if (rate > 0 && converted > 0) {
                          form.setValue("altAmount", (converted * rate).toFixed(2))
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        {watchAltCurrency && (
          <FormField
            control={form.control}
            name="altAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto {watchAltCurrency}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </>
  )
}
