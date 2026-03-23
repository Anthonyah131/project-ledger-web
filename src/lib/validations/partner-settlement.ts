import { z } from "zod"
import { isDateAfterToday, isIsoDateString } from "@/lib/date-utils"

// Monetary amount: 0.01 – 999,999,999,999.99
const requiredPositiveNumeric = z
  .string()
  .min(1, "Campo requerido")
  .refine(
    (v) => !isNaN(Number(v)) && Number(v) >= 0.01 && Number(v) <= 999_999_999_999.99,
    { message: "Debe ser entre 0.01 y 999,999,999,999.99" },
  )

// Exchange rate: 0.000001 – 999,999,999,999.999999 (DECIMAL(18,6))
const requiredExchangeRate = z
  .string()
  .min(1, "Campo requerido")
  .refine(
    (v) => !isNaN(Number(v)) && Number(v) >= 0.000001 && Number(v) <= 999_999_999_999.999999,
    { message: "Debe ser entre 0.000001 y 999,999,999,999.999999" },
  )

const requiredDateNotFuture = z
  .string()
  .min(1, "Fecha es requerida")
  .refine((value) => isIsoDateString(value), { message: "Fecha invalida" })
  .refine((value) => !isDateAfterToday(value), {
    message: "La fecha no puede ser mayor a hoy",
  })

const currencyExchangeFormSchema = z.object({
  currencyCode: z.string().trim().min(1),
  exchangeRate: z
    .string()
    .refine(
      (v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0.000001 && Number(v) <= 999_999_999_999.999999),
      { message: "Debe ser entre 0.000001 y 999,999,999,999.999999" },
    ),
  // 0.0001 – 99,999,999,999,999.9999 (DECIMAL(18,4))
  convertedAmount: z
    .string()
    .refine(
      (v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0.0001 && Number(v) <= 99_999_999_999_999.9999),
      { message: "Debe ser mayor a 0" },
    ),
})

export type SettlementCurrencyExchangeFormItem = z.infer<typeof currencyExchangeFormSchema>

export const createSettlementSchema = z
  .object({
    fromPartnerId: z.string().min(1, "Selecciona el partner que paga"),
    toPartnerId: z.string().min(1, "Selecciona el partner que recibe"),
    amount: requiredPositiveNumeric,
    currency: z.string().regex(/^[A-Z]{3}$/, "Debe ser un código ISO de 3 letras (ej: USD)"),
    exchangeRate: requiredExchangeRate,
    settlementDate: requiredDateNotFuture,
    description: z.string().trim(),
    notes: z.string().trim(),
    currencyExchanges: z.array(currencyExchangeFormSchema),
  })
  .refine((d) => d.fromPartnerId !== d.toPartnerId, {
    message: "Los partners deben ser diferentes",
    path: ["toPartnerId"],
  })

export type CreateSettlementFormValues = z.infer<typeof createSettlementSchema>

export const updateSettlementSchema = z.object({
  amount: requiredPositiveNumeric,
  currency: z.string().regex(/^[A-Z]{3}$/, "Debe ser un código ISO de 3 letras (ej: USD)"),
  exchangeRate: requiredPositiveNumeric,
  settlementDate: requiredDateNotFuture,
  description: z.string().trim(),
  notes: z.string().trim(),
  currencyExchanges: z.array(currencyExchangeFormSchema),
})

export type UpdateSettlementFormValues = z.infer<typeof updateSettlementSchema>
