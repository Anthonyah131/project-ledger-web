"use client";

import { RefreshCw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BillingSubscriptionCard } from "@/components/billing/billing-subscription-card";
import { BillingPlansGrid } from "@/components/billing/billing-plans-grid";
import { useBillingView } from "@/hooks/billing/use-billing-view";
import { useLanguage } from "@/context/language-context";

export function BillingView() {
  const { t } = useLanguage();
  const {
    plans,
    subscription,
    subscriptionMissing,
    stripeDisabled,
    stripeDisabledReason,
    loading,
    error,
    actionInProgressPlanId,
    actionInProgressType,
    effectiveCurrentPlanId,
    hasManageableSubscription,
    currentStatusMeta,
    fallbackCurrentPlan,
    loadBillingData,
    handlePlanAction,
  } = useBillingView();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("billing.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("billing.subtitle")}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={loadBillingData} disabled={loading}>
          <RefreshCw className="size-4" />
          {t("billing.update")}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t("billing.errorTitle")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {stripeDisabled && (
        <Alert>
          <AlertTitle>{t("billing.unavailable")}</AlertTitle>
          <AlertDescription>
            {stripeDisabledReason ?? t("billing.stripeDisabled")}
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
