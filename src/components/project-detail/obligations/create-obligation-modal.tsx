"use client"

import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
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
import { FormModal } from "@/components/shared/form-modal"
import { useLanguage } from "@/context/language-context"
import { ISO_CURRENCIES } from "@/types/project"
import type { CreateObligationRequest } from "@/types/obligation"
import { useCreateObligationForm } from "@/hooks/forms/use-obligation-form"

interface CreateObligationModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateObligationRequest) => void
}

export function CreateObligationModal({
  open,
  onClose,
  onCreate,
}: CreateObligationModalProps) {
  const { t } = useLanguage()
  const { form, onSubmit, handleClose } = useCreateObligationForm({ onCreate, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("obligations.createTitle")}
      description={t("obligations.createSubtitle")}
      form={form}
      onSubmit={onSubmit}
      submitLabel={t("obligations.create")}
      contentClassName="sm:max-w-sm"
    >
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("obligations.titleLabel")} {t("common.required")}</FormLabel>
            <FormControl>
              <Input placeholder={t("obligations.titlePlaceholder")} autoFocus {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="totalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("obligations.totalAmountLabel")} {t("common.required")}</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.currency")} {t("common.required")}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
      </div>

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
