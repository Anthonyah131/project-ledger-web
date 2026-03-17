// services/partner-service.ts
// API calls for partners (financial contacts)

import { api } from "@/lib/api-client"
import type {
  PartnerResponse,
  PartnerDetailResponse,
  PartnersListResponse,
  CreatePartnerRequest,
  UpdatePartnerRequest,
} from "@/types/partner"
import type { PaymentMethodResponse } from "@/types/payment-method"

// ─── Partners ──────────────────────────────────────────────────────────────────

export interface GetPartnersParams {
  search?: string
  skip?: number
  take?: number
}

export function getPartners(params: GetPartnersParams = {}) {
  const query = new URLSearchParams()
  if (params.search) query.set("search", params.search)
  if (params.skip !== undefined) query.set("skip", String(params.skip))
  if (params.take !== undefined) query.set("take", String(params.take))
  const qs = query.toString()
  return api.get<PartnersListResponse>(qs ? `/partners?${qs}` : "/partners")
}

export function getPartner(id: string) {
  return api.get<PartnerDetailResponse>(`/partners/${id}`)
}

export function createPartner(data: CreatePartnerRequest) {
  return api.post<PartnerResponse>("/partners", data)
}

export function updatePartner(id: string, data: UpdatePartnerRequest) {
  return api.patch<PartnerResponse>(`/partners/${id}`, data)
}

export function deletePartner(id: string) {
  return api.delete<void>(`/partners/${id}`)
}

// ─── Partner payment methods ───────────────────────────────────────────────────

export function getPartnerPaymentMethods(id: string) {
  return api.get<PaymentMethodResponse[]>(`/partners/${id}/payment-methods`)
}
