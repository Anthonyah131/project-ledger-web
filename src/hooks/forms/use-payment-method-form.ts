"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLanguage } from "@/context/language-context"
import {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
  type CreatePaymentMethodFormValues,
  type UpdatePaymentMethodFormValues,
} from "@/lib/validations/payment-method"
import type {
  PaymentMethodResponse,
  CreatePaymentMethodRequest,
  UpdatePaymentMethodRequest,
} from "@/types/payment-method"

// ─── Create ───────────────────────────────────────────────────────────────────

interface UseCreatePaymentMethodFormOptions {
  onCreate: (data: CreatePaymentMethodRequest) => void
  onClose: () => void
}

export function useCreatePaymentMethodForm({ onCreate, onClose }: UseCreatePaymentMethodFormOptions) {
  const { t } = useLanguage()
  const form = useForm<CreatePaymentMethodFormValues>({
    resolver: zodResolver(createPaymentMethodSchema(t)),
    defaultValues: {
      name: "",
      type: "bank",
      currency: "USD",
      bankName: "",
      accountNumber: "",
      description: "",
    },
  })

  const watchType = useWatch({ control: form.control, name: "type" })

  function onSubmit(values: CreatePaymentMethodFormValues) {
    const payload: CreatePaymentMethodRequest = {
      name: values.name,
      type: values.type,
      currency: values.currency,
    }
    if (values.bankName) payload.bankName = values.bankName
    if (values.accountNumber) payload.accountNumber = values.accountNumber
    if (values.description) payload.description = values.description
    onCreate(payload)
    handleClose()
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), handleClose, watchType }
}

// ─── Update ───────────────────────────────────────────────────────────────────

interface UseUpdatePaymentMethodFormOptions {
  paymentMethod: PaymentMethodResponse | null
  onSave: (id: string, data: UpdatePaymentMethodRequest) => void
  onClose: () => void
}

export function useUpdatePaymentMethodForm({ paymentMethod, onSave, onClose }: UseUpdatePaymentMethodFormOptions) {
  const { t } = useLanguage()
  const form = useForm<UpdatePaymentMethodFormValues>({
    resolver: zodResolver(updatePaymentMethodSchema(t)),
    values: paymentMethod
      ? {
          name: paymentMethod.name,
          type: paymentMethod.type,
          bankName: paymentMethod.bankName ?? "",
          accountNumber: paymentMethod.accountNumber ?? "",
          description: paymentMethod.description ?? "",
        }
      : undefined,
  })

  const watchType = useWatch({ control: form.control, name: "type" })

  function onSubmit(values: UpdatePaymentMethodFormValues) {
    if (!paymentMethod) return
    const payload: UpdatePaymentMethodRequest = {
      name: values.name,
      type: values.type,
    }
    if (values.bankName) payload.bankName = values.bankName
    if (values.accountNumber) payload.accountNumber = values.accountNumber
    if (values.description) payload.description = values.description
    onSave(paymentMethod.id, payload)
    handleClose()
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), handleClose, watchType }
}
