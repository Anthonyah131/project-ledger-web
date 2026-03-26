"use client"

import { useEffect } from "react"
import { useWatch } from "react-hook-form"
import { FormModal } from "@/components/shared/form-modal"
import { useLanguage } from "@/context/language-context"
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
import { ExpenseFormFields } from "./expense-form-fields"
import type { ExpenseResponse, UpdateExpenseRequest } from "@/types/expense"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { ObligationResponse } from "@/types/obligation"
import type { ProjectPartnerResponse } from "@/types/project-partner"
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
  partnersEnabled?: boolean
  assignedPartners?: ProjectPartnerResponse[]
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
  partnersEnabled = false,
  assignedPartners = [],
}: EditExpenseModalProps) {
  const { t } = useLanguage()
  const {
    form,
    onSubmit,
    handleClose,
    watchCurrency,
    watchAmount,
    watchExchangeRate,
    watchConvertedAmount,
  } = useUpdateExpenseForm({ expense, onSave, onClose })

  const watchObligationId = useWatch({ control: form.control, name: "obligationId" })
  const selectedObligation = obligations.find((o) => o.id === watchObligationId)
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
        message: t("expenses.equivalentRequired", { currency: selectedObligation!.currency }),
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
      title={t("expenses.editTitle")}
      description={t("expenses.editDescription")}
      form={form}
      onSubmit={handleSubmitWithEquivalentGuard}
      submitLabel={t("common.save")}
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
        watchConvertedAmount={watchConvertedAmount}
        alternativeCurrencyCodes={alternativeCurrencyCodes}
        partnersEnabled={partnersEnabled}
        assignedPartners={assignedPartners}
      />

      {obligations.length > 0 && (
        <FormField
          control={form.control}
          name="obligationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("expenses.obligationLabel")} {t("common.optional")}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("expenses.obligationNone")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">{t("expenses.obligationNone")}</SelectItem>
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
                {t("expenses.equivalentLabel", { currency: selectedObligation!.currency })}{" "}
                <span className="font-normal text-xs text-muted-foreground">{t("common.optional")}</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t("expenses.equivalentHint", { currency: selectedObligation!.currency })}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                {t("expenses.pendingBalance")} {selectedObligation!.currency}{" "}
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
