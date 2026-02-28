// services/admin-user-service.ts
// API calls for the Admin Users management endpoints.

import { api } from "@/lib/api-client";
import type {
  AdminUserResponse,
  AdminUsersPageResponse,
  GetAdminUsersParams,
  UpdateAdminUserRequest,
} from "@/types/admin-user";

// ─── List (paginated) ───────────────────────────────────────────────────────

export function getUsers(params: GetAdminUsersParams = {}) {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortDirection) query.set("sortDirection", params.sortDirection);
  if (params.includeDeleted) query.set("includeDeleted", "true");

  const qs = query.toString();
  const url = qs ? `/admin/users?${qs}` : "/admin/users";
  return api.get<AdminUsersPageResponse>(url);
}

// ─── Single user ────────────────────────────────────────────────────────────

export function getUser(id: string) {
  return api.get<AdminUserResponse>(`/admin/users/${id}`);
}

// ─── Activate / Deactivate ──────────────────────────────────────────────────

export function activateUser(id: string) {
  return api.put<AdminUserResponse>(`/admin/users/${id}/activate`, {});
}

export function deactivateUser(id: string) {
  return api.put<AdminUserResponse>(`/admin/users/${id}/deactivate`, {});
}

// ─── Update ─────────────────────────────────────────────────────────────────

export function updateUser(id: string, data: UpdateAdminUserRequest) {
  return api.put<AdminUserResponse>(`/admin/users/${id}`, data);
}

// ─── Soft-delete ────────────────────────────────────────────────────────────

export function deleteUser(id: string) {
  return api.delete<void>(`/admin/users/${id}`);
}
