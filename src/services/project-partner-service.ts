// services/project-partner-service.ts
// API calls for project-partner assignments

import { api } from "@/lib/api-client"
import type {
  ProjectPartnerResponse,
  AssignPartnerRequest,
  ProjectAvailablePaymentMethodsResponse,
  ProjectPaymentMethodsResponse,
  LinkPaymentMethodRequest,
  LinkablePaymentMethodItem,
  SplitDefaultsResponse,
} from "@/types/project-partner"

/** List partners assigned to a project */
export function getProjectPartners(projectId: string) {
  return api.get<ProjectPartnerResponse[]>(`/projects/${projectId}/partners`)
}

/** Assign a partner to a project */
export function assignPartner(projectId: string, data: AssignPartnerRequest) {
  return api.post<ProjectPartnerResponse>(`/projects/${projectId}/partners`, data)
}

/** Remove a partner from a project */
export function removeProjectPartner(projectId: string, partnerId: string) {
  return api.delete<void>(`/projects/${projectId}/partners/${partnerId}`)
}

/** Get payment methods available in a project, grouped by partner */
export function getProjectAvailablePaymentMethods(projectId: string) {
  return api.get<ProjectAvailablePaymentMethodsResponse>(
    `/projects/${projectId}/available-payment-methods`,
  )
}

/** Get payment methods linked to a project */
export function getProjectPaymentMethods(projectId: string) {
  return api.get<ProjectPaymentMethodsResponse>(`/projects/${projectId}/payment-methods`)
}

/** Link a payment method to a project */
export function linkPaymentMethod(projectId: string, data: LinkPaymentMethodRequest) {
  return api.post<void>(`/projects/${projectId}/payment-methods`, data)
}

/** Unlink a payment method from a project */
export function unlinkPaymentMethod(projectId: string, pmId: string) {
  return api.delete<void>(`/projects/${projectId}/payment-methods/${pmId}`)
}

/** List payment methods that can be linked to a project (pre-filtered by backend) */
export function getLinkablePaymentMethods(projectId: string) {
  return api.get<LinkablePaymentMethodItem[]>(
    `/projects/${projectId}/payment-methods/linkable`,
  )
}

/** Get default split percentages for partners assigned to a project */
export function getPartnerSplitDefaults(projectId: string) {
  return api.get<SplitDefaultsResponse>(
    `/projects/${projectId}/partners/split-defaults`,
  )
}
