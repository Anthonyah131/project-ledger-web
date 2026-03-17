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
import { useUpdatePartnerForm } from "@/hooks/forms/use-partner-form"
import type { PartnerResponse, UpdatePartnerRequest } from "@/types/partner"

interface EditPartnerModalProps {
  partner: PartnerResponse
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UpdatePartnerRequest) => void
}

export function EditPartnerModal({ partner, open, onClose, onSave }: EditPartnerModalProps) {
  const { form, onSubmit, handleClose } = useUpdatePartnerForm({ partner, onSave, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Editar partner"
      description="Actualiza los datos del contacto financiero."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Guardar"
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

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email
                <span className="text-muted-foreground ml-1">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Teléfono
                <span className="text-muted-foreground ml-1">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Notas
              <span className="text-muted-foreground ml-1">(opcional)</span>
            </FormLabel>
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
