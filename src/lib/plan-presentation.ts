import type { PlanResponse } from "@/types/plan";

const numberFormatter = new Intl.NumberFormat("es-ES");

type NumericLimit = number | null | undefined;

interface PlanLimitSnapshot {
  maxProjects: NumericLimit;
  maxExpenses: NumericLimit;
  maxCategories: NumericLimit;
  maxPaymentMethods: NumericLimit;
  maxTeamMembers: NumericLimit;
  maxAlternativeCurrencies: NumericLimit;
  maxIncomes: NumericLimit;
}

interface PlanCapabilitySnapshot {
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
}

export interface PlanFeatureGroups {
  limits: string[];
  capabilities: string[];
}

const PLAN_LIMIT_FALLBACKS: Record<string, PlanLimitSnapshot> = {
  free: {
    maxProjects: 2,
    maxExpenses: 30,
    maxCategories: 5,
    maxPaymentMethods: 2,
    maxTeamMembers: 0,
    maxAlternativeCurrencies: 3,
    maxIncomes: 10,
  },
  basic: {
    maxProjects: 10,
    maxExpenses: 200,
    maxCategories: 20,
    maxPaymentMethods: 10,
    maxTeamMembers: 5,
    maxAlternativeCurrencies: 10,
    maxIncomes: 100,
  },
  premium: {
    maxProjects: null,
    maxExpenses: null,
    maxCategories: null,
    maxPaymentMethods: null,
    maxTeamMembers: null,
    maxAlternativeCurrencies: null,
    maxIncomes: null,
  },
};

function toLimitNumber(value: unknown): NumericLimit {
  if (value === null || value === undefined) return value as NumericLimit;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function formatCount(value: number, singular: string, plural: string): string {
  return `${numberFormatter.format(value)} ${value === 1 ? singular : plural}`;
}

function resolvePlanCapabilities(plan: PlanResponse): PlanCapabilitySnapshot {
  return {
    canCreateProjects: Boolean(plan.permissions?.canCreateProjects),
    canEditProjects: Boolean(plan.permissions?.canEditProjects),
    canDeleteProjects: Boolean(plan.permissions?.canDeleteProjects),
    canShareProjects: Boolean(plan.permissions?.canShareProjects),
    canExportData: Boolean(plan.permissions?.canExportData),
    canUseAdvancedReports: Boolean(plan.permissions?.canUseAdvancedReports),
    canUseOcr: Boolean(plan.permissions?.canUseOcr),
    canUseApi: Boolean(plan.permissions?.canUseApi),
    canUseMultiCurrency: Boolean(plan.permissions?.canUseMultiCurrency),
    canSetBudgets: Boolean(plan.permissions?.canSetBudgets),
  };
}

/**
 * Reads all limit fields from plan.limits handling both camelCase (API DTO) and
 * snake_case (JSONB raw) key names, then applies slug-based fallbacks when the
 * value is still undefined.
 */
function resolvePlanLimits(plan: PlanResponse, slug: string): PlanLimitSnapshot {
  const typed = plan.limits;
  const raw = plan.limits as unknown as Record<string, unknown> | null;
  const fallback = PLAN_LIMIT_FALLBACKS[slug];

  function pick(...candidates: unknown[]): NumericLimit {
    for (const v of candidates) {
      if (v !== undefined) return toLimitNumber(v);
    }
    return undefined;
  }

  const fromApi: PlanLimitSnapshot = {
    maxProjects: pick(typed?.maxProjects, raw?.max_projects),
    maxExpenses: pick(typed?.maxExpensesPerMonth, raw?.maxExpensesPerMonth, raw?.maxExpenses, raw?.max_expenses),
    maxCategories: pick(typed?.maxCategoriesPerProject, raw?.maxCategoriesPerProject, raw?.max_categories_per_project),
    maxPaymentMethods: pick(typed?.maxPaymentMethods, raw?.max_payment_methods),
    maxTeamMembers: pick(typed?.maxTeamMembersPerProject, raw?.maxTeamMembersPerProject, raw?.max_team_members_per_project),
    maxAlternativeCurrencies: pick(
      typed?.maxAlternativeCurrenciesPerProject,
      raw?.maxAlternativeCurrenciesPerProject,
      raw?.max_alternative_currencies_per_project,
    ),
    maxIncomes: pick(typed?.maxIncomesPerMonth, raw?.maxIncomesPerMonth, raw?.max_incomes_per_month),
  };

  return {
    maxProjects: fromApi.maxProjects !== undefined ? fromApi.maxProjects : fallback?.maxProjects,
    maxExpenses: fromApi.maxExpenses !== undefined ? fromApi.maxExpenses : fallback?.maxExpenses,
    maxCategories: fromApi.maxCategories !== undefined ? fromApi.maxCategories : fallback?.maxCategories,
    maxPaymentMethods: fromApi.maxPaymentMethods !== undefined ? fromApi.maxPaymentMethods : fallback?.maxPaymentMethods,
    maxTeamMembers: fromApi.maxTeamMembers !== undefined ? fromApi.maxTeamMembers : fallback?.maxTeamMembers,
    maxAlternativeCurrencies:
      fromApi.maxAlternativeCurrencies !== undefined
        ? fromApi.maxAlternativeCurrencies
        : fallback?.maxAlternativeCurrencies,
    maxIncomes: fromApi.maxIncomes !== undefined ? fromApi.maxIncomes : fallback?.maxIncomes,
  };
}

export function getPlanDescription(plan: PlanResponse): string {
  const description = plan.description?.trim();
  if (description) return description;

  const slug = plan.slug.toLowerCase();

  if (slug === "free") {
    return "Plan gratuito para uso personal básico. Perfecto para empezar a organizar tus finanzas.";
  }

  if (slug === "basic") {
    return "Plan básico para freelancers y equipos pequeños. Incluye exportación y colaboración.";
  }

  if (slug === "premium" || slug === "pro") {
    return "Plan premium sin límites. Todas las funcionalidades: OCR, API, reportes avanzados y colaboración ilimitada.";
  }

  if (slug === "enterprise") {
    return "Plan enterprise para equipos grandes: límites ilimitados y capacidades avanzadas de colaboración y control.";
  }

  return "Plan de suscripción para gestionar tus finanzas de forma organizada.";
}

function buildLimitFeatures(plan: PlanResponse): string[] {
  const slug = plan.slug.toLowerCase();
  const isPremium = slug === "premium" || slug === "pro" || slug === "enterprise";

  const {
    maxProjects,
    maxExpenses,
    maxCategories,
    maxPaymentMethods,
    maxTeamMembers,
    maxAlternativeCurrencies,
    maxIncomes,
  } = resolvePlanLimits(plan, slug);

  const limitFeatures: string[] = [];

  if (maxProjects === null && isPremium) {
    limitFeatures.push("Proyectos ilimitados");
  } else if (typeof maxProjects === "number") {
    limitFeatures.push(`Hasta ${formatCount(maxProjects, "proyecto", "proyectos")}`);
  }

  if (maxExpenses === null && isPremium) {
    limitFeatures.push("Gastos mensuales ilimitados");
  } else if (typeof maxExpenses === "number") {
    limitFeatures.push(`Hasta ${formatCount(maxExpenses, "gasto", "gastos")} registrados por mes`);
  }

  if (maxCategories === null && isPremium) {
    limitFeatures.push("Categorías por proyecto ilimitadas");
  } else if (typeof maxCategories === "number") {
    limitFeatures.push(`Hasta ${formatCount(maxCategories, "categoría", "categorías")} por proyecto`);
  }

  if (maxPaymentMethods === null && isPremium) {
    limitFeatures.push("Métodos de pago ilimitados");
  } else if (typeof maxPaymentMethods === "number") {
    limitFeatures.push(`Hasta ${formatCount(maxPaymentMethods, "método de pago", "métodos de pago")}`);
  }

  if (maxTeamMembers === null && isPremium) {
    limitFeatures.push("Miembros por proyecto ilimitados");
  } else if (typeof maxTeamMembers === "number") {
    if (maxTeamMembers > 0) {
      limitFeatures.push(`Hasta ${formatCount(maxTeamMembers, "miembro", "miembros")} por proyecto`);
    } else {
      limitFeatures.push("Sin miembros por proyecto (uso personal)");
    }
  }

  if (maxAlternativeCurrencies === null && isPremium) {
    limitFeatures.push("Monedas alternativas por proyecto ilimitadas");
  } else if (typeof maxAlternativeCurrencies === "number") {
    limitFeatures.push(
      `Hasta ${formatCount(maxAlternativeCurrencies, "moneda alternativa", "monedas alternativas")} por proyecto`
    );
  }

  if (maxIncomes === null && isPremium) {
    limitFeatures.push("Ingresos mensuales ilimitados");
  } else if (typeof maxIncomes === "number") {
    limitFeatures.push(`Hasta ${formatCount(maxIncomes, "ingreso", "ingresos")} registrados por mes`);
  }

  return limitFeatures;
}

function buildCapabilityFeatures(plan: PlanResponse): string[] {
  const capabilities = resolvePlanCapabilities(plan);
  const features: string[] = [];

  if (capabilities.canCreateProjects && capabilities.canEditProjects && capabilities.canDeleteProjects) {
    features.push("Gestión completa de proyectos");
  } else {
    if (capabilities.canCreateProjects) features.push("Creación de proyectos");
    if (capabilities.canEditProjects) features.push("Edición de proyectos");
    if (capabilities.canDeleteProjects) features.push("Eliminación de proyectos");
  }

  if (capabilities.canShareProjects) features.push("Compartir proyectos");
  if (capabilities.canExportData) features.push("Exportación de datos");
  if (capabilities.canSetBudgets) features.push("Presupuestos por proyecto");
  if (capabilities.canUseAdvancedReports) features.push("Reportes avanzados");
  if (capabilities.canUseMultiCurrency) features.push("Soporte multi-moneda");
  if (capabilities.canUseApi) features.push("Acceso API");
  if (capabilities.canUseOcr) features.push("OCR de comprobantes");

  return features;
}

export function getPlanFeatureGroups(
  plan: PlanResponse,
  maxLimitItems = 5,
  maxCapabilityItems = 5,
): PlanFeatureGroups {
  const limits = buildLimitFeatures(plan).slice(0, maxLimitItems);
  const capabilities = buildCapabilityFeatures(plan).slice(0, maxCapabilityItems);

  if (limits.length === 0 && capabilities.length === 0) {
    return {
      limits: [],
      capabilities: ["Funcionalidades esenciales para empezar"],
    };
  }

  return {
    limits,
    capabilities,
  };
}

export function getPlanFeatures(plan: PlanResponse, maxItems = 6): string[] {
  const { limits, capabilities } = getPlanFeatureGroups(plan, maxItems, maxItems);
  const features = [...limits, ...capabilities];

  if (features.length === 0) {
    return ["Funcionalidades esenciales para empezar"];
  }

  return features.slice(0, maxItems);
}
