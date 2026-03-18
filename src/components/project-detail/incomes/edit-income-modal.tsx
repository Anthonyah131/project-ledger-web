"use client"

import { FormModal } from "@/components/shared/form-modal"
import { IncomeFormFields } from "./income-form-fields"
import type { IncomeResponse, UpdateIncomeRequest } from "@/types/income"
import type { CategoryResponse } from "@/types/category"
import type { CurrencyResponse } from "@/types/currency"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { ProjectPartnerResponse } from "@/types/project-partner"
import { useUpdateIncomeForm } from "@/hooks/forms/use-income-form"

interface EditIncomeModalProps {
  income: IncomeResponse | null
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UpdateIncomeRequest) => void
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  availableCurrencies: CurrencyResponse[]
  projectCurrency: string
  alternativeCurrencyCodes?: string[]
  partnersEnabled?: boolean
  assignedPartners?: ProjectPartnerResponse[]
}

export function EditIncomeModal({
  income,
  open,
  onClose,
  onSave,
  categories,
  paymentMethods,
  availableCurrencies,
  projectCurrency,
  alternativeCurrencyCodes,
  partnersEnabled = false,
  assignedPartners = [],
}: EditIncomeModalProps) {
  const {
    form,
    onSubmit,
    handleClose,
    watchCurrency,
    watchAmount,
    watchExchangeRate,
    watchConvertedAmount,
  } =
    useUpdateIncomeForm({
      income,
      onSave,
      onClose,
      paymentMethods,
      projectCurrency,
    })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Editar ingreso"
      description="Modifica los datos de este ingreso."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Guardar cambios"
      contentClassName="sm:max-w-2xl max-h-[88vh] overflow-y-auto"
    >
      <IncomeFormFields
        form={form}
        categories={categories}
        paymentMethods={paymentMethods}
        availableCurrencies={availableCurrencies}
        projectCurrency={projectCurrency}
        watchCurrency={watchCurrency}
        watchAmount={watchAmount}
        watchExchangeRate={watchExchangeRate}
        watchConvertedAmount={watchConvertedAmount}
        alternativeCurrencyCodes={alternativeCurrencyCodes}
        partnersEnabled={partnersEnabled}
        assignedPartners={assignedPartners}
      />
    </FormModal>
  )
}
