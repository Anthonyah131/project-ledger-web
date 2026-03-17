import { z } from "zod"

// ─── Create ───────────────────────────────────────────────────────────────────

export const createPartnerSchema = z.object({
  name: z.string().trim().min(1, "Nombre es requerido"),
  email: z.string().trim().email("Email inválido").or(z.literal("")).optional(),
  phone: z.string().trim(),
  notes: z.string().trim(),
})

export type CreatePartnerFormValues = z.infer<typeof createPartnerSchema>

// ─── Update ───────────────────────────────────────────────────────────────────

export const updatePartnerSchema = createPartnerSchema

export type UpdatePartnerFormValues = z.infer<typeof updatePartnerSchema>
