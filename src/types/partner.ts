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

/** Project linked to a partner via payment methods */
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

/** GET /api/partners/{id} — solo datos básicos, sin listas embebidas */
export type PartnerDetailResponse = PartnerResponse

export interface PartnersListResponse {
  items: PartnerResponse[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

/** GET /api/partners/{id}/payment-methods — respuesta paginada */
export interface PartnerPaymentMethodsPagedResponse {
  items: PartnerPaymentMethodItem[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

/** GET /api/partners/{id}/projects — respuesta paginada */
export interface PartnerProjectsPagedResponse {
  items: PartnerProjectResponse[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
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
