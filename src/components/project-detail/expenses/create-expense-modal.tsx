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
import { FormModal } from "@/components/shared/form-modal"
import { ExpenseFormFields } from "./expense-form-fields"
import type { CreateExpenseRequest } from "@/types/expense"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { ObligationResponse } from "@/types/obligation"
import { useCreateExpenseForm } from "@/hooks/forms/use-expense-form"

interface CreateExpenseModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateExpenseRequest) => void
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  obligations: ObligationResponse[]
  projectCurrency: string
}

export function CreateExpenseModal({
  open,
  onClose,
  onCreate,
  categories,
  paymentMethods,
  obligations,
  projectCurrency,
}: CreateExpenseModalProps) {
  const {
    form,
    onSubmit,
    handleClose,
    watchCurrency,
    watchAmount,
    watchExchangeRate,
    watchAltCurrency,
  } = useCreateExpenseForm({ onCreate, onClose, categories, paymentMethods })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Nuevo gasto"
      description="Registra un nuevo gasto en el proyecto."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Crear gasto"
      contentClassName="sm:max-w-md max-h-[85vh] overflow-y-auto"
    >
      <ExpenseFormFields
        form={form}
        categories={categories}
        paymentMethods={paymentMethods}
        projectCurrency={projectCurrency}
        watchCurrency={watchCurrency}
        watchAmount={watchAmount}
        watchExchangeRate={watchExchangeRate}
        watchAltCurrency={watchAltCurrency}
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
    </FormModal>
  )
}
