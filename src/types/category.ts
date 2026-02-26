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
