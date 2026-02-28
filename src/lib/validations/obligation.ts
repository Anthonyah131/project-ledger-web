import { z } from "zod"

// Helper: required positive numeric string
const requiredPositiveNumeric = z
  .string()
  .min(1, "Campo requerido")
  .refine(
    (v) => !isNaN(Number(v)) && Number(v) > 0,
    { message: "Debe ser mayor a 0" },
  )

// ─── Create ───────────────────────────────────────────────────────────────────

export const createObligationSchema = z.object({
  title: z.string().trim().min(1, "Título es requerido"),
  totalAmount: requiredPositiveNumeric,
  currency: z.string().min(1, "Moneda es requerida"),
  dueDate: z.string(),
  description: z.string().trim(),
})

export type CreateObligationFormValues = z.infer<typeof createObligationSchema>

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateObligationSchema = z.object({
  title: z.string().trim().min(1, "Título es requerido"),
  totalAmount: requiredPositiveNumeric,
  dueDate: z.string(),
  description: z.string().trim(),
})

export type UpdateObligationFormValues = z.infer<typeof updateObligationSchema>
