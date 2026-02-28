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
  const { form, onSubmit, handleClose } = useCreateCategoryForm({ onCreate, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Nueva categoria"
      description="Agrega una categoria al proyecto."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Crear categoria"
      contentClassName="sm:max-w-sm"
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre *</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Alimentacion" autoFocus {...field} />
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
