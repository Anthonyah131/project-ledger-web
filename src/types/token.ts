// types/token.ts
// Token & authentication response type definitions

import type { User } from "@/types/user";

// ─── Responses ─────────────────────────────────────────────────────────────────

/** Returned by login, register, and refresh endpoints */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: User;
}

/** Generic message response (logout, password reset, etc.) */
export interface MessageResponse {
  message: string;
}

// ─── Request bodies ────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RevokeRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
}
