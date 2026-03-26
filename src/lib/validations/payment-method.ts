import { z } from "zod"

type TFn = (key: string, params?: Record<string, string | number>) => string

const paymentMethodTypes = ["bank", "cash", "card"] as const

// ─── Create ───────────────────────────────────────────────────────────────────

export function createPaymentMethodSchema(t: TFn) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t("common.validation.nameRequired"))
      .max(255, t("common.validation.maxChars255")),
    type: z.enum(paymentMethodTypes, { message: t("common.validation.typeRequired") }),
    currency: z.string().min(1, t("common.validation.currencyRequired")),
    bankName: z.string().trim(),
    accountNumber: z.string().trim(),
    description: z.string().trim(),
  })
}

export type CreatePaymentMethodFormValues = z.infer<ReturnType<typeof createPaymentMethodSchema>>

// ─── Update ───────────────────────────────────────────────────────────────────

export function updatePaymentMethodSchema(t: TFn) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t("common.validation.nameRequired"))
      .max(255, t("common.validation.maxChars255")),
    type: z.enum(paymentMethodTypes, { message: t("common.validation.typeRequired") }),
    bankName: z.string().trim(),
    accountNumber: z.string().trim(),
    description: z.string().trim(),
  })
}

export type UpdatePaymentMethodFormValues = z.infer<ReturnType<typeof updatePaymentMethodSchema>>
