import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getUsers,
  getUser,
  activateUser,
  deactivateUser,
  updateUser,
  deleteUser,
} from "@/services/admin-user-service";
import {
  createSuccessResponse,
  createFetchMock,
  setupFetchMock,
  getLastFetchUrl,
  getLastFetchMethod,
  getLastFetchBody,
  getLastFetchHeaders,
} from "../mocks/api-client-mock";
import type {
  AdminUsersPageResponse,
  AdminUserResponse,
} from "@/types/admin-user";

const API_BASE_URL = "http://localhost:5192/api";

describe("admin-user-service", () => {
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

  describe("getUsers", () => {
    it("should call GET /admin/users", async () => {
      const mockResponse = createMockAdminUsersPageResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getUsers();

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/admin/users");
      expect(result).toEqual(mockResponse);
    });

    it("should build correct query params", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockAdminUsersPageResponse())]);

      await getUsers({
        page: 2,
        pageSize: 25,
        sortBy: "email",
        sortDirection: "desc",
        includeDeleted: true,
      });

      const url = getLastFetchUrl(mockFetch);
      expect(url).toContain("page=2");
      expect(url).toContain("pageSize=25");
      expect(url).toContain("sortBy=email");
      expect(url).toContain("sortDirection=desc");
      expect(url).toContain("includeDeleted=true");
    });

    it("should include Authorization header", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(createMockAdminUsersPageResponse())]);

      await getUsers();

      const headers = getLastFetchHeaders(mockFetch);
      expect(headers["Authorization"]).toBe("Bearer test-token");
    });
  });

  describe("getUser", () => {
    it("should call GET /admin/users/:id", async () => {
      const mockResponse = createMockAdminUserResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await getUser("user-1");

      expect(getLastFetchMethod(mockFetch)).toBe("GET");
      expect(getLastFetchUrl(mockFetch)).toContain("/admin/users/user-1");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("activateUser", () => {
    it("should call PUT /admin/users/:id/activate", async () => {
      const mockResponse = createMockAdminUserResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await activateUser("user-1");

      expect(getLastFetchMethod(mockFetch)).toBe("PUT");
      expect(getLastFetchUrl(mockFetch)).toContain("/admin/users/user-1/activate");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body).toEqual({});
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deactivateUser", () => {
    it("should call PUT /admin/users/:id/deactivate", async () => {
      const mockResponse = createMockAdminUserResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await deactivateUser("user-1");

      expect(getLastFetchMethod(mockFetch)).toBe("PUT");
      expect(getLastFetchUrl(mockFetch)).toContain("/admin/users/user-1/deactivate");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body).toEqual({});
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateUser", () => {
    it("should call PUT /admin/users/:id", async () => {
      const mockResponse = createMockAdminUserResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await updateUser("user-1", {
        fullName: "Updated User",
        planId: "plan-pro",
        isAdmin: true,
      });

      expect(getLastFetchMethod(mockFetch)).toBe("PUT");
      expect(getLastFetchUrl(mockFetch)).toContain("/admin/users/user-1");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.fullName).toBe("Updated User");
      expect(body.planId).toBe("plan-pro");
      expect(body.isAdmin).toBe(true);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteUser", () => {
    it("should call DELETE /admin/users/:id", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await deleteUser("user-1");

      expect(getLastFetchMethod(mockFetch)).toBe("DELETE");
      expect(getLastFetchUrl(mockFetch)).toContain("/admin/users/user-1");
    });
  });
});

function createMockAdminUsersPageResponse(): AdminUsersPageResponse {
  return {
    items: [createMockAdminUserResponse()],
    totalCount: 1,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  };
}

function createMockAdminUserResponse(): AdminUserResponse {
  return {
    id: "user-1",
    email: "admin@example.com",
    fullName: "Admin User",
    planId: "plan-pro",
    plan: {
      id: "plan-pro",
      name: "Pro",
      slug: "pro",
    },
    isActive: true,
    isAdmin: true,
    avatarUrl: null,
    lastLoginAt: "2025-04-24T00:00:00Z",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-04-24T00:00:00Z",
    isDeleted: false,
  };
}
