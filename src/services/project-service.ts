// services/project-service.ts
// API calls for projects and project-members

import { api } from "@/lib/api-client";
import type {
  ProjectResponse,
  ProjectsPagedResponse,
  PinnedProjectResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  UpdateProjectSettingsRequest,
} from "@/types/project";
import type {
  ProjectMemberResponse,
  AddMemberRequest,
  ChangeMemberRoleRequest,
} from "@/types/project-member";

// ─── Projects ──────────────────────────────────────────────────────────────────

export type ProjectSortBy = "name" | "createdAt" | "updatedAt" | "currencyCode";

export interface GetProjectsParams {
  page?: number;
  pageSize?: number;
  sortBy?: ProjectSortBy;
  sortDirection?: "asc" | "desc";
  signal?: AbortSignal;
}

export function getProjects({ page = 1, pageSize = 12, sortBy = "updatedAt", sortDirection = "desc", signal }: GetProjectsParams = {}) {
  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy,
    sortDirection,
  });
  return api.get<ProjectsPagedResponse>(`/projects?${qs}`, { signal });
}

export function pinProject(projectId: string) {
  return api.put<{ projectId: string; pinnedAt: string }>(`/projects/${projectId}/pin`, {});
}

export function unpinProject(projectId: string) {
  return api.delete<void>(`/projects/${projectId}/pin`);
}

export function getProject(projectId: string) {
  return api.get<ProjectResponse>(`/projects/${projectId}`);
}

export function createProject(data: CreateProjectRequest) {
  return api.post<ProjectResponse>("/projects", data);
}

export function updateProject(projectId: string, data: UpdateProjectRequest) {
  return api.put<ProjectResponse>(`/projects/${projectId}`, data);
}

export function deleteProject(projectId: string) {
  return api.delete<void>(`/projects/${projectId}`);
}

/** PATCH /projects/:id/settings — toggle partner splits feature */
export function updateProjectSettings(projectId: string, data: UpdateProjectSettingsRequest) {
  return api.patch<void>(`/projects/${projectId}/settings`, data);
}

// ─── Members ───────────────────────────────────────────────────────────────────

export function getMembers(projectId: string) {
  return api.get<ProjectMemberResponse[]>(
    `/projects/${projectId}/members`
  );
}

export function addMember(projectId: string, data: AddMemberRequest) {
  return api.post<ProjectMemberResponse>(
    `/projects/${projectId}/members`,
    data
  );
}

export function changeMemberRole(
  projectId: string,
  memberId: string,
  data: ChangeMemberRoleRequest
) {
  return api.put<void>(
    `/projects/${projectId}/members/${memberId}/role`,
    data
  );
}

export function removeMember(projectId: string, memberId: string) {
  return api.delete<void>(
    `/projects/${projectId}/members/${memberId}`
  );
}
