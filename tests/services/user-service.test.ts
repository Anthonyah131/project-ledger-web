import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
} from "@/services/user-service";
import {
  createSuccessResponse,
  createFetchMock,
  setupFetchMock,
  getLastFetchUrl,
  getLastFetchMethod,
  getLastFetchBody,
  getLastFetchHeaders,
} from "../mocks/api-client-mock";
import type { UserProfileResponse } from "@/types/user";

const API_BASE_URL = "http://localhost:5192/api";

describe("user-service", () => {
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

  describe("getUserProfile", () => {
    it("should call GET /users/profile", async () => {
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

  describe("updateUserProfile", () => {
    it("should call PUT /users/profile", async () => {
      const mockResponse = createMockUserProfileResponse();
      setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

      const result = await updateUserProfile({
        fullName: "Updated Name",
        avatarUrl: "https://example.com/avatar.png",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("PUT");
      expect(getLastFetchUrl(mockFetch)).toContain("/users/profile");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.fullName).toBe("Updated Name");
      expect(body.avatarUrl).toBe("https://example.com/avatar.png");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("changePassword", () => {
    it("should call PUT /users/password", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await changePassword({
        currentPassword: "OldPass123!",
        newPassword: "NewPass456!",
      });

      expect(getLastFetchMethod(mockFetch)).toBe("PUT");
      expect(getLastFetchUrl(mockFetch)).toContain("/users/password");
      const body = JSON.parse(getLastFetchBody(mockFetch) ?? "{}");
      expect(body.currentPassword).toBe("OldPass123!");
      expect(body.newPassword).toBe("NewPass456!");
    });
  });

  describe("deleteAccount", () => {
    it("should call DELETE /users/account", async () => {
      setupFetchMock(mockFetch, [createSuccessResponse(undefined)]);

      await deleteAccount();

      expect(getLastFetchMethod(mockFetch)).toBe("DELETE");
      expect(getLastFetchUrl(mockFetch)).toContain("/users/account");
    });
  });
});

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
    planId: "plan-free",
    plan: null,
  };
}
