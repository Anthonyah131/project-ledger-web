// services/billing-service.ts
// Stripe billing endpoints consumed by the frontend.

import { ApiClientError, api } from "@/lib/api-client";
import type {
  BillingStatusResponse,
  BillingSubscriptionResponse,
  CancelSubscriptionRequest,
  ChangePlanRequest,
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  StripeDisabledErrorResponse,
} from "@/types/subscription";

function isStripeDisabledPayload(data: unknown): data is StripeDisabledErrorResponse {
  if (!data || typeof data !== "object") return false;

  const value = data as { code?: unknown };
  return value.code === "STRIPE_DISABLED";
}

/**
 * GET /api/billing/status
 * Returns billing feature status for current environment.
 */
export function getBillingStatus() {
  return api.get<BillingStatusResponse>("/billing/status");
}

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
  if (!(err instanceof ApiClientError)) return false;
  return err.status === 503 && isStripeDisabledPayload(err.data);
}
