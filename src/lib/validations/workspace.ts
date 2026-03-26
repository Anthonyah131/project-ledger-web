import { z } from "zod"

type TFn = (key: string, params?: Record<string, string | number>) => string

// ─── Create ───────────────────────────────────────────────────────────────────

export function createWorkspaceSchema(t: TFn) {
  return z.object({
    name: z.string().trim().min(1, t("common.validation.nameRequired")),
    description: z.string().trim(),
    color: z
      .string()
      .trim()
      .regex(/^#[0-9A-Fa-f]{6}$/, t("common.validation.hexColor"))
      .or(z.literal(""))
      .optional(),
    icon: z.string().trim().max(50, t("common.validation.max50Chars")).optional(),
  })
}

export type CreateWorkspaceFormValues = z.infer<ReturnType<typeof createWorkspaceSchema>>

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateWorkspaceSchema = createWorkspaceSchema

export type UpdateWorkspaceFormValues = CreateWorkspaceFormValues
