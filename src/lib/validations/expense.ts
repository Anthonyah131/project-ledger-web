import { z } from "zod"
import { isDateAfterToday, isIsoDateString } from "@/lib/date-utils"

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

const requiredDateNotFuture = z
  .string()
  .min(1, "Fecha es requerida")
  .refine((value) => isIsoDateString(value), {
    message: "Fecha invalida",
  })
  .refine((value) => !isDateAfterToday(value), {
    message: "La fecha no puede ser mayor a hoy",
  })

const currencyExchangeSchema = z.object({
  currencyCode: z.string().trim().min(1, "Moneda es requerida"),
  exchangeRate: requiredPositiveNumeric,
  convertedAmount: requiredPositiveNumeric,
})

// ─── Create ───────────────────────────────────────────────────────────────────

export const createExpenseSchema = z.object({
  title: z.string().trim().min(1, "Título es requerido"),
  originalAmount: requiredPositiveNumeric,
  originalCurrency: z.string().min(1, "Moneda es requerida"),
  expenseDate: requiredDateNotFuture,
  categoryId: z.string().min(1, "Categoría es requerida"),
  paymentMethodId: z.string().min(1, "Método de pago es requerido"),
  exchangeRate: requiredPositiveNumeric,
  convertedAmount: optionalNumericString,
  description: z.string().trim(),
  receiptNumber: z.string().trim(),
  notes: z.string().trim(),
  isActive: z.boolean(),
  obligationId: z.string(),
  obligationEquivalentAmount: optionalNumericString,
  currencyExchanges: z.array(currencyExchangeSchema),
})

export type CreateExpenseFormValues = z.infer<typeof createExpenseSchema>

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateExpenseSchema = z.object({
  title: z.string().trim().min(1, "Título es requerido"),
  originalAmount: requiredPositiveNumeric,
  originalCurrency: z.string().min(1, "Moneda es requerida"),
  expenseDate: requiredDateNotFuture,
  categoryId: z.string().min(1, "Categoría es requerida"),
  paymentMethodId: z.string().min(1, "Método de pago es requerido"),
  obligationId: z.string(),
  exchangeRate: requiredPositiveNumeric,
  convertedAmount: optionalNumericString,
  description: z.string().trim(),
  receiptNumber: z.string().trim(),
  notes: z.string().trim(),
  isActive: z.boolean(),
  isTemplate: z.boolean().optional(),
  obligationEquivalentAmount: optionalNumericString,
  currencyExchanges: z.array(currencyExchangeSchema),
})

export type UpdateExpenseFormValues = z.infer<typeof updateExpenseSchema>
