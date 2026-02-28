import { z } from "zod"

// Helper: required positive numeric string
const requiredPositiveNumeric = z
  .string()
  .min(1, "Campo requerido")
  .refine(
    (v) => !isNaN(Number(v)) && Number(v) > 0,
    { message: "Debe ser mayor a 0" },
  )

// Helper: optional positive numeric string (may be empty)
const optionalNumericString = z
  .string()
  .refine(
    (v) => v === "" || (!isNaN(Number(v)) && Number(v) > 0),
    { message: "Debe ser un número positivo" },
  )

// ─── Create ───────────────────────────────────────────────────────────────────

export const createExpenseSchema = z.object({
  title: z.string().trim().min(1, "Título es requerido"),
  originalAmount: requiredPositiveNumeric,
  originalCurrency: z.string().min(1, "Moneda es requerida"),
  expenseDate: z.string().min(1, "Fecha es requerida"),
  categoryId: z.string().min(1, "Categoría es requerida"),
  paymentMethodId: z.string().min(1, "Método de pago es requerido"),
  exchangeRate: requiredPositiveNumeric,
  description: z.string().trim(),
  notes: z.string().trim(),
  obligationId: z.string(),
  altCurrency: z.string(),
  altExchangeRate: optionalNumericString,
  altAmount: optionalNumericString,
})

export type CreateExpenseFormValues = z.infer<typeof createExpenseSchema>

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateExpenseSchema = z.object({
  title: z.string().trim().min(1, "Título es requerido"),
  originalAmount: requiredPositiveNumeric,
  originalCurrency: z.string().min(1, "Moneda es requerida"),
  expenseDate: z.string().min(1, "Fecha es requerida"),
  categoryId: z.string().min(1, "Categoría es requerida"),
  paymentMethodId: z.string().min(1, "Método de pago es requerido"),
  exchangeRate: requiredPositiveNumeric,
  description: z.string().trim(),
  notes: z.string().trim(),
  altCurrency: z.string(),
  altExchangeRate: optionalNumericString,
  altAmount: optionalNumericString,
})

export type UpdateExpenseFormValues = z.infer<typeof updateExpenseSchema>
