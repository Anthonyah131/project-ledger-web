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
  onAdd: (data: AddMemberRequest) => Promise<boolean>
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

  async function onSubmit(values: AddMemberFormValues) {
    const wasAdded = await onAdd({ email: values.email, role: values.role })

    if (wasAdded) {
      handleClose()
    }
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), handleClose }
}
