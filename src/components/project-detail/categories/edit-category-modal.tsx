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
import type { CategoryResponse, UpdateCategoryRequest } from "@/types/category"
import { useUpdateCategoryForm } from "@/hooks/forms/use-category-form"

interface EditCategoryModalProps {
  category: CategoryResponse | null
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UpdateCategoryRequest) => void
}

export function EditCategoryModal({
  category,
  open,
  onClose,
  onSave,
}: EditCategoryModalProps) {
  const { t } = useLanguage()
  const { form, onSubmit, handleClose } = useUpdateCategoryForm({ category, onSave, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("categories.editTitle")}
      description={t("categories.editDescription")}
      form={form}
      onSubmit={onSubmit}
      submitLabel={t("common.save")}
      contentClassName="sm:max-w-sm"
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("common.name")} *</FormLabel>
            <FormControl>
              <Input autoFocus {...field} />
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
