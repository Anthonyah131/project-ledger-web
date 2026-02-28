"use client"

import { FormModal } from "@/components/shared/form-modal"
import { ExpenseFormFields } from "./expense-form-fields"
import type { ExpenseResponse, UpdateExpenseRequest } from "@/types/expense"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"
import { useUpdateExpenseForm } from "@/hooks/forms/use-expense-form"

interface EditExpenseModalProps {
  expense: ExpenseResponse | null
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UpdateExpenseRequest) => void
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  projectCurrency: string
}

export function EditExpenseModal({
  expense,
  open,
  onClose,
  onSave,
  categories,
  paymentMethods,
  projectCurrency,
}: EditExpenseModalProps) {
  const {
    form,
    onSubmit,
    handleClose,
    watchCurrency,
    watchAmount,
    watchExchangeRate,
    watchAltCurrency,
  } = useUpdateExpenseForm({ expense, onSave, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Editar gasto"
      description="Modifica los datos de este gasto."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Guardar cambios"
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
      />
    </FormModal>
  )
}
