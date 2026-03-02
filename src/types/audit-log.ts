// types/audit-log.ts
// Audit log model type definitions

export type AuditActionType =
  | 'create'
  | 'update'
  | 'delete'
  | 'status_change'
  | 'associate'; // associate = linking an expense to an obligation

export interface AuditLog {
  id: string;
  /** Name of the affected entity table (e.g. "expenses", "obligations") */
  entityName: string;
  /** ID of the affected record */
  entityId: string;
  actionType: AuditActionType;
  /** FK → users — who performed the action */
  performedByUserId: string;
  performedAt: string;
  /** JSONB snapshot of the previous state; null on create */
  oldValues: Record<string, unknown> | null;
  /** JSONB snapshot of the new state; null on delete */
  newValues: Record<string, unknown> | null;
}

// ─── API shapes ───────────────────────────────────────────────────────────────

/** Returned by GET /api/audit-logs/* endpoints */
export interface AuditLogResponse {
  id: string;
  entityName: string;
  entityId: string;
  actionType: string;
  performedByUserId: string;
  performedByUserName: string | null;
  performedAt: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
}

/** Paginated response for audit-log endpoints */
export interface AuditLogsPageResponse {
  items: AuditLogResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** Valid entity names for entity-scoped audit-log queries */
export type AuditEntityName =
  | "Project"
  | "Expense"
  | "Category"
  | "Obligation"
  | "ProjectBudget";
