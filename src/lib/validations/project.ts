import { z } from "zod"

type TFn = (key: string, params?: Record<string, string | number>) => string

// ─── Create ───────────────────────────────────────────────────────────────────

export function createProjectSchema(t: TFn) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t("common.validation.nameRequired"))
      .max(255, t("common.validation.max255Chars")),
    currencyCode: z.string().min(1, t("common.validation.currencyRequired")),
    description: z.string().trim(),
  })
}

export type CreateProjectFormValues = z.infer<ReturnType<typeof createProjectSchema>>

// ─── Update ───────────────────────────────────────────────────────────────────

export function updateProjectSchema(t: TFn) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t("common.validation.nameRequired"))
      .max(255, t("common.validation.max255Chars")),
    description: z.string().trim(),
  })
}

export type UpdateProjectFormValues = z.infer<ReturnType<typeof updateProjectSchema>>
