import { z } from "zod"

// ─── Add member ───────────────────────────────────────────────────────────────

export const addMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email es requerido")
    .email("Email no es válido")
    .max(255, "Máximo 255 caracteres"),
  role: z.enum(["editor", "viewer"], {
    message: "Rol es requerido",
  }),
})

export type AddMemberFormValues = z.infer<typeof addMemberSchema>

// ─── Change role ──────────────────────────────────────────────────────────────

export const changeRoleSchema = z.object({
  role: z.enum(["editor", "viewer"], {
    message: "Rol es requerido",
  }),
})

export type ChangeRoleFormValues = z.infer<typeof changeRoleSchema>
