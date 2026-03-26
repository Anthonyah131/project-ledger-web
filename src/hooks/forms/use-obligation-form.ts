"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLanguage } from "@/context/language-context"
import {
  createObligationSchema,
  updateObligationSchema,
  type CreateObligationFormValues,
  type UpdateObligationFormValues,
} from "@/lib/validations/obligation"
import type {
  ObligationResponse,
  CreateObligationRequest,
  UpdateObligationRequest,
} from "@/types/obligation"

// ─── Create ───────────────────────────────────────────────────────────────────

interface UseCreateObligationFormOptions {
  onCreate: (data: CreateObligationRequest) => void
  onClose: () => void
}

export function useCreateObligationForm({ onCreate, onClose }: UseCreateObligationFormOptions) {
  const { t } = useLanguage()
  const form = useForm<CreateObligationFormValues>({
    resolver: zodResolver(createObligationSchema(t)),
    defaultValues: {
      title: "",
      totalAmount: "",
      currency: "CRC",
      dueDate: "",
      description: "",
    },
  })

  function onSubmit(values: CreateObligationFormValues) {
    const payload: CreateObligationRequest = {
      title: values.title,
      totalAmount: Number(values.totalAmount),
      currency: values.currency,
    }
    if (values.dueDate) payload.dueDate = values.dueDate
    if (values.description) payload.description = values.description
    onCreate(payload)
    handleClose()
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), handleClose }
}

// ─── Update ───────────────────────────────────────────────────────────────────

interface UseUpdateObligationFormOptions {
  obligation: ObligationResponse | null
  onSave: (id: string, data: UpdateObligationRequest) => void
  onClose: () => void
}

export function useUpdateObligationForm({ obligation, onSave, onClose }: UseUpdateObligationFormOptions) {
  const { t } = useLanguage()
  const form = useForm<UpdateObligationFormValues>({
    resolver: zodResolver(updateObligationSchema(t)),
    values: obligation
      ? {
          title: obligation.title,
          totalAmount: String(obligation.totalAmount),
          dueDate: obligation.dueDate ?? "",
          description: obligation.description ?? "",
        }
      : undefined,
  })

  function onSubmit(values: UpdateObligationFormValues) {
    if (!obligation) return
    const payload: UpdateObligationRequest = {
      title: values.title,
      totalAmount: Number(values.totalAmount),
    }
    payload.dueDate = values.dueDate || null
    if (values.description) payload.description = values.description
    onSave(obligation.id, payload)
    handleClose()
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), handleClose }
}
