import { z } from "zod"

type TFn = (key: string, params?: Record<string, string | number>) => string

// ─── Create ───────────────────────────────────────────────────────────────────

export function createPartnerSchema(t: TFn) {
  return z.object({
    name: z.string().trim().min(1, t("common.validation.nameRequired")),
    email: z.string().trim().email(t("partners.validation.emailInvalid")).or(z.literal("")).optional(),
    phone: z.string().trim(),
    notes: z.string().trim(),
  })
}

export type CreatePartnerFormValues = z.infer<ReturnType<typeof createPartnerSchema>>

// ─── Update ───────────────────────────────────────────────────────────────────

export const updatePartnerSchema = createPartnerSchema

export type UpdatePartnerFormValues = CreatePartnerFormValues
