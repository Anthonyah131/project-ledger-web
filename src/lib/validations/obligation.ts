import { z } from "zod"
import { isIsoDateString } from "@/lib/date-utils"

type TFn = (key: string, params?: Record<string, string | number>) => string

// Monetary amount: 0.01 – 999,999,999,999.99
function requiredPositiveNumeric(t: TFn) {
  return z
    .string()
    .min(1, t("common.validation.required"))
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0.01 && Number(v) <= 999_999_999_999.99,
      { message: t("common.validation.amountRange") },
    )
}

function optionalIsoDateString(t: TFn) {
  return z.string().refine(
    (value) => value.length === 0 || isIsoDateString(value),
    { message: t("common.validation.invalidDate") },
  )
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function createObligationSchema(t: TFn) {
  return z.object({
    title: z.string().trim().min(1, t("common.validation.titleRequired")),
    totalAmount: requiredPositiveNumeric(t),
    currency: z.string().min(1, t("common.validation.currencyRequired")),
    dueDate: optionalIsoDateString(t),
    description: z.string().trim(),
  })
}

export type CreateObligationFormValues = z.infer<ReturnType<typeof createObligationSchema>>

// ─── Update ───────────────────────────────────────────────────────────────────

export function updateObligationSchema(t: TFn) {
  return z.object({
    title: z.string().trim().min(1, t("common.validation.titleRequired")),
    totalAmount: requiredPositiveNumeric(t),
    dueDate: optionalIsoDateString(t),
    description: z.string().trim(),
  })
}

export type UpdateObligationFormValues = z.infer<ReturnType<typeof updateObligationSchema>>
