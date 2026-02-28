"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  addMemberSchema,
  type AddMemberFormValues,
} from "@/lib/validations/member"
import type { AddMemberRequest } from "@/types/project-member"

// ─── Add member ───────────────────────────────────────────────────────────────

interface UseAddMemberFormOptions {
  onAdd: (data: AddMemberRequest) => void
  onClose: () => void
}

export function useAddMemberForm({ onAdd, onClose }: UseAddMemberFormOptions) {
  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: "",
      role: "editor",
    },
  })

  function onSubmit(values: AddMemberFormValues) {
    onAdd({ email: values.email, role: values.role })
    handleClose()
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), handleClose }
}
