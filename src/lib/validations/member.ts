import { z } from "zod"

type TFn = (key: string, params?: Record<string, string | number>) => string

// ─── Add member ───────────────────────────────────────────────────────────────

export function addMemberSchema(t: TFn) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t("members.validation.emailRequired"))
      .email(t("members.validation.emailInvalid"))
      .max(255, t("members.validation.emailMaxLength")),
    role: z.enum(["editor", "viewer"], {
      message: t("members.validation.roleRequired"),
    }),
  })
}

export type AddMemberFormValues = z.infer<ReturnType<typeof addMemberSchema>>

// ─── Change role ──────────────────────────────────────────────────────────────

export function changeRoleSchema(t: TFn) {
  return z.object({
    role: z.enum(["editor", "viewer"], {
      message: t("members.validation.roleRequired"),
    }),
  })
}

export type ChangeRoleFormValues = z.infer<ReturnType<typeof changeRoleSchema>>
