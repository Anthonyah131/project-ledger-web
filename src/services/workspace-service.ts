// services/workspace-service.ts
// API calls for workspaces

import { api } from "@/lib/api-client"
import type {
  WorkspaceResponse,
  WorkspaceDetailResponse,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
} from "@/types/workspace"
import type { PagedProjectsResponse } from "@/types/project"

// ─── Workspaces ────────────────────────────────────────────────────────────────

export function getWorkspaces() {
  return api.get<WorkspaceResponse[]>("/workspaces")
}

export function getWorkspace(id: string) {
  return api.get<WorkspaceDetailResponse>(`/workspaces/${id}`)
}

export function createWorkspace(data: CreateWorkspaceRequest) {
  return api.post<WorkspaceResponse>("/workspaces", data)
}

export function updateWorkspace(id: string, data: UpdateWorkspaceRequest) {
  return api.patch<WorkspaceResponse>(`/workspaces/${id}`, data)
}

export function deleteWorkspace(id: string) {
  return api.delete<void>(`/workspaces/${id}`)
}

// ─── Workspace projects ────────────────────────────────────────────────────────

export function getWorkspaceProjects(
  workspaceId: string,
  { page = 1, pageSize = 200, sortBy = "createdAt", sortDirection = "desc" }: {
    page?: number; pageSize?: number; sortBy?: string; sortDirection?: "asc" | "desc"
  } = {}
) {
  const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize), sortBy, sortDirection })
  return api.get<PagedProjectsResponse>(`/workspaces/${workspaceId}/projects?${qs}`)
}

// ─── Workspace ↔ Project assignment ────────────────────────────────────────────

export function assignProjectToWorkspace(workspaceId: string, projectId: string) {
  return api.post<void>(`/workspaces/${workspaceId}/projects`, { projectId })
}

export function removeProjectFromWorkspace(workspaceId: string, projectId: string) {
  return api.delete<void>(`/workspaces/${workspaceId}/projects/${projectId}`)
}
