// services/user-service.ts
// API calls for user profile management endpoints.
// All endpoints require authentication.

import { api } from "@/lib/api-client";
import type {
  UserProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/types/user";

// ─── Profile ────────────────────────────────────────────────────────────────

/**
 * GET /api/users/profile
 * Returns the full profile of the authenticated user, including plan summary.
 */
export function getUserProfile() {
  return api.get<UserProfileResponse>("/users/profile");
}

/**
 * PUT /api/users/profile
 * Updates the authenticated user's full name and avatar URL.
 */
export function updateUserProfile(data: UpdateProfileRequest) {
  return api.put<UserProfileResponse>("/users/profile", data);
}

// ─── Password ───────────────────────────────────────────────────────────────

/**
 * PUT /api/users/password
 * Changes the authenticated user's password.
 * Returns 204 on success; 400 if the current password is incorrect.
 */
export function changePassword(data: ChangePasswordRequest) {
  return api.put<void>("/users/password", data);
}

// ─── Account deletion ───────────────────────────────────────────────────────

/**
 * DELETE /api/users/account
 * Soft-deletes the authenticated user's account.
 * The user is deactivated and cannot log in again.
 * Returns 204 on success.
 */
export function deleteAccount() {
  return api.delete<void>("/users/account");
}
