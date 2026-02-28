"use client"

import { Input } from "@/components/ui/input"
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
import { ROLE_LABEL } from "@/lib/constants"
import type { AddMemberRequest } from "@/types/project-member"
import { useAddMemberForm } from "@/hooks/forms/use-member-form"

interface AddMemberModalProps {
  open: boolean
  onClose: () => void
  onAdd: (data: AddMemberRequest) => void
}

export function AddMemberModal({ open, onClose, onAdd }: AddMemberModalProps) {
  const { form, onSubmit, handleClose } = useAddMemberForm({ onAdd, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Agregar miembro"
      description="Invita a un usuario registrado por su email."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Agregar miembro"
      contentClassName="sm:max-w-sm"
    >
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="usuario@ejemplo.com"
                autoFocus
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rol *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="editor">{ROLE_LABEL.editor}</SelectItem>
                <SelectItem value="viewer">{ROLE_LABEL.viewer}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormModal>
  )
}
