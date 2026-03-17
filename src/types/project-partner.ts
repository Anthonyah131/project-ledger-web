// types/project-partner.ts
// Types for partners assigned to a project

import type { PartnerPaymentMethodItem } from "@/types/partner"
import type { PaymentMethodType } from "@/types/payment-method"

/** Shape returned by GET /projects/:id/partners */
export interface ProjectPartnerResponse {
  id: string
  partnerId: string
  partnerName: string
  partnerEmail: string | null
  addedAt: string
}

/** Body for POST /projects/:id/partners */
export interface AssignPartnerRequest {
  partnerId: string
}

/** Shape returned by GET /projects/:id/available-payment-methods */
export interface AvailablePaymentMethodsPartnerItem {
  partnerId: string
  partnerName: string
  paymentMethods: PartnerPaymentMethodItem[]
}

export interface ProjectAvailablePaymentMethodsResponse {
  projectId: string
  /** Payment methods that belong to the user but have no partner assigned */
  unpartneredPaymentMethods: PartnerPaymentMethodItem[]
  partners: AvailablePaymentMethodsPartnerItem[]
}

/** Shape of a payment method linked to a project */
export interface ProjectPaymentMethodItem {
  id: string
  name: string
  type: PaymentMethodType
  currency: string
  bankName: string | null
  accountNumber: string | null
  partner_id: string | null
  partnerName: string | null
}

export interface ProjectPaymentMethodsResponse {
  items: ProjectPaymentMethodItem[]
}

export interface LinkPaymentMethodRequest {
  paymentMethodId: string
}
