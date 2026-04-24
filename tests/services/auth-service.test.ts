import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  login,
  register,
  refreshTokens,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getGoogleLoginUrl,
  getMe,
  revokeToken,
  revokeAllTokens,
} from "@/services/auth-service";
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
import type { AuthResponse, MessageResponse, MeResponse } from "@/types/token";
import type { User } from "@/types/user";

const API_BASE_URL = "http://localhost:5192/api";

describe("auth-service", () => {
  let mockFetch: ReturnType<typeof createFetchMock>;

  beforeEach(() => {
    mockFetch = createFetchMock();
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_BASE_URL);
    vi.stubEnv("NEXT_PUBLIC_ENV", "test");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("public endpoints (skipAuth)", () => {
    describe("login", () => {
      it("should call POST /auth/login with credentials", async () => {
        const mockResponse: AuthResponse = {
          accessToken: "access-token",
          refreshToken: "refresh-token",
          accessTokenExpiresAt: "2025-04-25T00:00:00Z",
          user: createMockUser(),
        };
        setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

        const result = await login({ email: "test@example.com", password: "password123" });

        expect(getLastFetchMethod(mockFetch)).toBe("POST");
        expect(getLastFetchUrl(mockFetch)).toContain("/auth/login");
        expect(JSON.parse(getLastFetchBody(mockFetch) ?? "{}")).toEqual({
          email: "test@example.com",
          password: "password123",
        });
        const headers = getLastFetchHeaders(mockFetch);
        expect(headers["Authorization"]).toBeUndefined();
        expect(result).toEqual(mockResponse);
      });

      it("should return ApiClientError on invalid credentials", async () => {
        setupFetchMock(mockFetch, [
          createErrorResponse(401, { message: "Invalid credentials" }),
        ]);

        await expect(login({ email: "bad@example.com", password: "wrong" })).rejects.toThrow();
      });
    });

    describe("register", () => {
      it("should call POST /auth/register with user data", async () => {
        const mockResponse: AuthResponse = {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
          accessTokenExpiresAt: "2025-04-25T00:00:00Z",
          user: createMockUser(),
        };
        setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

        const result = await register({
          email: "new@example.com",
          password: "SecurePass123!",
          fullName: "New User",
        });

        expect(getLastFetchMethod(mockFetch)).toBe("POST");
        expect(getLastFetchUrl(mockFetch)).toContain("/auth/register");
        expect(JSON.parse(getLastFetchBody(mockFetch) ?? "{}")).toEqual({
          email: "new@example.com",
          password: "SecurePass123!",
          fullName: "New User",
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe("refreshTokens", () => {
      it("should call POST /auth/refresh with refresh token", async () => {
        const mockResponse: AuthResponse = {
          accessToken: "refreshed-access-token",
          refreshToken: "refreshed-refresh-token",
          accessTokenExpiresAt: "2025-04-25T00:00:00Z",
          user: createMockUser(),
        };
        setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

        const result = await refreshTokens({ refreshToken: "some-refresh-token" });

        expect(getLastFetchMethod(mockFetch)).toBe("POST");
        expect(getLastFetchUrl(mockFetch)).toContain("/auth/refresh");
        expect(JSON.parse(getLastFetchBody(mockFetch) ?? "{}")).toEqual({
          refreshToken: "some-refresh-token",
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe("forgotPassword", () => {
      it("should call POST /auth/forgot-password", async () => {
        const mockResponse: MessageResponse = { message: "Reset link sent" };
        setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

        const result = await forgotPassword({ email: "user@example.com" });

        expect(getLastFetchMethod(mockFetch)).toBe("POST");
        expect(getLastFetchUrl(mockFetch)).toContain("/auth/forgot-password");
        expect(result).toEqual(mockResponse);
      });
    });

    describe("verifyOtp", () => {
      it("should call POST /auth/verify-otp", async () => {
        const mockResponse: MessageResponse = { message: "OTP verified" };
        setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

        const result = await verifyOtp({ email: "user@example.com", otpCode: "123456" });

        expect(getLastFetchMethod(mockFetch)).toBe("POST");
        expect(getLastFetchUrl(mockFetch)).toContain("/auth/verify-otp");
        expect(JSON.parse(getLastFetchBody(mockFetch) ?? "{}")).toEqual({
          email: "user@example.com",
          otpCode: "123456",
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe("resetPassword", () => {
      it("should call POST /auth/reset-password", async () => {
        const mockResponse: MessageResponse = { message: "Password updated" };
        setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

        const result = await resetPassword({
          email: "user@example.com",
          otpCode: "123456",
          newPassword: "NewSecurePass123!",
        });

        expect(getLastFetchMethod(mockFetch)).toBe("POST");
        expect(getLastFetchUrl(mockFetch)).toContain("/auth/reset-password");
        expect(JSON.parse(getLastFetchBody(mockFetch) ?? "{}")).toEqual({
          email: "user@example.com",
          otpCode: "123456",
          newPassword: "NewSecurePass123!",
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getGoogleLoginUrl", () => {
      it("should return Google OAuth URL", () => {
        const url = getGoogleLoginUrl();
        expect(url).toContain("/auth/google/login");
      });
    });
  });

  describe("authenticated endpoints", () => {
    beforeEach(() => {
      localStorage.setItem("accessToken", "test-access-token");
    });

    describe("getMe", () => {
      it("should call GET /auth/me with Bearer token", async () => {
        const mockResponse: MeResponse = { userId: "user-1", email: "test@example.com" };
        setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

        const result = await getMe();

        expect(getLastFetchMethod(mockFetch)).toBe("GET");
        expect(getLastFetchUrl(mockFetch)).toContain("/auth/me");
        const headers = getLastFetchHeaders(mockFetch);
        expect(headers["Authorization"]).toBe("Bearer test-access-token");
        expect(result).toEqual(mockResponse);
      });
    });

    describe("revokeToken", () => {
      it("should call POST /auth/revoke with token", async () => {
        const mockResponse: MessageResponse = { message: "Token revoked" };
        setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

        const result = await revokeToken({ refreshToken: "token-to-revoke" });

        expect(getLastFetchMethod(mockFetch)).toBe("POST");
        expect(getLastFetchUrl(mockFetch)).toContain("/auth/revoke");
        expect(JSON.parse(getLastFetchBody(mockFetch) ?? "{}")).toEqual({
          refreshToken: "token-to-revoke",
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe("revokeAllTokens", () => {
      it("should call POST /auth/revoke-all", async () => {
        const mockResponse: MessageResponse = { message: "All tokens revoked" };
        setupFetchMock(mockFetch, [createSuccessResponse(mockResponse)]);

        const result = await revokeAllTokens();

        expect(getLastFetchMethod(mockFetch)).toBe("POST");
        expect(getLastFetchUrl(mockFetch)).toContain("/auth/revoke-all");
        expect(result).toEqual(mockResponse);
      });
    });
  });
});

function createMockUser(): User {
  return {
    id: "user-1",
    email: "test@example.com",
    fullName: "Test User",
    planId: "plan-free",
    isActive: true,
    isAdmin: false,
    avatarUrl: null,
    lastLoginAt: "2025-04-24T00:00:00Z",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-04-24T00:00:00Z",
    isDeleted: false,
    deletedAt: null,
    deletedByUserId: null,
  };
}
