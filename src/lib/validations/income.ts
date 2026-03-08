import { z } from "zod"

const requiredPositiveNumeric = z
  .string()
  .min(1, "Campo requerido")
  .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
    message: "Debe ser mayor a 0",
  })

const optionalPositiveNumeric = z.string().refine(
  (v) => v === "" || (!isNaN(Number(v)) && Number(v) > 0),
  { message: "Debe ser un número positivo" }
)

const currencyExchangeSchema = z.object({
  currencyCode: z.string().trim().min(1, "Moneda es requerida"),
  exchangeRate: requiredPositiveNumeric,
  convertedAmount: requiredPositiveNumeric,
})

export const createIncomeSchema = z.object({
  title: z.string().trim().min(1, "Título es requerido"),
  originalAmount: requiredPositiveNumeric,
  originalCurrency: z.string().min(1, "Moneda es requerida"),
  incomeDate: z.string().min(1, "Fecha es requerida"),
  categoryId: z.string().min(1, "Categoría es requerida"),
  paymentMethodId: z.string().min(1, "Método de pago es requerido"),
  exchangeRate: requiredPositiveNumeric,
  description: z.string().trim(),
  notes: z.string().trim(),
  receiptNumber: z.string().trim(),
  currencyExchanges: z.array(currencyExchangeSchema),
  // Kept for future compatibility if backend makes convertedAmount editable.
  convertedAmount: optionalPositiveNumeric,
})

export type CreateIncomeFormValues = z.infer<typeof createIncomeSchema>

export const updateIncomeSchema = z.object({
  title: z.string().trim().min(1, "Título es requerido"),
  originalAmount: requiredPositiveNumeric,
  originalCurrency: z.string().min(1, "Moneda es requerida"),
  incomeDate: z.string().min(1, "Fecha es requerida"),
  categoryId: z.string().min(1, "Categoría es requerida"),
  paymentMethodId: z.string().min(1, "Método de pago es requerido"),
  exchangeRate: requiredPositiveNumeric,
  description: z.string().trim(),
  notes: z.string().trim(),
  receiptNumber: z.string().trim(),
  currencyExchanges: z.array(currencyExchangeSchema),
  convertedAmount: optionalPositiveNumeric,
})

export type UpdateIncomeFormValues = z.infer<typeof updateIncomeSchema>
