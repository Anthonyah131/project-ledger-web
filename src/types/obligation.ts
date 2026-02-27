// types/obligation.ts
// Financial obligation (debt) model type definitions

/**
 * Calculated at app level — NOT stored in the database.
 *
 * open           → no payments recorded
 * partially_paid → partial payments (sum < totalAmount)
 * paid           → sum of payments >= totalAmount
 * overdue        → dueDate < now() AND remaining balance > 0
 */
export type ObligationStatus = 'open' | 'partially_paid' | 'paid' | 'overdue';

export interface Obligation {
  id: string;
  /** FK → projects */
  projectId: string;
  /** FK → users — who recorded this obligation */
  createdByUserId: string;
  title: string;
  description: string | null;
  /** Total debt amount (> 0) */
  totalAmount: number;
  /** Currency of the obligation (ISO 4217, FK → currencies) */
  currency: string;
  /** Due date (YYYY-MM-DD); null = no due date */
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
}

/** Obligation enriched with computed balance fields (app-level calculation) */
export interface ObligationWithBalance extends Obligation {
  /** Sum of all non-deleted expense payments against this obligation */
  paidAmount: number;
  /** totalAmount - paidAmount */
  remainingAmount: number;
  status: ObligationStatus;
}

// ─── API shapes ───────────────────────────────────────────────────────────────

export interface ObligationResponse {
  id: string;
  projectId: string;
  createdByUserId: string;
  title: string;
  description: string | null;
  totalAmount: number;
  currency: string;              // ISO 4217
  dueDate: string | null;        // "YYYY-MM-DD"
  paidAmount: number;
  remainingAmount: number;
  status: ObligationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ObligationsPageResponse {
  items: ObligationResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateObligationRequest {
  title: string;
  description?: string | null;
  totalAmount: number;
  currency: string;
  dueDate?: string | null;       // "YYYY-MM-DD"
}

export interface UpdateObligationRequest {
  title: string;
  description?: string | null;
  totalAmount: number;
  dueDate?: string | null;       // "YYYY-MM-DD"
}
