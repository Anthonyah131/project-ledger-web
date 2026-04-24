import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getProjectBudget,
  setProjectBudget,
  deleteProjectBudget,
} from "@/services/budget-service";
import {
  createSuccessResponse,
  createFetchMock,
  setupFetchMock,
  getLastFetchUrl,
  getLastFetchMethod,
  getLastFetchBody,
  getLastFetchHeaders,
} from "../mocks/api-client-mock";
import type { ProjectBudgetResponse } from "@/types/project-budget";

const API_BASE_URL = "http://localhost:5192/api";
const PROJECT_ID = "proj-1";

describe("budget-service", () => {
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

  describe("getProjectBudget", () => {
    it("should call GET /projects/:id/budget", async () => {
      const mockResponse = createMockBudgetResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getProjectBudget(PROJECT_ID);

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/budget`);
      expect(result).toEqual(mockResponse);
    });

    it("should include Authorization header", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockBudgetResponse())]);

      await getProjectBudget(PROJECT_ID);

      const headers = getLastFetchHeaders(mockFetch);
      expect(headers["Authorization"]).toBe("Bearer test-token");
    });
  });

  describe("setProjectBudget", () => {
    it("should call PUT /projects/:id/budget with data", async () => {
      const mockResponse = createMockBudgetResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await setProjectBudget(PROJECT_ID, {
        totalBudget: 5000,
        alertPercentage: 80,
      });

      expect(getLastFetchMethod(mockFetch)).toBe("PUT");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/budget`);
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.totalBudget).toBe(5000);
      expect(body.alertPercentage).toBe(80);
      expect(result).toEqual(mockResponse);
    });

    it("should work without alertPercentage (optional)", async () => {
      const mockResponse = createMockBudgetResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await setProjectBudget(PROJECT_ID, { totalBudget: 5000 });

      expect(getLastFetchMethod(mockFetch)).toBe("PUT");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.totalBudget).toBe(5000);
      expect(body.alertPercentage).toBeUndefined();
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteProjectBudget", () => {
    it("should call DELETE /projects/:id/budget", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await deleteProjectBudget(PROJECT_ID);

      expect(getLastFetchMethod(mockFetch)).toBe("DELETE");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/budget`);
    });
  });
});

function createMockBudgetResponse(): ProjectBudgetResponse {
  return {
    id: "budget-1",
    projectId: PROJECT_ID,
    totalBudget: 5000,
    alertPercentage: 80,
    spentAmount: 1500,
    remainingAmount: 3500,
    spentPercentage: 30,
    isAlertTriggered: false,
    alertLevel: "normal",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-04-24T00:00:00Z",
  };
}
