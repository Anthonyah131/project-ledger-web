"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  editAdminUserSchema,
  type EditAdminUserFormValues,
} from "@/lib/validations/admin-user"
import type { AdminUserResponse, UpdateAdminUserRequest } from "@/types/admin-user"

// ─── Edit admin user form ───────────────────────────────────────────────────

interface UseEditAdminUserFormOptions {
  user: AdminUserResponse | null
  onSave: (id: string, data: UpdateAdminUserRequest) => void
  onClose: () => void
}

export function useEditAdminUserForm({ user, onSave, onClose }: UseEditAdminUserFormOptions) {
  const form = useForm<EditAdminUserFormValues>({
    resolver: zodResolver(editAdminUserSchema),
    values: user
      ? {
          fullName: user.fullName,
          avatarUrl: user.avatarUrl ?? "",
          // plan.id is the authoritative source; planId (top-level) may not be
          // returned by all admin endpoints depending on API version.
          planId: user.plan?.id ?? user.planId ?? "",
          isAdmin: user.isAdmin,
        }
      : undefined,
  })

  function onSubmit(values: EditAdminUserFormValues) {
    if (!user) return
    const payload: UpdateAdminUserRequest = {
      fullName: values.fullName,
    }
    if (values.avatarUrl) payload.avatarUrl = values.avatarUrl
    if (values.planId) payload.planId = values.planId
    if (values.isAdmin !== undefined) payload.isAdmin = values.isAdmin
    onSave(user.id, payload)
    handleClose()
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), handleClose }
}
