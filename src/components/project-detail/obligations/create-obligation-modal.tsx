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
  const { form, onSubmit, handleClose } = useCreateObligationForm({ onCreate, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Nueva obligacion"
      description="Registra una nueva obligacion financiera."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Crear obligacion"
      contentClassName="sm:max-w-sm"
    >
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Titulo *</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Prestamo oficina" autoFocus {...field} />
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
              <FormLabel>Monto total *</FormLabel>
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
              <FormLabel>Moneda *</FormLabel>
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
