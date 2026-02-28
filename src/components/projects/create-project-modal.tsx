"use client"

import { Input } from "@/components/ui/input"
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
import { ISO_CURRENCIES, type CreateProjectRequest } from "@/types/project"
import { useCreateProjectForm } from "@/hooks/forms/use-project-form"

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateProjectRequest) => void
}

export function CreateProjectModal({ open, onClose, onCreate }: CreateProjectModalProps) {
  const { form, onSubmit, handleClose } = useCreateProjectForm({ onCreate, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Nuevo proyecto"
      description="Crea un nuevo proyecto para gestionar sus gastos."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Crear proyecto"
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del proyecto</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Proyecto Construccion" autoFocus {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="currencyCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Moneda</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ISO_CURRENCIES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripcion (opcional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Breve descripcion del proyecto..."
                rows={3}
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormModal>
  )
}
