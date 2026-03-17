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
import { useCreatePartnerForm } from "@/hooks/forms/use-partner-form"
import type { CreatePartnerRequest } from "@/types/partner"

interface CreatePartnerModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreatePartnerRequest) => void
}

export function CreatePartnerModal({ open, onClose, onCreate }: CreatePartnerModalProps) {
  const { form, onSubmit, handleClose } = useCreatePartnerForm({ onCreate, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Nuevo partner"
      description="Agrega un contacto financiero para asignar a proyectos."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Crear"
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre *</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Harold Vargas" autoFocus {...field} />
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
                <Input type="email" placeholder="harold@example.com" {...field} />
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
                <Input placeholder="+506 8888-1234" {...field} />
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
              <Textarea rows={2} className="resize-none" placeholder="Notas adicionales..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormModal>
  )
}
