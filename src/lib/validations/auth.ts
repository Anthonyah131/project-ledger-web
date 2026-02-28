import { z } from "zod"

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Correo es requerido")
    .email("Correo electrónico inválido"),
  password: z
    .string()
    .min(1, "Contraseña es requerida"),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Nombre es requerido"),
    email: z
      .string()
      .min(1, "Correo es requerido")
      .email("Correo electrónico inválido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z
      .string()
      .min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
