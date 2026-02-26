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
  createdAt: string;
  updatedAt: string;
}

// ─── Request bodies ────────────────────────────────────────────────────────────

export interface CreateProjectRequest {
  name: string;
  currencyCode: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name: string;
  description?: string | null;
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
