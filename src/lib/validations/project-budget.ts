import { z } from "zod"

// totalBudget: 0.01 – 999,999,999,999.99
const totalBudgetField = z
  .string()
  .trim()
  .refine(
    (v) => v !== "" && !isNaN(Number(v)) && Number(v) >= 0.01 && Number(v) <= 999_999_999_999.99,
    { message: "Debe ser entre 0.01 y 999,999,999,999.99" },
  )

const alertPercentageField = z
  .string()
  .trim()
  .refine(
    (v) => v !== "" && !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 100,
    { message: "Debe ser un número entre 1 y 100" },
  )

export const setProjectBudgetSchema = z.object({
  totalBudget: totalBudgetField,
  alertPercentage: alertPercentageField,
})

export type SetProjectBudgetFormValues = z.infer<typeof setProjectBudgetSchema>
