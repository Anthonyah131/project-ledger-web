"use client"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FormModal } from "@/components/shared/form-modal"
import { ExpenseFormFields } from "./expense-form-fields"
import type { CreateExpenseRequest } from "@/types/expense"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { ObligationResponse } from "@/types/obligation"
import { useCreateExpenseForm } from "@/hooks/forms/use-expense-form"
import { useWatch } from "react-hook-form"
import { useEffect } from "react"

interface CreateExpenseModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateExpenseRequest) => void
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  obligations: ObligationResponse[]
  projectCurrency: string
  alternativeCurrencyCodes?: string[]
}

export function CreateExpenseModal({
  open,
  onClose,
  onCreate,
  categories,
  paymentMethods,
  obligations,
  projectCurrency,
  alternativeCurrencyCodes,
}: CreateExpenseModalProps) {
  const {
    form,
    onSubmit,
    handleClose,
    watchCurrency,
    watchAmount,
    watchExchangeRate,
  } = useCreateExpenseForm({ onCreate, onClose, categories, paymentMethods })

  const watchObligationId = useWatch({ control: form.control, name: "obligationId" })
  const selectedObligation = obligations.find((o) => o.id === watchObligationId)
  const showEquivalentAmount = !!selectedObligation && selectedObligation.currency !== watchCurrency

  function handleSubmitWithEquivalentGuard(e?: React.BaseSyntheticEvent) {
    if (showEquivalentAmount && !form.getValues("obligationEquivalentAmount")) {
      e?.preventDefault()
      form.setError("obligationEquivalentAmount", {
        type: "manual",
        message: `Campo requerido para pagos en ${selectedObligation!.currency}`,
      })
      return
    }
    onSubmit(e)
  }

  useEffect(() => {
    if (!showEquivalentAmount) {
      form.setValue("obligationEquivalentAmount", "")
    }
  }, [form, showEquivalentAmount])

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Nuevo gasto"
      description="Registra un nuevo gasto en el proyecto."
      form={form}
      onSubmit={handleSubmitWithEquivalentGuard}
      submitLabel="Crear gasto"
      contentClassName="sm:max-w-2xl max-h-[88vh] overflow-y-auto"
    >
      <ExpenseFormFields
        form={form}
        categories={categories}
        paymentMethods={paymentMethods}
        projectCurrency={projectCurrency}
        watchCurrency={watchCurrency}
        watchAmount={watchAmount}
        watchExchangeRate={watchExchangeRate}
        alternativeCurrencyCodes={alternativeCurrencyCodes}
        showPlaceholders
      />

      {obligations.length > 0 && (
        <FormField
          control={form.control}
          name="obligationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Obligacion (opcional)</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Ninguna" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Ninguna</SelectItem>
                  {obligations.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {showEquivalentAmount && (
        <FormField
          control={form.control}
          name="obligationEquivalentAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Equivalente en {selectedObligation!.currency}{" "}
                <span className="font-normal text-xs text-muted-foreground">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={`¿Cuánto ${selectedObligation!.currency} cubre este pago?`}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Saldo pendiente: {selectedObligation!.currency}{" "}
                {selectedObligation!.remainingAmount.toLocaleString()}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </FormModal>
  )
}
