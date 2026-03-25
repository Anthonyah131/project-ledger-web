"use client"

import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatDate } from "@/lib/date-utils"
import { useLanguage } from "@/context/language-context"
import type { BillingStatusMeta } from "@/lib/billing-utils"
import type { PlanResponse } from "@/types/plan"
import type { BillingSubscriptionResponse } from "@/types/subscription"

function getBadgeToneClass(tone: BillingStatusMeta["tone"]): string {
  switch (tone) {
    case "success":
      return "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
    case "warning":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
    case "danger":
      return "border-destructive/30 bg-destructive/10 text-destructive"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

interface BillingSubscriptionCardProps {
  loading: boolean
  stripeDisabled: boolean
  subscription: BillingSubscriptionResponse | null
  currentStatusMeta: BillingStatusMeta | null
  fallbackCurrentPlan: PlanResponse | null
  subscriptionMissing: boolean
}

export function BillingSubscriptionCard({
  loading,
  stripeDisabled,
  subscription,
  currentStatusMeta,
  fallbackCurrentPlan,
  subscriptionMissing,
}: BillingSubscriptionCardProps) {
  const { t } = useLanguage()

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 pt-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("billing.subscription.loading")}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("billing.subscription.title")}</CardTitle>
        <CardDescription>
          {stripeDisabled
            ? t("billing.subscription.stripeDisabledConfig")
            : t("billing.subscription.stripeSync")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stripeDisabled ? (
          <p className="text-sm text-muted-foreground">
            {t("billing.subscription.stripeDisabledDesc")}
          </p>
        ) : subscription && currentStatusMeta ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={getBadgeToneClass(currentStatusMeta.tone)}>
                {currentStatusMeta.label}
              </Badge>
              <Badge variant="outline">
                {subscription.autoRenews
                  ? t("billing.subscription.autoRenewOn")
                  : t("billing.subscription.autoRenewOff")}
              </Badge>
              {subscription.cancelAtPeriodEnd && (
                <Badge variant="outline">{t("billing.subscription.cancelAtPeriod")}</Badge>
              )}
              {subscription.willDowngradeToFree && (
                <Badge variant="outline">{t("billing.subscription.willDowngrade")}</Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground">{currentStatusMeta.description}</p>

            {subscription.willDowngradeToFree && subscription.downgradeToFreeAt && (
              <p className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-700 dark:text-yellow-300">
                {t("billing.subscription.downgradeDateNote", {
                  date: formatDate(subscription.downgradeToFreeAt, { withYear: true }),
                })}
              </p>
            )}

            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">{t("billing.subscription.fieldPlan")}</p>
                <p className="mt-1 font-medium">{subscription.planName}</p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">{t("billing.subscription.fieldRenewal")}</p>
                <p className="mt-1 font-medium">
                  {subscription.autoRenews
                    ? t("billing.subscription.autoRenewDesc")
                    : t("billing.subscription.noAutoRenew")}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">{t("billing.subscription.fieldUpdated")}</p>
                <p className="mt-1 font-medium">{formatDate(subscription.updatedAt, { withYear: true })}</p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">{t("billing.subscription.fieldPeriodStart")}</p>
                <p className="mt-1 font-medium">
                  {subscription.currentPeriodStart
                    ? formatDate(subscription.currentPeriodStart, { withYear: true })
                    : t("billing.subscription.noData")}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">{t("billing.subscription.fieldPeriodEnd")}</p>
                <p className="mt-1 font-medium">
                  {subscription.currentPeriodEnd
                    ? formatDate(subscription.currentPeriodEnd, { withYear: true })
                    : t("billing.subscription.noData")}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">{t("billing.subscription.fieldDowngradeDate")}</p>
                <p className="mt-1 font-medium">
                  {subscription.willDowngradeToFree && subscription.downgradeToFreeAt
                    ? formatDate(subscription.downgradeToFreeAt, { withYear: true })
                    : t("billing.subscription.notScheduled")}
                </p>
              </div>
            </div>
          </>
        ) : fallbackCurrentPlan ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={getBadgeToneClass("muted")}>
                {subscriptionMissing
                  ? t("billing.subscription.freePlanNoStripe")
                  : t("billing.subscription.noPlanNoStripe")}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              {subscriptionMissing
                ? t("billing.subscription.freePlanDesc", { plan: fallbackCurrentPlan.name })
                : t("billing.subscription.noSubscriptionDesc", { plan: fallbackCurrentPlan.name })}
            </p>

            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">{t("billing.subscription.fieldPlan")}</p>
                <p className="mt-1 font-medium">{fallbackCurrentPlan.name}</p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">{t("billing.subscription.fieldStatus")}</p>
                <p className="mt-1 font-medium">{t("billing.subscription.freeNoBilling")}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {subscriptionMissing
              ? t("billing.subscription.noSubscriptionYet")
              : t("billing.subscription.noInfo")}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
