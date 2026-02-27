// services/obligation-service.ts

import { api } from "@/lib/api-client"
import type {
  ObligationResponse,
  ObligationsPageResponse,
  CreateObligationRequest,
  UpdateObligationRequest,
} from "@/types/obligation"

// ─── Query params ──────────────────────────────────────────────────────────────

export interface GetObligationsParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
}

// ─── Obligations (scoped to project) ──────────────────────────────────────────

export function getObligations(projectId: string, params: GetObligationsParams = {}) {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set("page", String(params.page))
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize))
  if (params.sortBy) query.set("sortBy", params.sortBy)
  if (params.sortDirection) query.set("sortDirection", params.sortDirection)

  const qs = query.toString()
  const url = qs
    ? `/projects/${projectId}/obligations?${qs}`
    : `/projects/${projectId}/obligations`

  return api.get<ObligationsPageResponse>(url)
}

export function getObligation(projectId: string, obligationId: string) {
  return api.get<ObligationResponse>(`/projects/${projectId}/obligations/${obligationId}`)
}

export function createObligation(projectId: string, data: CreateObligationRequest) {
  return api.post<ObligationResponse>(`/projects/${projectId}/obligations`, data)
}

export function updateObligation(
  projectId: string,
  obligationId: string,
  data: UpdateObligationRequest
) {
  return api.put<ObligationResponse>(
    `/projects/${projectId}/obligations/${obligationId}`,
    data
  )
}

export function deleteObligation(projectId: string, obligationId: string) {
  return api.delete<void>(`/projects/${projectId}/obligations/${obligationId}`)
}
