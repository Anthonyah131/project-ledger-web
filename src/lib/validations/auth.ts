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

// ─── Forgot Password (Step 1: Request OTP) ────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Correo es requerido")
    .email("Correo electrónico inválido"),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

// ─── Verify OTP (Step 2: Verify code) ─────────────────────────────────────────

export const verifyOtpSchema = z.object({
  otpCode: z
    .string()
    .length(6, "El código debe tener 6 dígitos")
    .regex(/^\d{6}$/, "El código debe contener solo números"),
})

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>

// ─── Reset Password (Step 3: New password) ────────────────────────────────────

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(128, "La contraseña no puede exceder 128 caracteres"),
    confirmPassword: z
      .string()
      .min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

// ─── Change Password (Settings) ────────────────────────────────────────────────

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(128, "La contraseña no puede exceder 128 caracteres"),
    confirmPassword: z
      .string()
      .min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "La nueva contraseña debe ser diferente a la actual",
    path: ["newPassword"],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

// ─── Update Profile (Settings) ───────────────────────────────────────────────

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Nombre es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres"),
  avatarUrl: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || /^https?:\/\//i.test(value), {
      message: "Ingresa una URL válida (http o https)",
    }),
})

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>
