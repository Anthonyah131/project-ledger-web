// services/project-payment-method-service.ts
// API calls for project payment methods (link / unlink / list)

import { api } from "@/lib/api-client"
import type {
  ProjectPaymentMethodResponse,
  LinkPaymentMethodRequest,
} from "@/types/project-payment-method"

/** List payment methods linked to a project */
export function getProjectPaymentMethods(projectId: string) {
  return api.get<ProjectPaymentMethodResponse[]>(
    `/projects/${projectId}/payment-methods`,
  )
}

/** Link a payment method to a project */
export function linkPaymentMethod(
  projectId: string,
  data: LinkPaymentMethodRequest,
) {
  return api.post<ProjectPaymentMethodResponse>(
    `/projects/${projectId}/payment-methods`,
    data,
  )
}

/** Unlink a payment method from a project */
export function unlinkPaymentMethod(
  projectId: string,
  paymentMethodId: string,
) {
  return api.delete<void>(
    `/projects/${projectId}/payment-methods/${paymentMethodId}`,
  )
}
