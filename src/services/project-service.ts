// services/project-service.ts
// API calls for projects and project-members

import { api } from "@/lib/api-client";
import type {
  ProjectResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/types/project";
import type {
  ProjectMemberResponse,
  AddMemberRequest,
  ChangeMemberRoleRequest,
} from "@/types/project-member";

// ─── Projects ──────────────────────────────────────────────────────────────────

export function getProjects() {
  return api.get<ProjectResponse[]>("/projects");
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
