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
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 pt-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando estado de suscripción...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suscripción actual</CardTitle>
        <CardDescription>
          {stripeDisabled
            ? "Stripe deshabilitado por configuración"
            : "Estado sincronizado con Stripe"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stripeDisabled ? (
          <p className="text-sm text-muted-foreground">
            La facturación de pago está temporalmente desactivada. Puedes seguir usando el producto, pero no se pueden iniciar checkouts ni modificar suscripciones hasta que Stripe vuelva a habilitarse.
          </p>
        ) : subscription && currentStatusMeta ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={getBadgeToneClass(currentStatusMeta.tone)}>
                {currentStatusMeta.label}
              </Badge>
              <Badge variant="outline">
                {subscription.autoRenews ? "Renovación automática activa" : "Renovación automática desactivada"}
              </Badge>
              {subscription.cancelAtPeriodEnd && (
                <Badge variant="outline">Cancelación al final del período</Badge>
              )}
              {subscription.willDowngradeToFree && (
                <Badge variant="outline">Bajará a Free al cierre del ciclo</Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground">{currentStatusMeta.description}</p>

            {subscription.willDowngradeToFree && subscription.downgradeToFreeAt && (
              <p className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-700 dark:text-yellow-300">
                Tu plan actual se mantendrá hasta el {formatDate(subscription.downgradeToFreeAt, { withYear: true })}.
                Luego pasarás automáticamente a Free.
              </p>
            )}

            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">Plan</p>
                <p className="mt-1 font-medium">{subscription.planName}</p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">Renovación</p>
                <p className="mt-1 font-medium">
                  {subscription.autoRenews ? "Se intentará cobrar automáticamente" : "Sin renovación automática"}
                </p>
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
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">Baja a Free</p>
                <p className="mt-1 font-medium">
                  {subscription.willDowngradeToFree && subscription.downgradeToFreeAt
                    ? formatDate(subscription.downgradeToFreeAt, { withYear: true })
                    : "No programada"}
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
  )
}
