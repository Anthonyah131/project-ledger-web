import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getObligations,
  getObligation,
  createObligation,
  updateObligation,
  deleteObligation,
} from "@/services/obligation-service";
import {
  createSuccessResponse,
  createFetchMock,
  setupFetchMock,
  getLastFetchUrl,
  getLastFetchMethod,
  getLastFetchBody,
  getLastFetchHeaders,
} from "../mocks/api-client-mock";
import type { ObligationResponse, ObligationsPageResponse } from "@/types/obligation";

const API_BASE_URL = "http://localhost:5192/api";
const PROJECT_ID = "proj-1";

describe("obligation-service", () => {
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

  describe("getObligations", () => {
    it("should call GET /projects/:id/obligations", async () => {
      const mockResponse = createMockObligationsPageResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getObligations(PROJECT_ID);

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/obligations`);
      expect(result).toEqual(mockResponse);
    });

    it("should build correct query params", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockObligationsPageResponse())]);

      await getObligations(PROJECT_ID, {
        page: 2,
        pageSize: 20,
        sortBy: "dueDate",
        sortDirection: "asc",
      });

      const url = getLastFetchUrl(mockFetch);
      expect(url).toContain("page=2");
      expect(url).toContain("pageSize=20");
      expect(url).toContain("sortBy=dueDate");
      expect(url).toContain("sortDirection=asc");
    });

    it("should include Authorization header", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockObligationsPageResponse())]);

      await getObligations(PROJECT_ID);

      const headers = getLastFetchHeaders(mockFetch);
      expect(headers["Authorization"]).toBe("Bearer test-token");
    });
  });

  describe("getObligation", () => {
    it("should call GET /projects/:id/obligations/:obligationId", async () => {
      const mockResponse = createMockObligationResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getObligation(PROJECT_ID, "obligation-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/obligations/obligation-1`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createObligation", () => {
    it("should call POST /projects/:id/obligations", async () => {
      const mockResponse = createMockObligationResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await createObligation(PROJECT_ID, {
        title: "Office Rent",
        description: "Monthly rent payment",
        totalAmount: 1000,
        currency: "USD",
        dueDate: "2025-05-01",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/obligations`);
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.title).toBe("Office Rent");
      expect(body.totalAmount).toBe(1000);
      expect(body.currency).toBe("USD");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateObligation", () => {
    it("should call PUT /projects/:id/obligations/:obligationId", async () => {
      const mockResponse = createMockObligationResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await updateObligation(PROJECT_ID, "obligation-1", {
        title: "Updated Rent",
        description: "Updated description",
        totalAmount: 1200,
        dueDate: "2025-06-01",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("PUT");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/obligations/obligation-1`);
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.title).toBe("Updated Rent");
      expect(body.totalAmount).toBe(1200);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteObligation", () => {
    it("should call DELETE /projects/:id/obligations/:obligationId", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await deleteObligation(PROJECT_ID, "obligation-1");

      expect(getLastFetchMethod(mockFetch)).toBe("DELETE");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/obligations/obligation-1`);
    });
  });
});

function createMockObligationsPageResponse(): ObligationsPageResponse {
  return {
    items: [createMockObligationResponse()],
    page: 1,
    pageSize: 12,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}

function createMockObligationResponse(): ObligationResponse {
  return {
    id: "obligation-1",
    projectId: PROJECT_ID,
    createdByUserId: "user-1",
    title: "Office Rent",
    description: "Monthly rent payment",
    totalAmount: 1000,
    currency: "USD",
    dueDate: "2025-05-01",
    paidAmount: 0,
    remainingAmount: 1000,
    status: "open",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-04-24T00:00:00Z",
  };
}
