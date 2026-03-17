// types/workspace.ts
// Workspace model type definitions

// ─── API shapes ────────────────────────────────────────────────────────────────

export type WorkspaceRole = "owner" | "member"

export interface WorkspaceProjectItem {
  id: string
  name: string
  currencyCode: string
  description: string | null
  createdAt: string
}

export interface WorkspaceMemberItem {
  userId: string
  fullName: string
  email: string
  role: WorkspaceRole
  joinedAt: string
}

export interface WorkspaceResponse {
  id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  role: WorkspaceRole
  projectCount: number
  createdAt: string
  updatedAt: string
}

export interface WorkspaceDetailResponse extends Omit<WorkspaceResponse, "projectCount"> {
  projects: WorkspaceProjectItem[]
  members: WorkspaceMemberItem[]
}

// ─── Request bodies ────────────────────────────────────────────────────────────

export interface CreateWorkspaceRequest {
  name: string
  description?: string
  color?: string
  icon?: string
}

export interface UpdateWorkspaceRequest {
  name: string
  description?: string
  color?: string
  icon?: string
}
