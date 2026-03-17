import { z } from "zod"

// ─── Create ───────────────────────────────────────────────────────────────────

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Nombre es requerido"),
  description: z.string().trim(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Debe ser un color hex (ej: #4CAF50)")
    .or(z.literal(""))
    .optional(),
  icon: z.string().trim().max(50, "Máximo 50 caracteres").optional(),
})

export type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateWorkspaceSchema = createWorkspaceSchema

export type UpdateWorkspaceFormValues = z.infer<typeof updateWorkspaceSchema>
