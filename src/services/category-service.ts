// services/category-service.ts

import { api } from "@/lib/api-client"
import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category"

// ─── Categories (scoped to project) ───────────────────────────────────────────

export function getCategories(projectId: string) {
  return api.get<CategoryResponse[]>(`/projects/${projectId}/categories`)
}

export function getCategory(projectId: string, categoryId: string) {
  return api.get<CategoryResponse>(`/projects/${projectId}/categories/${categoryId}`)
}

export function createCategory(projectId: string, data: CreateCategoryRequest) {
  return api.post<CategoryResponse>(`/projects/${projectId}/categories`, data)
}

export function updateCategory(
  projectId: string,
  categoryId: string,
  data: UpdateCategoryRequest
) {
  return api.put<CategoryResponse>(`/projects/${projectId}/categories/${categoryId}`, data)
}

export function deleteCategory(projectId: string, categoryId: string) {
  return api.delete<void>(`/projects/${projectId}/categories/${categoryId}`)
}
