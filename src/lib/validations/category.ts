import { z } from "zod"

// Helper: budgetAmount comes from an <input type="number"> as a string,
// but is optional.  We validate the string representation and leave
// the number conversion to the form-hook submit handler.
const budgetAmountField = z
  .string()
  .refine(
    (v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0),
    { message: "Debe ser un número positivo" },
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
