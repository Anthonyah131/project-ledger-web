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
