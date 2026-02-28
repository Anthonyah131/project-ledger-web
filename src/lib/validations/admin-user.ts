import { z } from "zod"

// ─── Edit admin user ────────────────────────────────────────────────────────

export const editAdminUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Nombre es requerido")
    .max(255, "Nombre no puede superar 255 caracteres"),
  avatarUrl: z.string().trim().optional(),
  planId: z.string().trim().optional(),
})

export type EditAdminUserFormValues = z.infer<typeof editAdminUserSchema>
