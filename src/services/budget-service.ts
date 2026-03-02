// services/budget-service.ts
// API calls for project budget endpoints.
// GET requires viewer+; PUT requires editor+ and plan with canSetBudgets;
// DELETE requires owner role.

import { api } from "@/lib/api-client";
import type {
  ProjectBudgetResponse,
  SetProjectBudgetRequest,
} from "@/types/project-budget";

// ─── Get budget ─────────────────────────────────────────────────────────────

/**
 * GET /api/projects/{projectId}/budget
 * Returns the active budget with real-time spent calculations.
 * 404 if no budget has been set for this project.
 */
export function getProjectBudget(projectId: string) {
  return api.get<ProjectBudgetResponse>(`/projects/${projectId}/budget`);
}

// ─── Upsert budget ──────────────────────────────────────────────────────────

/**
 * PUT /api/projects/{projectId}/budget
 * Creates or updates the project's budget.
 * Returns 201 on create, 200 on update.
 * 403 if the project owner's plan does not allow budgets (canSetBudgets = false).
 */
export function setProjectBudget(
  projectId: string,
  data: SetProjectBudgetRequest
) {
  return api.put<ProjectBudgetResponse>(
    `/projects/${projectId}/budget`,
    data
  );
}

// ─── Delete budget ──────────────────────────────────────────────────────────

/**
 * DELETE /api/projects/{projectId}/budget
 * Soft-deletes the active budget. Requires owner role.
 * 404 if no budget is active.
 */
export function deleteProjectBudget(projectId: string) {
  return api.delete<void>(`/projects/${projectId}/budget`);
}
