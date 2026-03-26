import { z } from "zod"
import { isDateAfterToday, isIsoDateString } from "@/lib/date-utils"

type TFn = (key: string, params?: Record<string, string | number>) => string

// Helper: required positive numeric string (monetary amounts: 0.01 – 999,999,999,999.99)
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

// Helper: optional positive numeric string (may be empty)
function optionalNumericString(t: TFn) {
  return z
    .string()
    .refine(
      (v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0.01 && Number(v) <= 999_999_999_999.99),
      { message: t("common.validation.positiveNumber") },
    )
}

function requiredDateNotFuture(t: TFn) {
  return z
    .string()
    .min(1, t("common.validation.dateRequired"))
    .refine((value) => isIsoDateString(value), {
      message: t("common.validation.invalidDate"),
    })
    .refine((value) => !isDateAfterToday(value), {
      message: t("common.validation.dateFuture"),
    })
}

// Currency exchange convertedAmount: 0.0001 – 99,999,999,999,999.9999 (4 decimals, DECIMAL(18,4))
function requiredCurrencyExchangeConvertedAmount(t: TFn) {
  return z
    .string()
    .min(1, t("common.validation.required"))
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0.0001 && Number(v) <= 99_999_999_999_999.9999,
      { message: t("common.validation.greaterThanZero") },
    )
}

function currencyExchangeSchema(t: TFn) {
  return z.object({
    currencyCode: z.string().trim().min(1, t("common.validation.currencyRequired")),
    exchangeRate: requiredExchangeRate(t),
    convertedAmount: requiredCurrencyExchangeConvertedAmount(t),
  })
}

const splitCurrencyExchangeFormSchema = z.object({
  currencyCode: z.string(),
  exchangeRate: z.string(),
  convertedAmount: z.string(),
})

// splitValue: 0.0001 – 9,999,999,999.9999 (DECIMAL(14,4) in DB)
function splitItemSchema(t: TFn) {
  return z.object({
    partnerId: z.string().min(1),
    partnerName: z.string(),
    splitValue: z
      .string()
      .refine(
        (v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0.0001 && Number(v) <= 9_999_999_999.9999),
        t("common.validation.positiveNumber"),
      ),
    currencyExchanges: z.array(splitCurrencyExchangeFormSchema).optional(),
  })
}

export type SplitFormItem = {
  partnerId: string
  partnerName: string
  splitValue: string
  currencyExchanges?: { currencyCode: string; exchangeRate: string; convertedAmount: string }[]
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function createExpenseSchema(t: TFn) {
  return z.object({
    title: z.string().trim().min(1, t("common.validation.titleRequired")),
    originalAmount: requiredPositiveNumeric(t),
    originalCurrency: z.string().min(1, t("common.validation.currencyRequired")),
    expenseDate: requiredDateNotFuture(t),
    categoryId: z.string().min(1, t("common.validation.categoryRequired")),
    paymentMethodId: z.string().min(1, t("common.validation.paymentMethodRequired")),
    exchangeRate: requiredExchangeRate(t),
    convertedAmount: optionalNumericString(t),
    description: z.string().trim(),
    receiptNumber: z.string().trim(),
    notes: z.string().trim(),
    isActive: z.boolean(),
    obligationId: z.string(),
    obligationEquivalentAmount: optionalNumericString(t),
    currencyExchanges: z.array(currencyExchangeSchema(t)),
    splitType: z.enum(["percentage", "fixed"]).optional(),
    splits: z.array(splitItemSchema(t)).optional(),
  })
}

export type CreateExpenseFormValues = z.infer<ReturnType<typeof createExpenseSchema>>

// ─── Update ───────────────────────────────────────────────────────────────────

export function updateExpenseSchema(t: TFn) {
  return z.object({
    title: z.string().trim().min(1, t("common.validation.titleRequired")),
    originalAmount: requiredPositiveNumeric(t),
    originalCurrency: z.string().min(1, t("common.validation.currencyRequired")),
    expenseDate: requiredDateNotFuture(t),
    categoryId: z.string().min(1, t("common.validation.categoryRequired")),
    paymentMethodId: z.string().min(1, t("common.validation.paymentMethodRequired")),
    obligationId: z.string(),
    exchangeRate: requiredExchangeRate(t),
    convertedAmount: optionalNumericString(t),
    description: z.string().trim(),
    receiptNumber: z.string().trim(),
    notes: z.string().trim(),
    isActive: z.boolean(),
    isTemplate: z.boolean().optional(),
    obligationEquivalentAmount: optionalNumericString(t),
    currencyExchanges: z.array(currencyExchangeSchema(t)),
    splitType: z.enum(["percentage", "fixed"]).optional(),
    splits: z.array(splitItemSchema(t)).optional(),
  })
}

export type UpdateExpenseFormValues = z.infer<ReturnType<typeof updateExpenseSchema>>
