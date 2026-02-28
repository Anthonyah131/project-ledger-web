import { z } from "zod"

// ─── Create ───────────────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nombre es requerido")
    .max(255, "Nombre no puede superar 255 caracteres"),
  currencyCode: z.string().min(1, "Moneda es requerida"),
  description: z.string().trim(),
})

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nombre es requerido")
    .max(255, "Nombre no puede superar 255 caracteres"),
  description: z.string().trim(),
})

export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>
