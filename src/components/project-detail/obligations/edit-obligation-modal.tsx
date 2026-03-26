"use client"

import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
import { Textarea } from "@/components/ui/textarea"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FormModal } from "@/components/shared/form-modal"
import { useLanguage } from "@/context/language-context"
import type { ObligationResponse, UpdateObligationRequest } from "@/types/obligation"
import { useUpdateObligationForm } from "@/hooks/forms/use-obligation-form"

interface EditObligationModalProps {
  obligation: ObligationResponse | null
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UpdateObligationRequest) => void
}

export function EditObligationModal({
  obligation,
  open,
  onClose,
  onSave,
}: EditObligationModalProps) {
  const { t } = useLanguage()
  const { form, onSubmit, handleClose } = useUpdateObligationForm({ obligation, onSave, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("obligations.editTitle")}
      description={t("obligations.editDescription")}
      form={form}
      onSubmit={onSubmit}
      submitLabel={t("common.save")}
      contentClassName="sm:max-w-sm"
    >
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("obligations.titleLabel")} {t("common.required")}</FormLabel>
            <FormControl>
              <Input autoFocus {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="totalAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("obligations.totalAmountLabel")} {t("common.required")}</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" min="0" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dueDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("obligations.dueDateLabel")}</FormLabel>
            <FormControl>
              <DateInput {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("common.description")}</FormLabel>
            <FormControl>
              <Textarea rows={2} className="resize-none" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormModal>
  )
}
