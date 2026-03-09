"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BillingSubscriptionCard } from "@/views/billing/components/billing-subscription-card";
import { BillingPlansGrid } from "@/views/billing/components/billing-plans-grid";
import { ApiClientError } from "@/lib/api-client";
import { getBillingStatusMeta } from "@/lib/billing-utils";
import { useAuth } from "@/context/auth-context";
import * as billingService from "@/services/billing-service";
import * as planService from "@/services/plan-service";
import type { PlanResponse } from "@/types/plan";
import type { BillingSubscriptionResponse, BillingSubscriptionStatus } from "@/types/subscription";

function getBillingErrorMessage(err: unknown): string {
  if (billingService.isStripeDisabledError(err)) {
    return "La facturación con Stripe está deshabilitada por configuración.";
  }

  if (err instanceof ApiClientError) {
    if (err.status === 401) return "Tu sesión expiró. Inicia sesión nuevamente.";
    if (err.status === 403) return "No tienes permisos para consultar la facturación.";
    return err.message;
  }

  if (err instanceof Error) return err.message;
  return "No fue posible cargar la información de facturación.";
}

const MANAGEABLE_SUBSCRIPTION_STATUSES: readonly BillingSubscriptionStatus[] = [
  "active",
  "trialing",
  "past_due",
  "incomplete",
];

function isManageableSubscription(subscription: BillingSubscriptionResponse | null): boolean {
  if (!subscription?.stripeSubscriptionId) return false;
  return MANAGEABLE_SUBSCRIPTION_STATUSES.includes(subscription.status);
}

export function BillingView() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [subscription, setSubscription] = useState<BillingSubscriptionResponse | null>(null);
  const [subscriptionMissing, setSubscriptionMissing] = useState(false);
  const [stripeDisabled, setStripeDisabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoCheckoutDone, setAutoCheckoutDone] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [actionInProgressPlanId, setActionInProgressPlanId] = useState<string | null>(null);
  const [actionInProgressType, setActionInProgressType] = useState<
    "checkout" | "change-plan" | "cancel" | null
  >(null);

  const loadBillingData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStripeDisabled(false);

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
      } else if (billingService.isStripeDisabledError(subscriptionResult.reason)) {
        setSubscription(null);
        setSubscriptionMissing(false);
        setStripeDisabled(true);
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
  const hasManageableSubscription = useMemo(() => isManageableSubscription(subscription), [subscription]);

  const startCheckout = useCallback(async (planId: string) => {
    setError(null);
    setActionInProgressPlanId(planId);
    setActionInProgressType("checkout");

    try {
      const session = await billingService.createCheckoutSession({ planId });
      window.location.href = session.checkoutUrl;
    } catch (err) {
      if (billingService.isStripeDisabledError(err)) {
        setStripeDisabled(true);
        setError(null);
      } else {
        setError(getBillingErrorMessage(err));
      }
    } finally {
      setActionInProgressPlanId(null);
      setActionInProgressType(null);
    }
  }, []);

  const changePlan = useCallback(async (planId: string) => {
    setError(null);
    setActionInProgressPlanId(planId);
    setActionInProgressType("change-plan");

    try {
      const updatedSubscription = await billingService.changePlan({
        planId,
        prorate: true,
      });
      setSubscription(updatedSubscription);
      setSubscriptionMissing(false);
    } catch (err) {
      if (billingService.isStripeDisabledError(err)) {
        setStripeDisabled(true);
        setError(null);
      } else {
        setError(getBillingErrorMessage(err));
      }
    } finally {
      setActionInProgressPlanId(null);
      setActionInProgressType(null);
    }
  }, []);

  const cancelAtPeriodEnd = useCallback(async (targetPlanId: string) => {
    setError(null);
    setActionInProgressPlanId(targetPlanId);
    setActionInProgressType("cancel");

    try {
      const updatedSubscription = await billingService.cancelSubscription({
        cancelAtPeriodEnd: true,
      });
      setSubscription(updatedSubscription);
      setSubscriptionMissing(false);
    } catch (err) {
      if (billingService.isStripeDisabledError(err)) {
        setStripeDisabled(true);
        setError(null);
      } else {
        setError(getBillingErrorMessage(err));
      }
    } finally {
      setActionInProgressPlanId(null);
      setActionInProgressType(null);
    }
  }, []);

  const handlePlanAction = useCallback((plan: PlanResponse) => {
    if (stripeDisabled) return;

    const isPaidPlan = plan.monthlyPrice > 0;

    if (isPaidPlan) {
      if (hasManageableSubscription) {
        void changePlan(plan.id);
      } else {
        void startCheckout(plan.id);
      }
      return;
    }

    if (hasManageableSubscription) {
      void cancelAtPeriodEnd(plan.id);
    }
  }, [cancelAtPeriodEnd, changePlan, hasManageableSubscription, startCheckout, stripeDisabled]);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("checkoutPlanId");
    setCheckoutPlanId(value);
  }, []);

  useEffect(() => {
    if (loading || autoCheckoutDone) return;
    if (stripeDisabled) return;
    if (!checkoutPlanId) return;

    const targetPlan = plans.find((plan) => plan.id === checkoutPlanId);
    if (!targetPlan || targetPlan.monthlyPrice <= 0) return;

    const isCurrentPlan = effectiveCurrentPlanId
      ? effectiveCurrentPlanId === targetPlan.id
      : targetPlan.slug.toLowerCase() === "free";

    if (isCurrentPlan) return;

    setAutoCheckoutDone(true);
    handlePlanAction(targetPlan);
  }, [loading, autoCheckoutDone, stripeDisabled, checkoutPlanId, plans, effectiveCurrentPlanId, handlePlanAction]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Facturación</h1>
          <p className="text-sm text-muted-foreground">Gestiona tu plan, upgrades/downgrades y estado real de tu suscripción.</p>
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

      {stripeDisabled && (
        <Alert>
          <AlertTitle>Facturación no disponible</AlertTitle>
          <AlertDescription>
            Stripe está deshabilitado por configuración del entorno. Las acciones de suscripción y checkout no están disponibles.
          </AlertDescription>
        </Alert>
      )}

      <BillingSubscriptionCard
        loading={loading}
        stripeDisabled={stripeDisabled}
        subscription={subscription}
        currentStatusMeta={currentStatusMeta}
        fallbackCurrentPlan={fallbackCurrentPlan}
        subscriptionMissing={subscriptionMissing}
      />

      <BillingPlansGrid
        plans={plans}
        effectiveCurrentPlanId={effectiveCurrentPlanId}
        stripeDisabled={stripeDisabled}
        hasManageableSubscription={hasManageableSubscription}
        actionInProgressPlanId={actionInProgressPlanId}
        actionInProgressType={actionInProgressType}
        onPlanAction={handlePlanAction}
      />
    </div>
  );
}
