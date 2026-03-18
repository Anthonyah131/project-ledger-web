// services/partner-settlement-service.ts

import { api } from "@/lib/api-client"
import type {
  PartnersBalanceResponse,
  PartnerHistoryResponse,
  PartnerSettlementResponse,
  SettlementsPageResponse,
  SettlementSuggestionsResponse,
  CreateSettlementRequest,
  UpdateSettlementRequest,
} from "@/types/partner-settlement"

export function getPartnersBalance(projectId: string) {
  return api.get<PartnersBalanceResponse>(`/projects/${projectId}/partners/balance`)
}

export function getSettlementSuggestions(projectId: string) {
  return api.get<SettlementSuggestionsResponse>(
    `/projects/${projectId}/partners/settlement-suggestions`,
  )
}

export interface GetPartnerHistoryParams {
  page?: number
  pageSize?: number
}

export function getPartnerHistory(
  projectId: string,
  partnerId: string,
  params: GetPartnerHistoryParams = {},
) {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set("page", String(params.page))
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize))
  const qs = query.toString()
  const url = qs
    ? `/projects/${projectId}/partners/${partnerId}/history?${qs}`
    : `/projects/${projectId}/partners/${partnerId}/history`
  return api.get<PartnerHistoryResponse>(url)
}

export interface GetSettlementsParams {
  page?: number
  pageSize?: number
}

export function getSettlements(projectId: string, params: GetSettlementsParams = {}) {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set("page", String(params.page))
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize))
  const qs = query.toString()
  const url = qs
    ? `/projects/${projectId}/partner-settlements?${qs}`
    : `/projects/${projectId}/partner-settlements`
  return api.get<SettlementsPageResponse>(url)
}

export function createSettlement(projectId: string, data: CreateSettlementRequest) {
  return api.post<PartnerSettlementResponse>(`/projects/${projectId}/partner-settlements`, data)
}

export function updateSettlement(
  projectId: string,
  settlementId: string,
  data: UpdateSettlementRequest,
) {
  return api.patch<PartnerSettlementResponse>(
    `/projects/${projectId}/partner-settlements/${settlementId}`,
    data,
  )
}

export function deleteSettlement(projectId: string, settlementId: string) {
  return api.delete<void>(`/projects/${projectId}/partner-settlements/${settlementId}`)
}
