"use client"

import { useEffect } from "react"
import { useWatch } from "react-hook-form"
import { FormModal } from "@/components/shared/form-modal"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ExpenseFormFields } from "./expense-form-fields"
import type { ExpenseResponse, UpdateExpenseRequest } from "@/types/expense"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { ObligationResponse } from "@/types/obligation"
import { useUpdateExpenseForm } from "@/hooks/forms/use-expense-form"

interface EditExpenseModalProps {
  expense: ExpenseResponse | null
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UpdateExpenseRequest) => void
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  obligations: ObligationResponse[]
  projectCurrency: string
  alternativeCurrencyCodes?: string[]
}

export function EditExpenseModal({
  expense,
  open,
  onClose,
  onSave,
  categories,
  paymentMethods,
  obligations,
  projectCurrency,
  alternativeCurrencyCodes,
}: EditExpenseModalProps) {
  const {
    form,
    onSubmit,
    handleClose,
    watchCurrency,
    watchAmount,
    watchExchangeRate,
  } = useUpdateExpenseForm({ expense, onSave, onClose })

  const selectedObligation = obligations.find((o) => o.id === expense?.obligationId)
  const showEquivalentAmount = !!selectedObligation && selectedObligation.currency !== watchCurrency
  const watchEquivalentAmount = useWatch({
    control: form.control,
    name: "obligationEquivalentAmount",
  })

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
    if (!showEquivalentAmount && watchEquivalentAmount) {
      form.setValue("obligationEquivalentAmount", "")
    }
  }, [form, showEquivalentAmount, watchEquivalentAmount])

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Editar gasto"
      description="Modifica los datos de este gasto."
      form={form}
      onSubmit={handleSubmitWithEquivalentGuard}
      submitLabel="Guardar cambios"
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
      />

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
