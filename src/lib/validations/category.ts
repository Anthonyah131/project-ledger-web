import { z } from "zod"

type TFn = (key: string, params?: Record<string, string | number>) => string

// budgetAmount: optional, 0.01 – 999,999,999,999.99
function budgetAmountField(t: TFn) {
  return z
    .string()
    .refine(
      (v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0.01 && Number(v) <= 999_999_999_999.99),
      { message: t("common.validation.amountRange") },
    )
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function createCategorySchema(t: TFn) {
  return z.object({
    name: z.string().trim().min(1, t("common.validation.nameRequired")),
    description: z.string().trim(),
    budgetAmount: budgetAmountField(t),
  })
}

export type CreateCategoryFormValues = z.infer<ReturnType<typeof createCategorySchema>>

// ─── Update ───────────────────────────────────────────────────────────────────

export function updateCategorySchema(t: TFn) {
  return z.object({
    name: z.string().trim().min(1, t("common.validation.nameRequired")),
    description: z.string().trim(),
    budgetAmount: budgetAmountField(t),
  })
}

export type UpdateCategoryFormValues = z.infer<ReturnType<typeof updateCategorySchema>>
