// types/user.ts
// User model type definitions

import type { PlanSummaryDto } from "@/types/plan";

export interface User {
  id: string;
  email: string;
  fullName: string;
  /** FK → plans — assigned subscription plan */
  planId: string;
  isActive: boolean;
  isAdmin: boolean;
  avatarUrl: string | null;
  /** Timestamp of the user's last successful login */
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  /** FK → users (self) — admin who performed the logical delete */
  deletedByUserId: string | null;
}

/** Returned by GET /auth/me — lightweight, reads from JWT claims only */
export interface MeResponse {
  userId: string;
  email: string;
}

/** Returned by GET /api/users/profile — full profile with embedded plan summary */
export interface UserProfileResponse {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  isActive: boolean;
  isAdmin: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  /** FK → plans — can exist even when there is no users_plan/subscription row */
  planId?: string | null;
  /** Embedded plan summary; null if user has no plan assigned */
  plan: PlanSummaryDto | null;
}

// ─── Profile write requests ──────────────────────────────────────────────────

/** PUT /api/users/profile */
export interface UpdateProfileRequest {
  fullName: string;        // 1–255 characters
  avatarUrl?: string;      // optional, must be a valid URL
}

/** PUT /api/users/password */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;     // minimum 8 characters
}
