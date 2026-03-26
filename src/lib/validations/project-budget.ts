import { z } from "zod"

type TFn = (key: string, params?: Record<string, string | number>) => string

// totalBudget: 0.01 – 999,999,999,999.99
function totalBudgetField(t: TFn) {
  return z
    .string()
    .trim()
    .refine(
      (v) => v !== "" && !isNaN(Number(v)) && Number(v) >= 0.01 && Number(v) <= 999_999_999_999.99,
      { message: t("common.validation.amountRange") },
    )
}

function alertPercentageField(t: TFn) {
  return z
    .string()
    .trim()
    .refine(
      (v) => v !== "" && !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 100,
      { message: t("common.validation.percentageRange") },
    )
}

export function setProjectBudgetSchema(t: TFn) {
  return z.object({
    totalBudget: totalBudgetField(t),
    alertPercentage: alertPercentageField(t),
  })
}

export type SetProjectBudgetFormValues = z.infer<ReturnType<typeof setProjectBudgetSchema>>
