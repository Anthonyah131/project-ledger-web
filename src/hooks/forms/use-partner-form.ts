"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLanguage } from "@/context/language-context"
import {
  createPartnerSchema,
  updatePartnerSchema,
  type CreatePartnerFormValues,
  type UpdatePartnerFormValues,
} from "@/lib/validations/partner"
import type {
  PartnerResponse,
  CreatePartnerRequest,
  UpdatePartnerRequest,
} from "@/types/partner"

// ─── Create ───────────────────────────────────────────────────────────────────

interface UseCreatePartnerFormOptions {
  onCreate: (data: CreatePartnerRequest) => void
  onClose: () => void
}

export function useCreatePartnerForm({ onCreate, onClose }: UseCreatePartnerFormOptions) {
  const { t } = useLanguage()
  const form = useForm<CreatePartnerFormValues>({
    resolver: zodResolver(createPartnerSchema(t)),
    defaultValues: { name: "", email: "", phone: "", notes: "" },
  })

  function onSubmit(values: CreatePartnerFormValues) {
    const payload: CreatePartnerRequest = { name: values.name }
    if (values.email) payload.email = values.email
    if (values.phone) payload.phone = values.phone
    if (values.notes) payload.notes = values.notes
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

interface UseUpdatePartnerFormOptions {
  partner: PartnerResponse | null
  onSave: (id: string, data: UpdatePartnerRequest) => void
  onClose: () => void
}

export function useUpdatePartnerForm({ partner, onSave, onClose }: UseUpdatePartnerFormOptions) {
  const { t } = useLanguage()
  const form = useForm<UpdatePartnerFormValues>({
    resolver: zodResolver(updatePartnerSchema(t)),
    values: partner
      ? {
          name: partner.name,
          email: partner.email ?? "",
          phone: partner.phone ?? "",
          notes: partner.notes ?? "",
        }
      : undefined,
  })

  function onSubmit(values: UpdatePartnerFormValues) {
    if (!partner) return
    const payload: UpdatePartnerRequest = { name: values.name }
    if (values.email) payload.email = values.email
    if (values.phone) payload.phone = values.phone
    if (values.notes) payload.notes = values.notes
    onSave(partner.id, payload)
    handleClose()
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), handleClose }
}
