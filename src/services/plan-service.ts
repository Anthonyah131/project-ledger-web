// services/plan-service.ts
// API calls for the Plans endpoints.
// Public endpoints (getPlans, getPlan) do not require authentication.
// getUserProfile requires a valid Bearer token.

import { api } from "@/lib/api-client";
import type { PlanResponse } from "@/types/plan";
import type { UserProfileResponse } from "@/types/user";

// ─── Public endpoints ────────────────────────────────────────────────────────

/**
 * GET /api/plans
 * Returns all active plans ordered by displayOrder.
 * No authentication required.
 */
export function getPlans() {
  return api.get<PlanResponse[]>("/plans", { skipAuth: true });
}

/**
 * GET /api/plans/{idOrSlug}
 * Returns a single plan by its GUID or slug (e.g. "free", "pro").
 * No authentication required.
 */
export function getPlan(idOrSlug: string) {
  return api.get<PlanResponse>(`/plans/${idOrSlug}`, { skipAuth: true });
}

// ─── Authenticated endpoints ─────────────────────────────────────────────────

/**
 * GET /api/users/profile
 * Returns the full profile of the authenticated user, including plan summary.
 * Requires authentication.
 */
export function getUserProfile() {
  return api.get<UserProfileResponse>("/users/profile");
}
