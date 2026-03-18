import { z } from "zod"
import { isDateAfterToday, isIsoDateString } from "@/lib/date-utils"

const requiredPositiveNumeric = z
  .string()
  .min(1, "Campo requerido")
  .refine(
    (v) => !isNaN(Number(v)) && Number(v) > 0,
    { message: "Debe ser mayor a 0" },
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
    .refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) > 0), {
      message: "Debe ser mayor a 0",
    }),
  convertedAmount: z
    .string()
    .refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) > 0), {
      message: "Debe ser mayor a 0",
    }),
})

export type SettlementCurrencyExchangeFormItem = z.infer<typeof currencyExchangeFormSchema>

export const createSettlementSchema = z
  .object({
    fromPartnerId: z.string().min(1, "Selecciona el partner que paga"),
    toPartnerId: z.string().min(1, "Selecciona el partner que recibe"),
    amount: requiredPositiveNumeric,
    currency: z.string().min(1, "Moneda es requerida"),
    exchangeRate: requiredPositiveNumeric,
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
  currency: z.string().min(1, "Moneda es requerida"),
  exchangeRate: requiredPositiveNumeric,
  settlementDate: requiredDateNotFuture,
  description: z.string().trim(),
  notes: z.string().trim(),
  currencyExchanges: z.array(currencyExchangeFormSchema),
})

export type UpdateSettlementFormValues = z.infer<typeof updateSettlementSchema>
