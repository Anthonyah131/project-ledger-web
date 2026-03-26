import { z } from "zod"

type TFn = (key: string, params?: Record<string, string | number>) => string

// ─── Edit admin user ────────────────────────────────────────────────────────

export function editAdminUserSchema(t: TFn) {
  return z.object({
    fullName: z
      .string()
      .trim()
      .min(1, t("common.validation.nameRequired"))
      .max(255, t("common.validation.max255Chars")),
    avatarUrl: z.string().trim().optional(),
    planId: z.string().trim().optional(),
    isAdmin: z.boolean().optional(),
  })
}

export type EditAdminUserFormValues = z.infer<ReturnType<typeof editAdminUserSchema>>
