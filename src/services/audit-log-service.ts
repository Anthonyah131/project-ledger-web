// services/audit-log-service.ts
// API calls for audit log endpoints (read-only).
// All endpoints require authentication.

import { api } from "@/lib/api-client";
import type {
  AuditLogsPageResponse,
  AuditEntityName,
} from "@/types/audit-log";

// ─── Query params ──────────────────────────────────────────────────────────────

export interface GetAuditLogsParams {
  page?: number;
  pageSize?: number;
}

// ─── My audit logs ──────────────────────────────────────────────────────────

/**
 * GET /api/audit-logs/me
 * Lists actions performed by the authenticated user.
 * Always sorted by date descending (sortBy/sortDirection are ignored by the API).
 */
export function getMyAuditLogs(params: GetAuditLogsParams = {}) {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize));

  const qs = query.toString();
  const url = qs ? `/audit-logs/me?${qs}` : "/audit-logs/me";

  return api.get<AuditLogsPageResponse>(url);
}

// ─── Entity audit logs ──────────────────────────────────────────────────────

/**
 * GET /api/audit-logs/entity/{entityName}/{entityId}
 * Lists the change history for a specific entity.
 * Useful for "who changed this and when" in detail views.
 *
 * @param entityName — e.g. "Project", "Expense", "Category", "Obligation", "ProjectBudget"
 * @param entityId   — UUID of the entity
 */
export function getEntityAuditLogs(
  entityName: AuditEntityName,
  entityId: string,
  params: GetAuditLogsParams = {}
) {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize));

  const qs = query.toString();
  const url = qs
    ? `/audit-logs/entity/${entityName}/${entityId}?${qs}`
    : `/audit-logs/entity/${entityName}/${entityId}`;

  return api.get<AuditLogsPageResponse>(url);
}
