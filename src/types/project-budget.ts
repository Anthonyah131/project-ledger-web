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
