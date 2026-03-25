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
import { useLanguage } from "@/context/language-context"
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
  const { t } = useLanguage()
  const { form, onSubmit, handleClose } = useEditAdminUserForm({ user, onSave, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("admin.editModal.title")}
      description={t("admin.editModal.description")}
      form={form}
      onSubmit={onSubmit}
      submitLabel={t("common.save")}
    >
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("admin.editModal.fieldFullName")}</FormLabel>
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
            <FormLabel>{t("admin.editModal.fieldAvatarUrl")}</FormLabel>
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
            <FormLabel>{t("admin.editModal.fieldPlan")}</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("admin.editModal.planPlaceholder")} />
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
              <FormLabel className="cursor-pointer">{t("admin.editModal.fieldAdmin")}</FormLabel>
              <p className="text-xs text-muted-foreground mt-1">
                {t("admin.editModal.adminHint")}
              </p>
            </div>
          </FormItem>
        )}
      />
    </FormModal>
  )
}
