// types/project-budget.ts
// Project-level budget model type definitions

export interface ProjectBudget {
  id: string;
  /** FK → projects — one active budget per project (enforced via partial unique index) */
  projectId: string;
  /** Total budget amount for the project (> 0) */
  totalBudget: number;
  /**
   * Alert threshold as a percentage (1–100).
   * A notification is triggered when expenses reach this % of totalBudget.
   * Default: 80.
   */
  alertPercentage: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
}

// ─── API shapes ───────────────────────────────────────────────────────────────

export type BudgetAlertLevel = "normal" | "warning" | "critical" | "exceeded";

/** Returned by GET/PUT /api/projects/{projectId}/budget */
export interface ProjectBudgetResponse {
  id: string;
  projectId: string;
  totalBudget: number;
  alertPercentage: number;
  /** Calculated: total of converted expenses */
  spentAmount: number;
  /** Calculated: totalBudget − spentAmount */
  remainingAmount: number;
  /** Calculated: (spentAmount / totalBudget) × 100 */
  spentPercentage: number;
  /** True when spentPercentage ≥ alertPercentage */
  isAlertTriggered: boolean;
  alertLevel: BudgetAlertLevel;
  createdAt: string;
  updatedAt: string;
}

/** PUT /api/projects/{projectId}/budget — upsert */
export interface SetProjectBudgetRequest {
  totalBudget: number;          // required, > 0
  alertPercentage?: number;     // optional, 1–100, default 80
}
