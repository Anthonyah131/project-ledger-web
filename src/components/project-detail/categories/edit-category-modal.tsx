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
  const { form, onSubmit, handleClose } = useUpdateCategoryForm({ category, onSave, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Editar categoria"
      description="Modifica los datos de esta categoria."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Guardar cambios"
      contentClassName="sm:max-w-sm"
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre *</FormLabel>
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
            <FormLabel>Descripcion</FormLabel>
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
            <FormLabel>Presupuesto</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" min="0" placeholder="Sin limite" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormModal>
  )
}
