import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getPlans,
  getPlan,
  getUserProfile,
} from "@/services/plan-service";
import {
  createSuccessResponse,
  createFetchMock,
  setupFetchMock,
  getLastFetchUrl,
  getLastFetchMethod,
  getLastFetchHeaders,
} from "../mocks/api-client-mock";
import type { PlanResponse } from "@/types/plan";
import type { UserProfileResponse } from "@/types/user";

const API_BASE_URL = "http://localhost:5192/api";

describe("plan-service", () => {
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

  describe("getPlans", () => {
    it("should call GET /plans without auth header (public endpoint)", async () => {
      const mockResponse: PlanResponse[] = [createMockPlanResponse()];
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPlans();

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/plans");
      const headers = getLastFetchHeaders(mockFetch);
      expect(headers["Authorization"]).toBeUndefined();
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getPlan", () => {
    it("should call GET /plans/:idOrSlug without auth header (public endpoint)", async () => {
      const mockResponse = createMockPlanResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPlan("pro");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/plans/pro");
      const headers = getLastFetchHeaders(mockFetch);
      expect(headers["Authorization"]).toBeUndefined();
      expect(result).toEqual(mockResponse);
    });

    it("should work with GUID id", async () => {
      const mockResponse = createMockPlanResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getPlan("12345678-1234-1234-1234-123456789012");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/plans/12345678-1234-1234-1234-123456789012");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getUserProfile", () => {
    it("should call GET /users/profile with auth header", async () => {
      const mockResponse = createMockUserProfileResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getUserProfile();

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/users/profile");
      const headers = getLastFetchHeaders(mockFetch);
      expect(headers["Authorization"]).toBe("Bearer test-token");
      expect(result).toEqual(mockResponse);
    });
  });
});

function createMockPlanResponse(): PlanResponse {
  return {
    id: "plan-pro",
    name: "Pro",
    slug: "pro",
    description: "Pro plan for power users",
    displayOrder: 2,
    monthlyPrice: 9.99,
    currency: "USD",
    stripePaymentLinkUrl: "https://pay.stripe.com/test",
    permissions: {
      canCreateProjects: true,
      canEditProjects: true,
      canDeleteProjects: true,
      canShareProjects: true,
      canExportData: true,
      canUseAdvancedReports: true,
      canUseOcr: true,
      canUseApi: true,
      canUseMultiCurrency: true,
      canSetBudgets: true,
      canUsePartners: true,
    },
    limits: {
      maxProjects: 10,
      maxExpensesPerMonth: 1000,
      maxCategoriesPerProject: 20,
      maxPaymentMethods: 5,
      maxTeamMembersPerProject: 5,
      maxAlternativeCurrenciesPerProject: 3,
      maxIncomesPerMonth: 500,
      maxDocumentReadsPerMonth: 50,
    },
  };
}

function createMockUserProfileResponse(): UserProfileResponse {
  return {
    id: "user-1",
    email: "user@example.com",
    fullName: "Test User",
    avatarUrl: null,
    isActive: true,
    isAdmin: false,
    lastLoginAt: "2025-04-24T00:00:00Z",
    createdAt: "2025-01-01T00:00:00Z",
    planId: "plan-pro",
    plan: {
      id: "plan-pro",
      name: "Pro",
      slug: "pro",
      permissions: {
        canCreateProjects: true,
        canEditProjects: true,
        canDeleteProjects: true,
        canShareProjects: true,
        canExportData: true,
        canUseAdvancedReports: true,
        canUseOcr: true,
        canUseApi: true,
        canUseMultiCurrency: true,
        canSetBudgets: true,
        canUsePartners: true,
      },
    },
  };
}
