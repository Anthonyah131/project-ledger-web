import { z } from "zod"

type TFn = (key: string, params?: Record<string, string | number>) => string

// ─── Login ────────────────────────────────────────────────────────────────────

export function loginSchema(t: TFn) {
  return z.object({
    email: z
      .string()
      .min(1, t("auth.validation.emailRequired"))
      .email(t("auth.validation.emailInvalid")),
    password: z
      .string()
      .min(1, t("auth.validation.passwordRequired")),
  })
}

export type LoginFormValues = z.infer<ReturnType<typeof loginSchema>>

// ─── Register ─────────────────────────────────────────────────────────────────

export function registerSchema(t: TFn) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, t("auth.validation.nameRequired")),
      email: z
        .string()
        .min(1, t("auth.validation.emailRequired"))
        .email(t("auth.validation.emailInvalid")),
      password: z
        .string()
        .min(8, t("auth.validation.passwordMinLength")),
      confirmPassword: z
        .string()
        .min(1, t("auth.validation.confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.validation.passwordMismatch"),
      path: ["confirmPassword"],
    })
}

export type RegisterFormValues = z.infer<ReturnType<typeof registerSchema>>

// ─── Forgot Password (Step 1: Request OTP) ────────────────────────────────────

export function forgotPasswordSchema(t: TFn) {
  return z.object({
    email: z
      .string()
      .min(1, t("auth.validation.emailRequired"))
      .email(t("auth.validation.emailInvalid")),
  })
}

export type ForgotPasswordFormValues = z.infer<ReturnType<typeof forgotPasswordSchema>>

// ─── Verify OTP (Step 2: Verify code) ─────────────────────────────────────────

export function verifyOtpSchema(t: TFn) {
  return z.object({
    otpCode: z
      .string()
      .length(6, t("auth.validation.otpLength"))
      .regex(/^\d{6}$/, t("auth.validation.otpNumeric")),
  })
}

export type VerifyOtpFormValues = z.infer<ReturnType<typeof verifyOtpSchema>>

// ─── Reset Password (Step 3: New password) ────────────────────────────────────

export function resetPasswordSchema(t: TFn) {
  return z
    .object({
      newPassword: z
        .string()
        .min(8, t("auth.validation.passwordMinLength"))
        .max(128, t("auth.validation.passwordMaxLength")),
      confirmPassword: z
        .string()
        .min(1, t("auth.validation.confirmPasswordRequired")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("auth.validation.passwordMismatch"),
      path: ["confirmPassword"],
    })
}

export type ResetPasswordFormValues = z.infer<ReturnType<typeof resetPasswordSchema>>

// ─── Change Password (Settings) ────────────────────────────────────────────────

export function changePasswordSchema(t: TFn) {
  return z
    .object({
      currentPassword: z
        .string()
        .min(1, t("auth.validation.currentPasswordRequired")),
      newPassword: z
        .string()
        .min(8, t("auth.validation.passwordMinLength"))
        .max(128, t("auth.validation.passwordMaxLength")),
      confirmPassword: z
        .string()
        .min(1, t("auth.validation.confirmPasswordRequired")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("auth.validation.passwordMismatch"),
      path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: t("auth.validation.passwordSameAsCurrent"),
      path: ["newPassword"],
    })
}

export type ChangePasswordFormValues = z.infer<ReturnType<typeof changePasswordSchema>>

// ─── Update Profile (Settings) ───────────────────────────────────────────────

export function updateProfileSchema(t: TFn) {
  return z.object({
    fullName: z
      .string()
      .trim()
      .min(1, t("auth.validation.nameRequired"))
      .max(255, t("auth.validation.nameMaxLength")),
    avatarUrl: z
      .string()
      .trim()
      .refine((value) => value.length === 0 || /^https?:\/\//i.test(value), {
        message: t("auth.validation.avatarUrlInvalid"),
      }),
  })
}

export type UpdateProfileFormValues = z.infer<ReturnType<typeof updateProfileSchema>>
