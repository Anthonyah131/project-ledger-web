import { z } from "zod"

const paymentMethodTypes = ["bank", "cash", "card"] as const

// ─── Create ───────────────────────────────────────────────────────────────────

export const createPaymentMethodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nombre es requerido")
    .max(255, "Máx. 255 caracteres"),
  type: z.enum(paymentMethodTypes, { message: "Tipo es requerido" }),
  currency: z.string().min(1, "Moneda es requerida"),
  bankName: z.string().trim(),
  accountNumber: z.string().trim(),
  description: z.string().trim(),
})

export type CreatePaymentMethodFormValues = z.infer<typeof createPaymentMethodSchema>

// ─── Update ───────────────────────────────────────────────────────────────────

export const updatePaymentMethodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nombre es requerido")
    .max(255, "Máx. 255 caracteres"),
  type: z.enum(paymentMethodTypes, { message: "Tipo es requerido" }),
  bankName: z.string().trim(),
  accountNumber: z.string().trim(),
  description: z.string().trim(),
})

export type UpdatePaymentMethodFormValues = z.infer<typeof updatePaymentMethodSchema>
