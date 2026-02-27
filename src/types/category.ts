// types/category.ts
// Expense category model type definitions

export interface Category {
  id: string;
  /** FK → projects */
  projectId: string;
  name: string;
  description: string | null;
  /** True for the "General" category auto-created with each project */
  isDefault: boolean;
  /** Optional budget cap for this category; null = no budget set */
  budgetAmount: number | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
}

// ─── API shapes ───────────────────────────────────────────────────────────────

export interface CategoryResponse {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  budgetAmount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string | null;
  budgetAmount?: number | null;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string | null;
  budgetAmount?: number | null;
}
