// types/plan.ts
// Subscription plan model type definitions

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

  // ─── Numeric limits (JSONB) ────────────────────────────────
  /** Numeric limits in JSON; null = no limits applied */
  limits: PlanLimits | null;

  createdAt: string;
  updatedAt: string;
}
