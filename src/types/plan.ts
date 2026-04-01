// types/plan.ts
// Subscription plan model type definitions

// ─── Shared summary (embedded in user responses) ────────────────────────────

export interface PlanSummaryDto {
  id: string;
  name: string;
  slug: string;
}

// ─── API response types (GET /api/plans) ────────────────────────────────────

export interface PlanPermissionsDto {
  canCreateProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canShareProjects: boolean;
  canExportData: boolean;
  canUseAdvancedReports: boolean;
  canUseOcr: boolean;
  canUseApi: boolean;
  canUseMultiCurrency: boolean;
  canSetBudgets: boolean;
  canUsePartners: boolean;
}

export interface PlanLimitsDto {
  /** null = unlimited */
  maxProjects: number | null;
  maxExpensesPerMonth: number | null;
  maxCategoriesPerProject: number | null;
  maxPaymentMethods: number | null;
  maxTeamMembersPerProject: number | null;
  maxAlternativeCurrenciesPerProject: number | null;
  maxIncomesPerMonth: number | null;
  /** -1 = unlimited, 0 = feature not available */
  maxDocumentReadsPerMonth: number | null;
}

export interface PlanResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  monthlyPrice: number;
  currency: string;
  stripePaymentLinkUrl: string | null;
  permissions: PlanPermissionsDto;
  limits: PlanLimitsDto | null;
}

// ─── Internal / legacy full plan model ──────────────────────────────────────

export interface PlanLimits {
  /** Maximum number of projects; null = unlimited */
  maxProjects?: number | null;
  /** Maximum expenses per month; null = unlimited */
  maxExpensesPerMonth?: number | null;
  /** Maximum categories per project; null = unlimited */
  maxCategoriesPerProject?: number | null;
  /** Maximum payment methods; null = unlimited */
  maxPaymentMethods?: number | null;
  /** Maximum team members per project; null = unlimited */
  maxTeamMembersPerProject?: number | null;
  /** Maximum alternative display currencies per project; null = unlimited */
  maxAlternativeCurrenciesPerProject?: number | null;
  /** Maximum incomes recorded per month; null = unlimited */
  maxIncomesPerMonth?: number | null;
  /** Convenience flag — true means all limits are removed */
  unlimited?: boolean;
}

export interface Plan {
  id: string;
  /** Visible plan name (e.g. "Free", "Pro") */
  name: string;
  /** URL-friendly slug (e.g. "free", "pro") */
  slug: string;
  description: string | null;
  /** Whether this plan is available for new assignments */
  isActive: boolean;
  /** UI display order */
  displayOrder: number;

  // ─── Feature flags ────────────────────────────────────────
  canCreateProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canShareProjects: boolean;
  canExportData: boolean;
  canUseAdvancedReports: boolean;
  canUseOcr: boolean;
  canUseApi: boolean;
  canUseMultiCurrency: boolean;
  canSetBudgets: boolean;
  canUsePartners: boolean;

  // ─── Numeric limits (JSONB) ────────────────────────────────
  /** Numeric limits in JSON; null = no limits applied */
  limits: PlanLimits | null;

  createdAt: string;
  updatedAt: string;
}
