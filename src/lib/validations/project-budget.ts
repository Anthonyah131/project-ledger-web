import { z } from "zod"

const totalBudgetField = z
  .string()
  .trim()
  .refine(
    (v) => v !== "" && !isNaN(Number(v)) && Number(v) > 0,
    { message: "Debe ser un número mayor a 0" },
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
