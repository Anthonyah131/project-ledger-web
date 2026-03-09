// services/billing-service.ts
// Stripe billing endpoints consumed by the frontend.

import { ApiClientError, api } from "@/lib/api-client";
import type {
  BillingSubscriptionResponse,
  CancelSubscriptionRequest,
  ChangePlanRequest,
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
 * POST /api/billing/subscription/change-plan
 * Changes current subscription to another plan (upgrade/downgrade).
 */
export function changePlan(data: ChangePlanRequest) {
  return api.post<BillingSubscriptionResponse>("/billing/subscription/change-plan", data);
}

/**
 * POST /api/billing/subscription/cancel
 * Cancels current subscription immediately or at period end.
 */
export function cancelSubscription(data: CancelSubscriptionRequest) {
  return api.post<BillingSubscriptionResponse>("/billing/subscription/cancel", data);
}

/**
 * POST /api/billing/stripe/sync-plans
 * Technical/admin operation to sync plans with Stripe.
 */
export function syncStripePlans() {
  return api.post<void>("/billing/stripe/sync-plans");
}

/**
 * Stripe-billing-disabled mode returns HTTP 503 from billing endpoints.
 * Treat it as a feature-toggle state instead of a transient failure.
 */
export function isStripeDisabledError(err: unknown): err is ApiClientError {
  return err instanceof ApiClientError && err.status === 503;
}
