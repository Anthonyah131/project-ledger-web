// services/auth-service.ts
// Service layer for all authentication API calls.
// Uses the centralized api client — tokens & headers are handled automatically.

import { api } from "@/lib/api-client";
import type { MeResponse } from "@/types/user";
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RefreshRequest,
  RegisterRequest,
  ResetPasswordRequest,
  RevokeRequest,
} from "@/types/token";

// ─── Public endpoints (no token needed) ────────────────────────────────────────

export function login(data: LoginRequest) {
  return api.post<AuthResponse>("/auth/login", data, { skipAuth: true });
}

export function register(data: RegisterRequest) {
  return api.post<AuthResponse>("/auth/register", data, { skipAuth: true });
}

export function refreshTokens(data: RefreshRequest) {
  return api.post<AuthResponse>("/auth/refresh", data, { skipAuth: true });
}

export function forgotPassword(data: ForgotPasswordRequest) {
  return api.post<MessageResponse>("/auth/forgot-password", data, { skipAuth: true });
}

export function resetPassword(data: ResetPasswordRequest) {
  return api.post<MessageResponse>("/auth/reset-password", data, { skipAuth: true });
}

// ─── Authenticated endpoints ───────────────────────────────────────────────────

export function getMe() {
  return api.get<MeResponse>("/auth/me");
}

export function revokeToken(data: RevokeRequest) {
  return api.post<MessageResponse>("/auth/revoke", data);
}

export function revokeAllTokens() {
  return api.post<MessageResponse>("/auth/revoke-all");
}
