// services/billing-service.ts
// Stripe billing endpoints consumed by the frontend.

import { api } from "@/lib/api-client";
import type {
  BillingSubscriptionResponse,
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
} from "@/types/subscription";

/**
 * GET /api/billing/subscription/me
 * Returns current authenticated user's subscription.
 * Can return 404 when the user has no subscription registered yet.
 */
export function getMySubscription() {
  return api.get<BillingSubscriptionResponse>("/billing/subscription/me");
}

/**
 * POST /api/billing/stripe/create-checkout-session
 * Creates a Stripe Checkout Session for a paid plan.
 */
export function createCheckoutSession(data: CreateCheckoutSessionRequest) {
  return api.post<CreateCheckoutSessionResponse>("/billing/stripe/create-checkout-session", data);
}

/**
 * POST /api/billing/stripe/sync-plans
 * Technical/admin operation to sync plans with Stripe.
 */
export function syncStripePlans() {
  return api.post<void>("/billing/stripe/sync-plans");
}
