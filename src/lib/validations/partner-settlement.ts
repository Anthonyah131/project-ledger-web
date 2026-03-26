import { z } from "zod"
import { isDateAfterToday, isIsoDateString } from "@/lib/date-utils"

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

// Exchange rate: 0.000001 – 999,999,999,999.999999 (DECIMAL(18,6))
function requiredExchangeRate(t: TFn) {
  return z
    .string()
    .min(1, t("common.validation.required"))
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0.000001 && Number(v) <= 999_999_999_999.999999,
      { message: t("common.validation.exchangeRateRange") },
    )
}

function requiredDateNotFuture(t: TFn) {
  return z
    .string()
    .min(1, t("common.validation.dateRequired"))
    .refine((value) => isIsoDateString(value), { message: t("common.validation.invalidDate") })
    .refine((value) => !isDateAfterToday(value), {
      message: t("common.validation.dateFuture"),
    })
}

function currencyExchangeFormSchema(t: TFn) {
  return z.object({
    currencyCode: z.string().trim().min(1),
    exchangeRate: z
      .string()
      .refine(
        (v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0.000001 && Number(v) <= 999_999_999_999.999999),
        { message: t("common.validation.exchangeRateRange") },
      ),
    // 0.0001 – 99,999,999,999,999.9999 (DECIMAL(18,4))
    convertedAmount: z
      .string()
      .refine(
        (v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0.0001 && Number(v) <= 99_999_999_999_999.9999),
        { message: t("common.validation.greaterThanZero") },
      ),
  })
}

export type SettlementCurrencyExchangeFormItem = {
  currencyCode: string
  exchangeRate: string
  convertedAmount: string
}

export function createSettlementSchema(t: TFn) {
  return z
    .object({
      fromPartnerId: z.string().min(1, t("partnerSettlements.validation.fromPartnerRequired")),
      toPartnerId: z.string().min(1, t("partnerSettlements.validation.toPartnerRequired")),
      amount: requiredPositiveNumeric(t),
      currency: z.string().regex(/^[A-Z]{3}$/, t("common.validation.isoCode")),
      exchangeRate: requiredExchangeRate(t),
      settlementDate: requiredDateNotFuture(t),
      description: z.string().trim(),
      notes: z.string().trim(),
      currencyExchanges: z.array(currencyExchangeFormSchema(t)),
    })
    .refine((d) => d.fromPartnerId !== d.toPartnerId, {
      message: t("partnerSettlements.validation.partnersSame"),
      path: ["toPartnerId"],
    })
}

export type CreateSettlementFormValues = z.infer<ReturnType<typeof createSettlementSchema>>

export function updateSettlementSchema(t: TFn) {
  return z.object({
    amount: requiredPositiveNumeric(t),
    currency: z.string().regex(/^[A-Z]{3}$/, t("common.validation.isoCode")),
    exchangeRate: requiredPositiveNumeric(t),
    settlementDate: requiredDateNotFuture(t),
    description: z.string().trim(),
    notes: z.string().trim(),
    currencyExchanges: z.array(currencyExchangeFormSchema(t)),
  })
}

export type UpdateSettlementFormValues = z.infer<ReturnType<typeof updateSettlementSchema>>
