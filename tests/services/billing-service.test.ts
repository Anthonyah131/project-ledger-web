import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getBillingStatus,
  getMySubscription,
  createCheckoutSession,
  changePlan,
  cancelSubscription,
  syncStripePlans,
  isStripeDisabledError,
} from "@/services/billing-service";
import {
  createSuccessResponse,
  createErrorResponse,
  createFetchMock,
  setupFetchMock,
  getLastFetchUrl,
  getLastFetchMethod,
  getLastFetchBody,
  getLastFetchHeaders,
} from "../mocks/api-client-mock";
import type {
  BillingStatusResponse,
  BillingSubscriptionResponse,
  CreateCheckoutSessionResponse,
} from "@/types/subscription";
import { ApiClientError } from "@/lib/api-client";

const API_BASE_URL = "http://localhost:5192/api";

describe("billing-service", () => {
  let mockFetch: ReturnType<typeof createFetchMock>;

  beforeEach(() => {
    mockFetch = createFetchMock();
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_BASE_URL);
    vi.stubEnv("NEXT_PUBLIC_ENV", "test");
    localStorage.setItem("accessToken", "test-token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getBillingStatus", () => {
    it("should call GET /billing/status", async () => {
      const mockResponse: BillingStatusResponse = {
        stripeEnabled: true,
        reason: null,
      };
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getBillingStatus();

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/billing/status");
      expect(result).toEqual(mockResponse);
    });

    it("should include Authorization header", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse({ stripeEnabled: true, reason: null })]);

      await getBillingStatus();

      const headers = getLastFetchHeaders(mockFetch);
      expect(headers["Authorization"]).toBe("Bearer test-token");
    });
  });

  describe("getMySubscription", () => {
    it("should call GET /billing/subscription/me", async () => {
      const mockResponse = createMockSubscriptionResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getMySubscription();

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/billing/subscription/me");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createCheckoutSession", () => {
    it("should call POST /billing/stripe/create-checkout-session", async () => {
      const mockResponse: CreateCheckoutSessionResponse = {
        checkoutUrl: "https://checkout.stripe.com/test",
        sessionId: "session-123",
      };
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await createCheckoutSession({ planId: "plan-pro" });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain("/billing/stripe/create-checkout-session");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.planId).toBe("plan-pro");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("changePlan", () => {
    it("should call POST /billing/subscription/change-plan", async () => {
      const mockResponse = createMockSubscriptionResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await changePlan({ planId: "plan-enterprise", prorate: true });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain("/billing/subscription/change-plan");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.planId).toBe("plan-enterprise");
      expect(body.prorate).toBe(true);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("cancelSubscription", () => {
    it("should call POST /billing/subscription/cancel", async () => {
      const mockResponse = createMockSubscriptionResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await cancelSubscription({ cancelAtPeriodEnd: true });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain("/billing/subscription/cancel");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.cancelAtPeriodEnd).toBe(true);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("syncStripePlans", () => {
    it("should call POST /billing/stripe/sync-plans", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await syncStripePlans();

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain("/billing/stripe/sync-plans");
    });
  });

  describe("isStripeDisabledError", () => {
    it("should return true for 503 with STRIPE_DISABLED code", () => {
      const error = new ApiClientError(503, { code: "STRIPE_DISABLED", message: "Stripe is disabled" });

      expect(isStripeDisabledError(error)).toBe(true);
    });

    it("should return false for other errors", () => {
      const error = new ApiClientError(400, { message: "Bad request" });

      expect(isStripeDisabledError(error)).toBe(false);
    });

    it("should return false for non-ApiClientError", () => {
      expect(isStripeDisabledError(new Error("generic"))).toBe(false);
    });
  });
});

function createMockSubscriptionResponse(): BillingSubscriptionResponse {
  return {
    userId: "user-1",
    planId: "plan-pro",
    planName: "Pro",
    planSlug: "pro",
    stripeSubscriptionId: "sub_123",
    stripeCustomerId: "cus_123",
    stripePriceId: "price_123",
    status: "active",
    cancelAtPeriodEnd: false,
    autoRenews: true,
    willDowngradeToFree: false,
    downgradeToFreeAt: null,
    currentPeriodStart: "2025-04-01T00:00:00Z",
    currentPeriodEnd: "2025-05-01T00:00:00Z",
    canceledAt: null,
    updatedAt: "2025-04-01T00:00:00Z",
  };
}
