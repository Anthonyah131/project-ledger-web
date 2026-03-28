import { z } from "zod"
import { isDateAfterToday, isIsoDateString } from "@/lib/date-utils"

type TFn = (key: string, params?: Record<string, string | number>) => string

function requiredPositiveNumeric(t: TFn) {
  return z
    .string()
    .min(1, t("common.validation.required"))
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0.01 && Number(v) <= 999_999_999_999.99,
      { message: t("common.validation.amountRange") },
    )
}

function requiredExchangeRate(t: TFn) {
  return z
    .string()
    .min(1, t("common.validation.required"))
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0.000001 && Number(v) <= 999_999_999_999.999999,
      { message: t("common.validation.exchangeRateRange") },
    )
}

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

/** Schema for a single row in the bulk import table */
export function bulkImportItemSchema(t: TFn) {
  return z
    .object({
      title: z.string().trim().min(1, t("common.validation.titleRequired")),
      originalAmount: requiredPositiveNumeric(t),
      originalCurrency: z.string().min(1, t("common.validation.currencyRequired")),
      date: requiredDateNotFuture(t),
      categoryId: z.string().min(1, t("common.validation.categoryRequired")),
      paymentMethodId: z.string().min(1, t("common.validation.paymentMethodRequired")),
      exchangeRate: requiredExchangeRate(t),
      convertedAmount: optionalNumericString(t),
      accountAmount: z.string().refine(
        (v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0.01 && Number(v) <= 999_999_999_999.99),
        { message: t("common.validation.amountRange") },
      ),
      description: z.string().trim(),
      notes: z.string().trim(),
      obligationId: z.string().optional(),
      obligationEquivalentAmount: z
        .string()
        .optional()
        .refine(
          (v) => !v || v === "" || (!isNaN(Number(v)) && Number(v) >= 0.01 && Number(v) <= 999_999_999_999.99),
          { message: t("common.validation.amountRange") },
        ),
      currencyExchanges: z.array(currencyExchangeSchema(t)),
      splitType: z.enum(["percentage", "fixed"]).optional(),
      splits: z.array(splitItemSchema(t)).optional(),
    })
    .superRefine((data, ctx) => {
      const allSplits = data.splits ?? []
      // No partners assigned at all — skip split validation entirely
      if (allSplits.length === 0) return

      const activeSplits = allSplits.filter((s) => Number(s.splitValue) > 0)

      // Partners exist but no splits filled — block submission
      if (activeSplits.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("bulkImport.validation.splitsRequired"),
          path: ["splits"],
        })
        return
      }

      const splitType = data.splitType ?? "percentage"
      const total = activeSplits.reduce((sum, s) => sum + Number(s.splitValue), 0)
      const rounded = parseFloat(total.toFixed(4))

      if (splitType === "percentage") {
        if (Math.abs(rounded - 100) > 0.01) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("bulkImport.validation.splitsMustSum100"),
            path: ["splits"],
          })
        }
      } else {
        const amount = Number(data.originalAmount)
        const rate = Number(data.exchangeRate) || 1
        const convertedAmount = Number(data.convertedAmount)
        const finalAmount =
          Number.isFinite(convertedAmount) && convertedAmount > 0
            ? convertedAmount
            : parseFloat((amount * rate).toFixed(2))

        if (finalAmount > 0 && Math.abs(rounded - finalAmount) > 0.01) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("bulkImport.validation.splitsMustSumAmount", { amount: finalAmount }),
            path: ["splits"],
          })
        }
      }

      // When the item has alternative currency exchanges, each active split must have
      // its corresponding CE amounts filled in.
      const parentCECount = (data.currencyExchanges ?? []).length
      if (parentCECount > 0) {
        allSplits.forEach((split, sIdx) => {
          if (Number(split.splitValue) <= 0) return
          const splitCEs = split.currencyExchanges ?? []
          splitCEs.forEach((ce, ceIdx) => {
            if (!ce.convertedAmount || ce.convertedAmount.trim() === "" || Number(ce.convertedAmount) <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t("common.validation.required"),
                path: ["splits", sIdx, "currencyExchanges", ceIdx, "convertedAmount"],
              })
            }
            if (!ce.exchangeRate || ce.exchangeRate.trim() === "" || Number(ce.exchangeRate) <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t("common.validation.required"),
                path: ["splits", sIdx, "currencyExchanges", ceIdx, "exchangeRate"],
              })
            }
          })
        })
      }
    })
}

export type BulkImportItemFormValues = z.infer<ReturnType<typeof bulkImportItemSchema>>

/** Schema for the entire bulk import form (array of items) */
export function bulkImportSchema(t: TFn) {
  return z.object({
    items: z
      .array(bulkImportItemSchema(t))
      .min(1, t("bulkImport.validation.minOneItem"))
      .max(100, t("bulkImport.validation.maxItems")),
  })
}

export type BulkImportFormValues = z.infer<ReturnType<typeof bulkImportSchema>>
