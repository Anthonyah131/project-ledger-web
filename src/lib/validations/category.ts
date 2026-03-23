import { z } from "zod"

// Helper: budgetAmount comes from an <input type="number"> as a string,
// but is optional.  We validate the string representation and leave
// the number conversion to the form-hook submit handler.
// budgetAmount: optional, 0.01 – 999,999,999,999.99
const budgetAmountField = z
  .string()
  .refine(
    (v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0.01 && Number(v) <= 999_999_999_999.99),
    { message: "Debe ser entre 0.01 y 999,999,999,999.99" },
  )

// ─── Create ───────────────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Nombre es requerido"),
  description: z.string().trim(),
  budgetAmount: budgetAmountField,
})

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1, "Nombre es requerido"),
  description: z.string().trim(),
  budgetAmount: budgetAmountField,
})

export type UpdateCategoryFormValues = z.infer<typeof updateCategorySchema>
