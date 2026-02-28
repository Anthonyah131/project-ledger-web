// types/admin-user.ts
// Types for the Admin Users management endpoints (GET /admin/users, etc.)

// ─── Embedded plan summary ──────────────────────────────────────────────────

export interface AdminUserPlanDto {
  id: string;
  name: string;
  slug: string;
}

// ─── User response returned by admin endpoints ──────────────────────────────

export interface AdminUserResponse {
  id: string;
  email: string;
  fullName: string;
  planId: string;
  plan: AdminUserPlanDto;
  isActive: boolean;
  isAdmin: boolean;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

// ─── Paginated list response ────────────────────────────────────────────────

export interface AdminUsersPageResponse {
  items: AdminUserResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Query params for listing users ─────────────────────────────────────────

export interface GetAdminUsersParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  includeDeleted?: boolean;
}

// ─── Update user request ────────────────────────────────────────────────────

export interface UpdateAdminUserRequest {
  fullName: string;
  avatarUrl?: string | null;
  planId?: string;
  isAdmin?: boolean;
}
