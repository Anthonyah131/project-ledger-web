import { z } from "zod"
import { isIsoDateString } from "@/lib/date-utils"

// Monetary amount: 0.01 – 999,999,999,999.99
const requiredPositiveNumeric = z
  .string()
  .min(1, "Campo requerido")
  .refine(
    (v) => !isNaN(Number(v)) && Number(v) >= 0.01 && Number(v) <= 999_999_999_999.99,
    { message: "Debe ser entre 0.01 y 999,999,999,999.99" },
  )

const optionalIsoDateString = z.string().refine(
  (value) => value.length === 0 || isIsoDateString(value),
  { message: "Fecha invalida" },
)

// ─── Create ───────────────────────────────────────────────────────────────────

export const createObligationSchema = z.object({
  title: z.string().trim().min(1, "Título es requerido"),
  totalAmount: requiredPositiveNumeric,
  currency: z.string().min(1, "Moneda es requerida"),
  dueDate: optionalIsoDateString,
  description: z.string().trim(),
})

export type CreateObligationFormValues = z.infer<typeof createObligationSchema>

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateObligationSchema = z.object({
  title: z.string().trim().min(1, "Título es requerido"),
  totalAmount: requiredPositiveNumeric,
  dueDate: optionalIsoDateString,
  description: z.string().trim(),
})

export type UpdateObligationFormValues = z.infer<typeof updateObligationSchema>
