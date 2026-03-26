"use client"

import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FormModal } from "@/components/shared/form-modal"
import { useLanguage } from "@/context/language-context"
import { useSetProjectBudgetForm } from "@/hooks/forms/use-project-budget-form"
import type {
  ProjectBudgetResponse,
  SetProjectBudgetRequest,
} from "@/types/project-budget"

interface SetProjectBudgetModalProps {
  open: boolean
  budget: ProjectBudgetResponse | null
  projectCurrency: string
  onClose: () => void
  onSave: (data: SetProjectBudgetRequest) => void
}

export function SetProjectBudgetModal({
  open,
  budget,
  projectCurrency,
  onClose,
  onSave,
}: SetProjectBudgetModalProps) {
  const { t } = useLanguage()
  const { form, onSubmit, handleClose } = useSetProjectBudgetForm({
    budget,
    onSave,
    onClose,
  })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={budget ? t("budget.editTitle") : t("budget.configTitle")}
      description={t("budget.subtitle")}
      form={form}
      onSubmit={onSubmit}
      submitLabel={budget ? t("common.save") : t("budget.saveNew")}
      contentClassName="sm:max-w-sm"
    >
      <FormField
        control={form.control}
        name="totalBudget"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("budget.totalAmountLabel", { currency: projectCurrency })} *</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" min="0" autoFocus {...field} />
            </FormControl>
            <p className="text-[11px] text-muted-foreground">
              {t("budget.totalAmountHint")}
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="alertPercentage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("budget.alertPercentLabel")} *</FormLabel>
            <FormControl>
              <Input type="number" min="1" max="100" step="1" {...field} />
            </FormControl>
            <p className="text-[11px] text-muted-foreground">
              {t("budget.alertPercentHint")}
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormModal>
  )
}
