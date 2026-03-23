// types/common.ts
// Shared base interfaces for database models

/** Fields present on every auditable entity */
export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

/** Soft-delete fields shared by all logically-deletable entities */
export interface SoftDelete {
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
}

/** Convenience mixin: timestamps + soft delete */
export interface AuditableEntity extends Timestamps, SoftDelete {}

/** Shared mutation options for hooks that support orchestrated refetching */
export interface MutationOptions {
  refetch?: boolean;
}

// ─── API error response types (i18n) ──────────────────────────────────────────

/** Standardized API error response format `{ code, message }` */
export interface LocalizedError {
  code: string;
  message: string;
}

/** Plan count limit reached (e.g. max projects). Includes `feature` = the limit name. */
export interface PlanLimitError extends LocalizedError {
  code: "PLAN_LIMIT_EXCEEDED";
  feature: string;
}

/** Feature not available on the user's current plan. Includes `feature` = the permission name. */
export interface PlanDeniedError extends LocalizedError {
  code: "PLAN_DENIED";
  feature: string;
}
