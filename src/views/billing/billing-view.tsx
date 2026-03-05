"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, RefreshCw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiClientError } from "@/lib/api-client";
import { formatPlanPrice, getBillingStatusMeta } from "@/lib/billing-utils";
import { formatDate } from "@/lib/format-utils";
import { getPlanDescription, getPlanFeatures } from "@/lib/plan-presentation";
import { useAuth } from "@/context/auth-context";
import * as billingService from "@/services/billing-service";
import * as planService from "@/services/plan-service";
import type { PlanResponse } from "@/types/plan";
import type { BillingSubscriptionResponse } from "@/types/subscription";

function getBillingErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.status === 401) return "Tu sesión expiró. Inicia sesión nuevamente.";
    if (err.status === 403) return "No tienes permisos para consultar la facturación.";
    return err.message;
  }

  if (err instanceof Error) return err.message;
  return "No fue posible cargar la información de facturación.";
}

function getBadgeToneClass(tone: "success" | "warning" | "danger" | "muted"): string {
  switch (tone) {
    case "success":
      return "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400";
    case "warning":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    case "danger":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export function BillingView() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [subscription, setSubscription] = useState<BillingSubscriptionResponse | null>(null);
  const [subscriptionMissing, setSubscriptionMissing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoCheckoutDone, setAutoCheckoutDone] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [checkoutInProgressPlanId, setCheckoutInProgressPlanId] = useState<string | null>(null);

  const loadBillingData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const plansPromise = planService.getPlans();
      const subscriptionPromise = billingService
        .getMySubscription()
        .then((value) => ({ ok: true as const, value }))
        .catch((reason: unknown) => ({ ok: false as const, reason }));

      const [plansData, subscriptionResult] = await Promise.all([plansPromise, subscriptionPromise]);

      setPlans([...plansData].sort((a, b) => a.displayOrder - b.displayOrder));

      if (subscriptionResult.ok) {
        setSubscription(subscriptionResult.value);
        setSubscriptionMissing(false);
      } else if (subscriptionResult.reason instanceof ApiClientError && subscriptionResult.reason.status === 404) {
        setSubscription(null);
        setSubscriptionMissing(true);
      } else {
        throw subscriptionResult.reason;
      }
    } catch (err) {
      setError(getBillingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  const currentStatusMeta = useMemo(
    () => (subscription ? getBillingStatusMeta(subscription.status) : null),
    [subscription],
  );

  const freePlan = useMemo(
    () => plans.find((plan) => plan.slug.toLowerCase() === "free") ?? null,
    [plans],
  );

  const fallbackCurrentPlan = useMemo(() => {
    if (subscription) return null;
    if (subscriptionMissing && freePlan) return freePlan;
    if (!user?.planId) return null;

    return plans.find((plan) => plan.id === user.planId) ?? null;
  }, [subscription, subscriptionMissing, freePlan, user?.planId, plans]);

  const effectiveCurrentPlanId = subscription?.planId ?? fallbackCurrentPlan?.id ?? null;

  const startCheckout = useCallback(async (planId: string) => {
    setError(null);
    setCheckoutInProgressPlanId(planId);

    try {
      const session = await billingService.createCheckoutSession({ planId });
      window.location.href = session.checkoutUrl;
    } catch (err) {
      setError(getBillingErrorMessage(err));
    } finally {
      setCheckoutInProgressPlanId(null);
    }
  }, []);

  const handleCheckout = useCallback((plan: PlanResponse) => {
    if (plan.monthlyPrice <= 0) return;
    void startCheckout(plan.id);
  }, [startCheckout]);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("checkoutPlanId");
    setCheckoutPlanId(value);
  }, []);

  useEffect(() => {
    if (loading || autoCheckoutDone) return;
    if (!checkoutPlanId) return;

    const targetPlan = plans.find((plan) => plan.id === checkoutPlanId);
    if (!targetPlan || targetPlan.monthlyPrice <= 0) return;

    const isCurrentPlan = effectiveCurrentPlanId
      ? effectiveCurrentPlanId === targetPlan.id
      : targetPlan.slug.toLowerCase() === "free";

    if (isCurrentPlan) return;

    setAutoCheckoutDone(true);
    void startCheckout(targetPlan.id);
  }, [loading, autoCheckoutDone, checkoutPlanId, plans, effectiveCurrentPlanId, startCheckout]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Facturación</h1>
          <p className="text-sm text-muted-foreground">Gestiona tu plan y el estado de tu suscripción.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={loadBillingData} disabled={loading}>
          <RefreshCw className="size-4" />
          Actualizar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error de facturación</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card>
          <CardContent className="flex items-center gap-2 pt-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando estado de suscripción...
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Suscripción actual</CardTitle>
            <CardDescription>Estado sincronizado con Stripe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription && currentStatusMeta ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={getBadgeToneClass(currentStatusMeta.tone)}>
                    {currentStatusMeta.label}
                  </Badge>
                  {subscription.cancelAtPeriodEnd && (
                    <Badge variant="outline">Cancelación al final del período</Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">{currentStatusMeta.description}</p>

                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <p className="mt-1 font-medium">{subscription.planName}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-xs text-muted-foreground">Actualizado</p>
                    <p className="mt-1 font-medium">{formatDate(subscription.updatedAt, { withYear: true })}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-xs text-muted-foreground">Período actual inicia</p>
                    <p className="mt-1 font-medium">
                      {subscription.currentPeriodStart
                        ? formatDate(subscription.currentPeriodStart, { withYear: true })
                        : "Sin dato"}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-xs text-muted-foreground">Período actual termina</p>
                    <p className="mt-1 font-medium">
                      {subscription.currentPeriodEnd
                        ? formatDate(subscription.currentPeriodEnd, { withYear: true })
                        : "Sin dato"}
                    </p>
                  </div>
                </div>
              </>
            ) : fallbackCurrentPlan ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={getBadgeToneClass("muted")}>
                    {subscriptionMissing
                      ? "Plan Free (sin suscripción Stripe)"
                      : "Plan sin suscripción activa"}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  {subscriptionMissing
                    ? `Tu cuenta está en el plan ${fallbackCurrentPlan.name}. El endpoint de suscripción devolvió 404 (sin suscripción de pago).`
                    : `Tu cuenta está en el plan ${fallbackCurrentPlan.name}. No tienes una suscripción de pago registrada.`}
                </p>

                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <p className="mt-1 font-medium">{fallbackCurrentPlan.name}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-xs text-muted-foreground">Estado</p>
                    <p className="mt-1 font-medium">Free / sin cobros</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {subscriptionMissing
                  ? "Aún no hay una suscripción registrada para tu usuario."
                  : "No hay información de suscripción disponible."}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => {
          const planDescription = getPlanDescription(plan);
          const planFeatures = getPlanFeatures(plan, 5);
          const isCurrentPlan = effectiveCurrentPlanId
            ? effectiveCurrentPlanId === plan.id
            : plan.slug.toLowerCase() === "free";
          const isPaidPlan = plan.monthlyPrice > 0;

          let ctaLabel = "No requiere pago";
          let ctaDisabled = true;

          if (isCurrentPlan) {
            ctaLabel = "Plan actual";
            ctaDisabled = true;
          } else if (isPaidPlan) {
            ctaLabel = "Suscribirse";
            ctaDisabled = false;
          }

          const isCheckoutLoading = checkoutInProgressPlanId === plan.id;

          return (
            <Card key={plan.id} className={isCurrentPlan ? "border-primary/50" : undefined}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span>{plan.name}</span>
                  {isCurrentPlan && <Badge variant="outline">Actual</Badge>}
                </CardTitle>
                <CardDescription>{planDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">
                  {formatPlanPrice(plan.monthlyPrice, plan.currency)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {plan.monthlyPrice > 0 ? "/ mes" : ""}
                  </span>
                </p>
                <ul className="mt-4 space-y-2">
                  {planFeatures.map((feature) => (
                    <li key={`${plan.id}-${feature}`} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  type="button"
                  className="w-full"
                  variant={isCurrentPlan ? "outline" : "default"}
                  disabled={ctaDisabled || checkoutInProgressPlanId !== null}
                  onClick={() => handleCheckout(plan)}
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Redirigiendo...
                    </>
                  ) : (
                    <>
                      {ctaLabel}
                      {!ctaDisabled && <ExternalLink className="size-4" />}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
