// types/user.ts
// User model type definitions

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
