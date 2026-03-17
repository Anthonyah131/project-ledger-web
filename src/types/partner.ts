// types/partner.ts
// Partner (financial contact) model type definitions

import type { PaymentMethodType } from "@/types/payment-method"

// ─── API shapes ────────────────────────────────────────────────────────────────

export interface PartnerPaymentMethodItem {
  id: string
  name: string
  type: PaymentMethodType
  currency: string
  bankName: string | null
}

/** Project linked to a partner via payment methods — returned in GET /partners/{id} */
export interface PartnerProjectResponse {
  id: string
  name: string
  currencyCode: string
  description: string | null
  workspaceId: string | null
  workspaceName: string | null
}

export interface PartnerResponse {
  id: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface PartnerDetailResponse extends PartnerResponse {
  paymentMethods: PartnerPaymentMethodItem[]
  /** Proyectos donde algún método de pago del partner está vinculado */
  projects: PartnerProjectResponse[]
}

export interface PartnersListResponse {
  items: PartnerResponse[]
  totalCount: number
}

// ─── Request bodies ────────────────────────────────────────────────────────────

export interface CreatePartnerRequest {
  name: string
  email?: string
  phone?: string
  notes?: string
}

export interface UpdatePartnerRequest {
  name: string
  email?: string
  phone?: string
  notes?: string
}
