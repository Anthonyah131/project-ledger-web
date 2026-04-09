// types/project.ts
// Project model type definitions

import type { ProjectMemberRole } from "@/types/project-member";

/** Full DB model (admin / internal use) */
export interface Project {
  id: string;
  name: string;
  /** FK → users — project owner/creator */
  ownerUserId: string;
  /** Base currency for the project (ISO 4217, FK → currencies) */
  currencyCode: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
}

/** Shape returned by the API (includes current user's role) */
export interface ProjectResponse {
  id: string;
  name: string;
  ownerUserId: string;
  currencyCode: string;
  description: string | null;
  /** Role of the authenticated user in this project */
  userRole: ProjectMemberRole;
  /** ID del workspace al que pertenece el proyecto */
  workspaceId: string | null;
  /** Nombre del workspace. null si no está en ningún workspace */
  workspaceName: string | null;
  /** Indica si el proyecto tiene splits por partners activados */
  partnersEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Project response enriched with pin metadata (inside pinned[] array) */
export interface PinnedProjectResponse extends ProjectResponse {
  pinnedAt: string; // ISO 8601
}

/** Paged response from GET /projects and GET /workspaces/{id}/projects */
export interface ProjectsPagedResponse {
  /** Pinned projects for this user (only populated on page 1) */
  pinned: PinnedProjectResponse[];
  /** Total pinned projects for the user (0-6, present on all pages) */
  pinnedCount: number;
  /** Non-pinned items for the current page */
  items: ProjectResponse[];
  page: number;
  pageSize: number;
  /** Count of non-pinned projects (pinned excluded) */
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** @deprecated Use ProjectsPagedResponse */
export type PagedProjectsResponse = ProjectsPagedResponse;

// ─── Lookup (lightweight list) ─────────────────────────────────────────────────

/** Minimal project shape returned by GET /projects/lookup */
export interface ProjectLookupItem {
  id: string;
  name: string;
  workspaceId: string | null;
  workspaceName: string | null;
}

/** Pinned entry in the lookup response */
export interface PinnedProjectLookupItem extends ProjectLookupItem {
  pinnedAt: string;
}

/** Response from GET /projects/lookup */
export interface ProjectsLookupResponse {
  /** Pinned projects matching the search. Only populated on page 1. */
  pinned: PinnedProjectLookupItem[];
  /** Total pinned projects for the user (independent of search). */
  pinnedCount: number;
  /** Non-pinned items for the current page. */
  items: ProjectLookupItem[];
  page: number;
  pageSize: number;
  /** Count of non-pinned results (pinned excluded). */
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ─── Request bodies ────────────────────────────────────────────────────────────

export interface CreateProjectRequest {
  name: string;
  currencyCode: string;
  description?: string;
  /** Opcional: ID del workspace al que pertenece el proyecto */
  workspace_id?: string;
}

export interface UpdateProjectRequest {
  name: string;
  description?: string | null;
}

/** Body for PATCH /projects/:id/settings */
export interface UpdateProjectSettingsRequest {
  partnersEnabled: boolean;
}

// ─── View helpers ──────────────────────────────────────────────────────────────

export type ViewMode = "shelf" | "list";

export const ISO_CURRENCIES = [
  "USD", "EUR", "CRC", "MXN", "COP", "BRL", "ARS",
  "CLP", "PEN", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY",
] as const;

export const CURRENCY_OPTIONS = [
  { value: "all", label: "Todas" },
  ...ISO_CURRENCIES.map((c) => ({ value: c, label: c })),
];
