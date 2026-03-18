// types/project-payment-method.ts
// Types for payment methods linked to a project

import type { PaymentMethodType } from "./payment-method"

/** Shape returned by GET /projects/:id/payment-methods */
export interface ProjectPaymentMethodResponse {
  id: string
  paymentMethodId: string
  paymentMethodName: string
  type: PaymentMethodType
  currency: string
  bankName: string | null
  accountNumber: string | null
  ownerUserName: string
  linkedAt: string
  /** Nombre del partner asociado, si existe */
  partnerName?: string | null
}

/** Body for POST /projects/:id/payment-methods */
export interface LinkPaymentMethodRequest {
  paymentMethodId: string
}
