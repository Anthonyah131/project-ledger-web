// types/subscription.ts
// Billing subscription model definitions (Stripe-backed).

export type BillingSubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | (string & {});

/** Returned by GET /api/billing/subscription/me */
export interface BillingSubscriptionResponse {
  userId: string | null;
  planId: string | null;
  planName: string | null;
  planSlug: string | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  stripePriceId: string | null;
  status: BillingSubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  updatedAt: string;
}

/** POST /api/billing/stripe/create-checkout-session */
export interface CreateCheckoutSessionRequest {
  planId: string;
}

/** Response from POST /api/billing/stripe/create-checkout-session */
export interface CreateCheckoutSessionResponse {
  checkoutUrl: string;
  sessionId: string;
}
