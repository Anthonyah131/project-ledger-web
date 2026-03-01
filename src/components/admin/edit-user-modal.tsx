"use client"

import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
import { useEditAdminUserForm } from "@/hooks/forms/use-admin-user-form"
import type { AdminUserResponse, AdminUserPlanDto, UpdateAdminUserRequest } from "@/types/admin-user"

interface EditUserModalProps {
  user: AdminUserResponse | null
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UpdateAdminUserRequest) => void
  /** Available plans to show in the dropdown */
  plans: AdminUserPlanDto[]
}

export function EditUserModal({ user, open, onClose, onSave, plans }: EditUserModalProps) {
  const { form, onSubmit, handleClose } = useEditAdminUserForm({ user, onSave, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Editar usuario"
      description="Modifica los datos del usuario."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Guardar cambios"
    >
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre completo</FormLabel>
            <FormControl>
              <Input autoFocus {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="avatarUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL del avatar</FormLabel>
            <FormControl>
              <Input placeholder="https://..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="planId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plan</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plan" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
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
        name="isAdmin"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-md border border-border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="leading-none">
              <FormLabel className="cursor-pointer">Administrador</FormLabel>
              <p className="text-xs text-muted-foreground mt-1">
                Otorga acceso completo al panel de administración.
              </p>
            </div>
          </FormItem>
        )}
      />
    </FormModal>
  )
}
