"use client"

import { Input } from "@/components/ui/input"
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
import type { CreateCategoryRequest } from "@/types/category"
import { useCreateCategoryForm } from "@/hooks/forms/use-category-form"

interface CreateCategoryModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateCategoryRequest) => void
}

export function CreateCategoryModal({
  open,
  onClose,
  onCreate,
}: CreateCategoryModalProps) {
  const { t } = useLanguage()
  const { form, onSubmit, handleClose } = useCreateCategoryForm({ onCreate, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("categories.createTitle")}
      description={t("categories.createSubtitle")}
      form={form}
      onSubmit={onSubmit}
      submitLabel={t("categories.create")}
      contentClassName="sm:max-w-sm"
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("common.name")} *</FormLabel>
            <FormControl>
              <Input placeholder={t("categories.namePlaceholder")} autoFocus {...field} />
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

      <FormField
        control={form.control}
        name="budgetAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("categories.budget")}</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" min="0" placeholder={t("common.noLimit")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormModal>
  )
}
