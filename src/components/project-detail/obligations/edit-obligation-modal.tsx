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
  const { form, onSubmit, handleClose } = useUpdateObligationForm({ obligation, onSave, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Editar obligacion"
      description="Modifica los datos de esta obligacion."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Guardar cambios"
      contentClassName="sm:max-w-sm"
    >
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Titulo *</FormLabel>
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
            <FormLabel>Monto total *</FormLabel>
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
            <FormLabel>Fecha de vencimiento</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
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
    </FormModal>
  )
}
