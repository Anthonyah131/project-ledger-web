"use client"

import { FormModal } from "@/components/shared/form-modal"
import { IncomeFormFields } from "./income-form-fields"
import type { CreateIncomeRequest } from "@/types/income"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"
import { useCreateIncomeForm } from "@/hooks/forms/use-income-form"

interface CreateIncomeModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateIncomeRequest) => void
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  projectCurrency: string
  alternativeCurrencyCodes?: string[]
}

export function CreateIncomeModal({
  open,
  onClose,
  onCreate,
  categories,
  paymentMethods,
  projectCurrency,
  alternativeCurrencyCodes,
}: CreateIncomeModalProps) {
  const { form, onSubmit, handleClose, watchCurrency, watchAmount, watchExchangeRate } =
    useCreateIncomeForm({ onCreate, onClose, categories, paymentMethods })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Nuevo ingreso"
      description="Registra un nuevo ingreso en el proyecto."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Crear ingreso"
      contentClassName="sm:max-w-2xl max-h-[88vh] overflow-y-auto"
    >
      <IncomeFormFields
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
    </FormModal>
  )
}
