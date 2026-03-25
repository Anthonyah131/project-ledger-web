"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ApiClientError } from "@/lib/api-client";
import { formatPlanPrice } from "@/lib/billing-utils";
import { getPlanDescription, getPlanFeatureGroups } from "@/lib/plan-presentation";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import * as planService from "@/services/plan-service";
import type { PlanResponse } from "@/types/plan";

export function Pricing() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { t } = useLanguage();

  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPlans() {
      try {
        setError(null);
        const data = await planService.getPlans();
        if (!isMounted) return;
        setPlans([...data].sort((a, b) => a.displayOrder - b.displayOrder));
      } catch (err) {
        if (!isMounted) return;
        if (err instanceof ApiClientError) {
          if (err.status === 0) setError(t("landing.pricing.errors.noConnection"));
          else if (err.status === 401) setError(t("landing.pricing.errors.unauthorized"));
          else if (err.status === 403) setError(t("landing.pricing.errors.forbidden"));
          else setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(t("landing.pricing.errors.generic"));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPlans();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const highlightedPlanId = useMemo(
    () => plans.find((plan) => plan.monthlyPrice > 0)?.id ?? null,
    [plans],
  );

  const handleCheckout = (plan: PlanResponse) => {
    if (plan.monthlyPrice <= 0) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    router.push(`/settings/billing?checkoutPlanId=${encodeURIComponent(plan.id)}`);
  };

  return (
    <section id="pricing" className="px-6 py-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            {t("nav.pricing")}
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground">
            {t("billing.pricingTitle")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("billing.pricingSubtitle")}
          </p>
        </div>

        {error && (
          <div className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Cards */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {loading && (
            <div className="col-span-full flex items-center justify-center rounded-2xl border border-border bg-card p-8 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("billing.loadingPlans")}
            </div>
          )}

          {plans.map((plan) => {
            const planDescription = getPlanDescription(plan);
            const { limits: planLimits, capabilities: planCapabilities } = getPlanFeatureGroups(plan, 5, 4);
            const hasPlanLimits = planLimits.length > 0;
            const hasPlanCapabilities = planCapabilities.length > 0;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                  plan.id === highlightedPlanId
                    ? "border-primary bg-primary/10 shadow-xl shadow-primary/20"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                {plan.id === highlightedPlanId && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/40">
                      {t("billing.mostPopular")}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <p className={`text-sm font-semibold ${plan.id === highlightedPlanId ? "text-primary" : "text-muted-foreground"}`}>
                    {plan.name}
                  </p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {formatPlanPrice(plan.monthlyPrice, plan.currency)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.monthlyPrice > 0 ? t("billing.perMonthLabel") : t("billing.forever")}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {planDescription}
                  </p>
                </div>

                <div className="mb-8 flex flex-1 flex-col gap-5">
                  {hasPlanLimits && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("billing.limits")}
                      </p>
                      <ul className="flex flex-col gap-2.5">
                        {planLimits.map((limit) => (
                          <li key={`${plan.id}-limit-${limit}`} className="flex items-center gap-2.5 text-sm">
                            <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.id === highlightedPlanId ? "text-primary" : "text-muted-foreground"}`} />
                            {limit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {hasPlanCapabilities && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("billing.includes")}
                      </p>
                      <ul className="flex flex-col gap-2.5">
                        {planCapabilities.map((feature) => (
                          <li key={`${plan.id}-feature-${feature}`} className="flex items-center gap-2.5 text-sm">
                            <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.id === highlightedPlanId ? "text-primary" : "text-muted-foreground"}`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {plan.monthlyPrice > 0 ? (
                  <button
                    type="button"
                    onClick={() => handleCheckout(plan)}
                    disabled={isAuthLoading}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                      plan.id === highlightedPlanId
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:bg-primary/90"
                        : "border border-border bg-muted text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    {t("billing.subscribe")}
                    <ExternalLink className="h-4 w-4" />
                  </button>
                ) : (
                  <Link
                    href={isAuthenticated ? "/dashboard" : "/register"}
                    className={`inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                      plan.id === highlightedPlanId
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:bg-primary/90"
                        : "border border-border bg-muted text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    {t("billing.startFree")}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
