import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/category-service";
import {
  createSuccessResponse,
  createFetchMock,
  setupFetchMock,
  getLastFetchUrl,
  getLastFetchMethod,
  getLastFetchBody,
  getLastFetchHeaders,
} from "../mocks/api-client-mock";
import type { CategoryResponse } from "@/types/category";

const API_BASE_URL = "http://localhost:5192/api";
const PROJECT_ID = "proj-1";

describe("category-service", () => {
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

  describe("getCategories", () => {
    it("should call GET /projects/:id/categories", async () => {
      const mockResponse: CategoryResponse[] = [createMockCategoryResponse()];
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getCategories(PROJECT_ID);

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/categories`);
      expect(result).toEqual(mockResponse);
    });

    it("should include Authorization header", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse([createMockCategoryResponse()])]);

      await getCategories(PROJECT_ID);

      const headers = getLastFetchHeaders(mockFetch);
      expect(headers["Authorization"]).toBe("Bearer test-token");
    });
  });

  describe("getCategory", () => {
    it("should call GET /projects/:id/categories/:categoryId", async () => {
      const mockResponse = createMockCategoryResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getCategory(PROJECT_ID, "cat-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/categories/cat-1`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createCategory", () => {
    it("should call POST /projects/:id/categories", async () => {
      const mockResponse = createMockCategoryResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await createCategory(PROJECT_ID, {
        name: "Food & Dining",
        description: "Expenses related to food",
        budgetAmount: 500,
      });

      expect(getLastFetchMethod(mockFetch)).toBe("POST");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/categories`);
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.name).toBe("Food & Dining");
      expect(body.description).toBe("Expenses related to food");
      expect(body.budgetAmount).toBe(500);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateCategory", () => {
    it("should call PUT /projects/:id/categories/:categoryId", async () => {
      const mockResponse = createMockCategoryResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await updateCategory(PROJECT_ID, "cat-1", {
        name: "Updated Category",
        description: "Updated description",
        budgetAmount: 1000,
      });

      expect(getLastFetchMethod(mockFetch)).toBe("PUT");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/categories/cat-1`);
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.name).toBe("Updated Category");
      expect(body.budgetAmount).toBe(1000);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteCategory", () => {
    it("should call DELETE /projects/:id/categories/:categoryId", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await deleteCategory(PROJECT_ID, "cat-1");

      expect(getLastFetchMethod(mockFetch)).toBe("DELETE");
      expect(getLastFetchUrl(mockFetch)).toContain(`/projects/${PROJECT_ID}/categories/cat-1`);
    });
  });
});

function createMockCategoryResponse(): CategoryResponse {
  return {
    id: "cat-1",
    projectId: PROJECT_ID,
    name: "Food & Dining",
    description: "Expenses related to food",
    isDefault: false,
    budgetAmount: 500,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-04-24T00:00:00Z",
  };
}
