"use client"

import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { formatPlanPrice } from "@/lib/billing-utils"
import { getPlanDescription, getPlanFeatures } from "@/data/site-data"
import { useLanguage } from "@/context/language-context"
import type { PlanResponse } from "@/types/plan"

interface BillingPlansGridProps {
  plans: PlanResponse[]
  effectiveCurrentPlanId: string | null
  stripeDisabled: boolean
  hasManageableSubscription: boolean
  actionInProgressPlanId: string | null
  actionInProgressType: "checkout" | "change-plan" | "cancel" | null
  onPlanAction: (plan: PlanResponse) => void
}

export function BillingPlansGrid({
  plans,
  effectiveCurrentPlanId,
  stripeDisabled,
  hasManageableSubscription,
  actionInProgressPlanId,
  actionInProgressType,
  onPlanAction,
}: BillingPlansGridProps) {
  const { t, locale } = useLanguage()

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan) => {
        const planDescription = getPlanDescription(plan, t)
        const planFeatures = getPlanFeatures(plan.slug, t, 5)
        const isCurrentPlan = effectiveCurrentPlanId
          ? effectiveCurrentPlanId === plan.id
          : plan.slug.toLowerCase() === "free"
        const isPaidPlan = plan.monthlyPrice > 0

        let actionType: "none" | "checkout" | "change-plan" | "cancel" = "none"
        if (!stripeDisabled && !isCurrentPlan) {
          if (isPaidPlan) {
            actionType = hasManageableSubscription ? "change-plan" : "checkout"
          } else if (hasManageableSubscription) {
            actionType = "cancel"
          }
        }

        const ctaLabelByAction: Record<typeof actionType, string> = {
          none: t("billing.noPaymentRequired"),
          checkout: t("billing.subscribe"),
          "change-plan": t("billing.switchToPlan"),
          cancel: t("billing.switchToFree"),
        }

        const ctaLabel = stripeDisabled && !isCurrentPlan
          ? t("billing.billingDisabled")
          : isCurrentPlan
            ? t("billing.currentPlan")
            : ctaLabelByAction[actionType]
        const ctaDisabled = stripeDisabled || isCurrentPlan || actionType === "none"

        const isActionLoading = actionInProgressPlanId === plan.id
        const loadingLabelByAction: Record<Exclude<typeof actionType, "none">, string> = {
          checkout: t("billing.redirecting"),
          "change-plan": t("billing.updatingPlan"),
          cancel: t("billing.schedulingCancellation"),
        }

        return (
          <Card key={plan.id} className={isCurrentPlan ? "border-primary/50" : undefined}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>{plan.name}</span>
                {isCurrentPlan && <Badge variant="outline">{t("billing.current")}</Badge>}
              </CardTitle>
              <CardDescription>{planDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">
                {formatPlanPrice(plan.monthlyPrice, plan.currency, locale)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  {plan.monthlyPrice > 0 ? t("billing.perMonth") : ""}
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
                disabled={ctaDisabled || actionInProgressPlanId !== null}
                onClick={() => onPlanAction(plan)}
              >
                {isActionLoading && actionInProgressType ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {loadingLabelByAction[actionInProgressType]}
                  </>
                ) : (
                  <>
                    {ctaLabel}
                    {actionType === "checkout" && <ExternalLink className="size-4" />}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </section>
  )
}
