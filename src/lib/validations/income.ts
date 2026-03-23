import { z } from "zod"
import { isDateAfterToday, isIsoDateString } from "@/lib/date-utils"

// Monetary amount: 0.01 – 999,999,999,999.99
const requiredPositiveNumeric = z
  .string()
  .min(1, "Campo requerido")
  .refine((v) => !isNaN(Number(v)) && Number(v) >= 0.01 && Number(v) <= 999_999_999_999.99, {
    message: "Debe ser entre 0.01 y 999,999,999,999.99",
  })

// Exchange rate: 0.000001 – 999,999,999,999.999999 (DECIMAL(18,6))
const requiredExchangeRate = z
  .string()
  .min(1, "Campo requerido")
  .refine(
    (v) => !isNaN(Number(v)) && Number(v) >= 0.000001 && Number(v) <= 999_999_999_999.999999,
    { message: "Debe ser entre 0.000001 y 999,999,999,999.999999" },
  )

const optionalPositiveNumeric = z.string().refine(
  (v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0.01 && Number(v) <= 999_999_999_999.99),
  { message: "Debe ser un número positivo" }
)

const optionalPositiveAccountNumeric = z.string().refine(
  (v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0.01 && Number(v) <= 999_999_999_999.99),
  { message: "Account amount must be between 0.01 and 999,999,999,999.99." }
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

// Currency exchange convertedAmount: 0.0001 – 99,999,999,999,999.9999 (DECIMAL(18,4))
const requiredCurrencyExchangeConvertedAmount = z
  .string()
  .min(1, "Campo requerido")
  .refine(
    (v) => !isNaN(Number(v)) && Number(v) >= 0.0001 && Number(v) <= 99_999_999_999_999.9999,
    { message: "Debe ser mayor a 0" },
  )

const currencyExchangeSchema = z.object({
  currencyCode: z.string().trim().min(1, "Moneda es requerida"),
  exchangeRate: requiredExchangeRate,
  convertedAmount: requiredCurrencyExchangeConvertedAmount,
})

const splitCurrencyExchangeFormSchema = z.object({
  currencyCode: z.string(),
  exchangeRate: z.string(),
  convertedAmount: z.string(),
})

// splitValue: 0.0001 – 9,999,999,999.9999 (DECIMAL(14,4) in DB)
const splitItemSchema = z.object({
  partnerId: z.string().min(1),
  partnerName: z.string(),
  splitValue: z
    .string()
    .refine(
      (v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0.0001 && Number(v) <= 9_999_999_999.9999),
      "Debe ser un número positivo",
    ),
  currencyExchanges: z.array(splitCurrencyExchangeFormSchema).optional(),
})

export const createIncomeSchema = z.object({
  title: z.string().trim().min(1, "Título es requerido"),
  originalAmount: requiredPositiveNumeric,
  originalCurrency: z.string().min(1, "Moneda es requerida"),
  incomeDate: requiredDateNotFuture,
  categoryId: z.string().min(1, "Categoría es requerida"),
  paymentMethodId: z.string().min(1, "Método de pago es requerido"),
  exchangeRate: requiredExchangeRate,
  description: z.string().trim(),
  notes: z.string().trim(),
  receiptNumber: z.string().trim(),
  isActive: z.boolean(),
  currencyExchanges: z.array(currencyExchangeSchema),
  // Kept for future compatibility if backend makes convertedAmount editable.
  convertedAmount: optionalPositiveNumeric,
  accountAmount: optionalPositiveAccountNumeric,
  splitType: z.enum(["percentage", "fixed"]).optional(),
  splits: z.array(splitItemSchema).optional(),
})

export type CreateIncomeFormValues = z.infer<typeof createIncomeSchema>

export const updateIncomeSchema = z.object({
  title: z.string().trim().min(1, "Título es requerido"),
  originalAmount: requiredPositiveNumeric,
  originalCurrency: z.string().min(1, "Moneda es requerida"),
  incomeDate: requiredDateNotFuture,
  categoryId: z.string().min(1, "Categoría es requerida"),
  paymentMethodId: z.string().min(1, "Método de pago es requerido"),
  exchangeRate: requiredExchangeRate,
  description: z.string().trim(),
  notes: z.string().trim(),
  receiptNumber: z.string().trim(),
  isActive: z.boolean(),
  currencyExchanges: z.array(currencyExchangeSchema),
  convertedAmount: optionalPositiveNumeric,
  accountAmount: optionalPositiveAccountNumeric,
  splitType: z.enum(["percentage", "fixed"]).optional(),
  splits: z.array(splitItemSchema).optional(),
})

export type UpdateIncomeFormValues = z.infer<typeof updateIncomeSchema>
