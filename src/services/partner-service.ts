// services/partner-service.ts
// API calls for partners (financial contacts)

import { api } from "@/lib/api-client"
import type {
  PartnerResponse,
  PartnerDetailResponse,
  PartnersListResponse,
  PartnerPaymentMethodsPagedResponse,
  PartnerProjectsPagedResponse,
  CreatePartnerRequest,
  UpdatePartnerRequest,
} from "@/types/partner"

// ─── Partners ──────────────────────────────────────────────────────────────────

export interface GetPartnersParams {
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
}

export function getPartners(params: GetPartnersParams = {}) {
  const query = new URLSearchParams()
  if (params.search) query.set("search", params.search)
  if (params.page !== undefined) query.set("page", String(params.page))
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize))
  if (params.sortBy) query.set("sortBy", params.sortBy)
  if (params.sortDirection) query.set("sortDirection", params.sortDirection)
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

export interface GetPartnerPaymentMethodsParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
}

export function getPartnerPaymentMethods(id: string, params: GetPartnerPaymentMethodsParams = {}) {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set("page", String(params.page))
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize))
  if (params.sortBy) query.set("sortBy", params.sortBy)
  if (params.sortDirection) query.set("sortDirection", params.sortDirection)
  const qs = query.toString()
  return api.get<PartnerPaymentMethodsPagedResponse>(qs ? `/partners/${id}/payment-methods?${qs}` : `/partners/${id}/payment-methods`)
}

// ─── Partner projects ──────────────────────────────────────────────────────────

export interface GetPartnerProjectsParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
}

export function getPartnerProjects(id: string, params: GetPartnerProjectsParams = {}) {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set("page", String(params.page))
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize))
  if (params.sortBy) query.set("sortBy", params.sortBy)
  if (params.sortDirection) query.set("sortDirection", params.sortDirection)
  const qs = query.toString()
  return api.get<PartnerProjectsPagedResponse>(qs ? `/partners/${id}/projects?${qs}` : `/partners/${id}/projects`)
}
