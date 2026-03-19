// lib/payment-method-utils.ts
// Shared helpers for displaying payment method info across lists, tables and selects.

import type { PaymentMethodResponse } from "@/types/payment-method"

export interface PaymentMethodDisplayInfo {
  name: string
  currency: string
  partnerName: string | null
}

/**
 * Returns a human-readable label for a payment method.
 * Format: "Name (USD - Partner)" or "Name (USD)" when no partner.
 */
export function formatPaymentMethodLabel(pm: {
  name: string
  currency: string
  partner?: { name: string } | null
}): string {
  const partnerPart = pm.partner?.name ? ` - ${pm.partner.name}` : ""
  return `${pm.name} (${pm.currency}${partnerPart})`
}

/**
 * Builds a fast lookup map from payment method id to display info.
 * Use this to avoid repeated finds in list/table renders.
 */
export function buildPaymentMethodLookup(
  paymentMethods: PaymentMethodResponse[],
): Map<string, PaymentMethodDisplayInfo> {
  const map = new Map<string, PaymentMethodDisplayInfo>()
  for (const pm of paymentMethods) {
    map.set(pm.id, {
      name: pm.name,
      currency: pm.currency,
      partnerName: pm.partner?.name ?? null,
    })
  }
  return map
}
