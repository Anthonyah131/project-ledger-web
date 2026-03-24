"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { ApiClientError } from "@/lib/api-client"
import { getBillingStatusMeta } from "@/lib/billing-utils"
import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import * as billingService from "@/services/billing-service"
import * as planService from "@/services/plan-service"
import type { PlanResponse } from "@/types/plan"
import type { BillingSubscriptionResponse, BillingSubscriptionStatus } from "@/types/subscription"

const MANAGEABLE_SUBSCRIPTION_STATUSES: readonly BillingSubscriptionStatus[] = [
  "active",
  "trialing",
  "past_due",
  "incomplete",
]

function isManageableSubscription(subscription: BillingSubscriptionResponse | null): boolean {
  if (!subscription?.stripeSubscriptionId) return false
  return MANAGEABLE_SUBSCRIPTION_STATUSES.includes(subscription.status)
}

function getBillingErrorMessage(err: unknown, t: (key: string) => string): string {
  if (billingService.isStripeDisabledError(err)) return t("billing.stripeDisabled")
  if (err instanceof ApiClientError) {
    if (err.status === 401) return t("billing.errors.sessionExpired")
    if (err.status === 403) return t("billing.errors.forbidden")
    return err.message
  }
  if (err instanceof Error) return err.message
  return t("billing.errors.loadFailed")
}

export function useBillingView() {
  const { t } = useLanguage()
  const { user } = useAuth()

  const [plans, setPlans] = useState<PlanResponse[]>([])
  const [subscription, setSubscription] = useState<BillingSubscriptionResponse | null>(null)
  const [subscriptionMissing, setSubscriptionMissing] = useState(false)
  const [stripeDisabled, setStripeDisabled] = useState(false)
  const [stripeDisabledReason, setStripeDisabledReason] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoCheckoutDone, setAutoCheckoutDone] = useState(false)
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null)
  const [actionInProgressPlanId, setActionInProgressPlanId] = useState<string | null>(null)
  const [actionInProgressType, setActionInProgressType] = useState<
    "checkout" | "change-plan" | "cancel" | null
  >(null)

  const loadBillingData = useCallback(async () => {
    setLoading(true)
    setError(null)
    setStripeDisabled(false)
    setStripeDisabledReason(null)

    try {
      const plansPromise = planService.getPlans()
      const billingStatusPromise = billingService
        .getBillingStatus()
        .then((value) => ({ ok: true as const, value }))
        .catch((reason: unknown) => ({ ok: false as const, reason }))
      const subscriptionPromise = billingService
        .getMySubscription()
        .then((value) => ({ ok: true as const, value }))
        .catch((reason: unknown) => ({ ok: false as const, reason }))

      const [plansData, billingStatusResult, subscriptionResult] = await Promise.all([
        plansPromise,
        billingStatusPromise,
        subscriptionPromise,
      ])

      setPlans([...plansData].sort((a, b) => a.displayOrder - b.displayOrder))

      if (billingStatusResult.ok) {
        setStripeDisabled(!billingStatusResult.value.stripeEnabled)
        setStripeDisabledReason(billingStatusResult.value.reason)
      } else if (billingService.isStripeDisabledError(billingStatusResult.reason)) {
        setStripeDisabled(true)
        setStripeDisabledReason(null)
      } else {
        throw billingStatusResult.reason
      }

      if (subscriptionResult.ok) {
        setSubscription(subscriptionResult.value)
        setSubscriptionMissing(false)
      } else if (subscriptionResult.reason instanceof ApiClientError && subscriptionResult.reason.status === 404) {
        setSubscription(null)
        setSubscriptionMissing(true)
      } else if (billingService.isStripeDisabledError(subscriptionResult.reason)) {
        setStripeDisabled(true)
        setStripeDisabledReason(null)
      } else {
        throw subscriptionResult.reason
      }
    } catch (err) {
      setError(getBillingErrorMessage(err, t))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadBillingData()
  }, [loadBillingData])

  const currentStatusMeta = useMemo(
    () => (subscription ? getBillingStatusMeta(subscription.status) : null),
    [subscription],
  )

  const freePlan = useMemo(
    () => plans.find((plan) => plan.slug.toLowerCase() === "free") ?? null,
    [plans],
  )

  const fallbackCurrentPlan = useMemo(() => {
    if (subscription) return null
    if (subscriptionMissing && freePlan) return freePlan
    if (!user?.planId) return null
    return plans.find((plan) => plan.id === user.planId) ?? null
  }, [subscription, subscriptionMissing, freePlan, user?.planId, plans])

  const effectiveCurrentPlanId = subscription?.planId ?? fallbackCurrentPlan?.id ?? null
  const hasManageableSubscription = useMemo(() => isManageableSubscription(subscription), [subscription])

  const startCheckout = useCallback(async (planId: string) => {
    setError(null)
    setActionInProgressPlanId(planId)
    setActionInProgressType("checkout")
    try {
      const session = await billingService.createCheckoutSession({ planId })
      window.location.href = session.checkoutUrl
    } catch (err) {
      if (billingService.isStripeDisabledError(err)) {
        setStripeDisabled(true)
        setStripeDisabledReason(null)
      } else {
        setError(getBillingErrorMessage(err, t))
      }
    } finally {
      setActionInProgressPlanId(null)
      setActionInProgressType(null)
    }
  }, [t])

  const changePlan = useCallback(async (planId: string) => {
    setError(null)
    setActionInProgressPlanId(planId)
    setActionInProgressType("change-plan")
    try {
      const updatedSubscription = await billingService.changePlan({ planId, prorate: true })
      setSubscription(updatedSubscription)
      setSubscriptionMissing(false)
    } catch (err) {
      if (billingService.isStripeDisabledError(err)) {
        setStripeDisabled(true)
        setStripeDisabledReason(null)
      } else {
        setError(getBillingErrorMessage(err, t))
      }
    } finally {
      setActionInProgressPlanId(null)
      setActionInProgressType(null)
    }
  }, [t])

  const cancelAtPeriodEnd = useCallback(async (targetPlanId: string) => {
    setError(null)
    setActionInProgressPlanId(targetPlanId)
    setActionInProgressType("cancel")
    try {
      const updatedSubscription = await billingService.cancelSubscription({ cancelAtPeriodEnd: true })
      setSubscription(updatedSubscription)
      setSubscriptionMissing(false)
    } catch (err) {
      if (billingService.isStripeDisabledError(err)) {
        setStripeDisabled(true)
        setStripeDisabledReason(null)
      } else {
        setError(getBillingErrorMessage(err, t))
      }
    } finally {
      setActionInProgressPlanId(null)
      setActionInProgressType(null)
    }
  }, [t])

  const handlePlanAction = useCallback((plan: PlanResponse) => {
    if (stripeDisabled) return
    const isPaidPlan = plan.monthlyPrice > 0
    if (isPaidPlan) {
      if (hasManageableSubscription) {
        void changePlan(plan.id)
      } else {
        void startCheckout(plan.id)
      }
      return
    }
    if (hasManageableSubscription) {
      void cancelAtPeriodEnd(plan.id)
    }
  }, [cancelAtPeriodEnd, changePlan, hasManageableSubscription, startCheckout, stripeDisabled])

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("checkoutPlanId")
    setCheckoutPlanId(value)
  }, [])

  useEffect(() => {
    if (loading || autoCheckoutDone) return
    if (stripeDisabled) return
    if (!checkoutPlanId) return
    const targetPlan = plans.find((plan) => plan.id === checkoutPlanId)
    if (!targetPlan || targetPlan.monthlyPrice <= 0) return
    const isCurrentPlan = effectiveCurrentPlanId
      ? effectiveCurrentPlanId === targetPlan.id
      : targetPlan.slug.toLowerCase() === "free"
    if (isCurrentPlan) return
    setAutoCheckoutDone(true)
    handlePlanAction(targetPlan)
  }, [loading, autoCheckoutDone, stripeDisabled, checkoutPlanId, plans, effectiveCurrentPlanId, handlePlanAction])

  return {
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
  }
}
