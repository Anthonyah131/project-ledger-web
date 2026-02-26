// types/project-member.ts
// Project membership model type definitions

export type ProjectMemberRole = 'owner' | 'editor' | 'viewer';

/** Full DB model */
export interface ProjectMember {
  id: string;
  /** FK → projects */
  projectId: string;
  /** FK → users */
  userId: string;
  role: ProjectMemberRole;
  /** Timestamp when the user joined the project */
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
}

/** Shape returned by GET /projects/:id/members */
export interface ProjectMemberResponse {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  role: ProjectMemberRole;
  joinedAt: string;
}

// ─── Request bodies ────────────────────────────────────────────────────────────

export interface AddMemberRequest {
  email: string;
  role: 'editor' | 'viewer';
}

export interface ChangeMemberRoleRequest {
  role: 'editor' | 'viewer';
}
