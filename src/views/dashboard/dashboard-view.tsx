"use client"

// views/dashboard/dashboard-view.tsx
import { useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"

import { DashboardMonthlyAlertsPanel } from "@/components/dashboard/monthly/dashboard-monthly-alerts-panel"
import { DashboardMonthlyCategoriesChart } from "@/components/dashboard/monthly/dashboard-monthly-categories-chart"
import {
  DashboardMonthlyErrorCard,
} from "@/components/dashboard/monthly/dashboard-monthly-error-card"
import {
  DashboardMonthlyHeader,
} from "@/components/dashboard/monthly/dashboard-monthly-header"
import {
  DashboardMonthlyInactiveWarning,
} from "@/components/dashboard/monthly/dashboard-monthly-inactive-warning"
import { DashboardMonthlyLoading } from "@/components/dashboard/monthly/dashboard-monthly-loading"
import {
  DashboardMonthlyPaymentMethodsChart,
} from "@/components/dashboard/monthly/dashboard-monthly-payment-methods-chart"
import {
  DashboardMonthlyProjectHealth,
} from "@/components/dashboard/monthly/dashboard-monthly-project-health"
import {
  DashboardMonthlyStatusBadges,
} from "@/components/dashboard/monthly/dashboard-monthly-status-badges"
import {
  DashboardMonthlySummaryCards,
} from "@/components/dashboard/monthly/dashboard-monthly-summary-cards"
import { DashboardMonthlyTrendChart } from "@/components/dashboard/monthly/dashboard-monthly-trend-chart"
import { formatMonthLabel } from "@/components/dashboard/monthly/dashboard-monthly-format"
import { useMonthlyOverview } from "@/hooks/dashboard/use-monthly-overview"
import { useAuth } from "@/context/auth-context"
import type { DashboardAlert, DashboardTrendDay } from "@/types/dashboard"

//  View 
export function DashboardView() {
  const router = useRouter()
  const { user } = useAuth()
  const {
    selectedMonth,
    data,
    loading,
    error,
    goPreviousMonth,
    goNextMonth,
    reload,
  } = useMonthlyOverview()

  const monthLabel = formatMonthLabel(data?.navigation.currentMonth ?? selectedMonth)
  const userFirstName = user?.fullName.split(" ")[0] ?? user?.fullName ?? "Usuario"

  const projectHealth = data?.projectHealth ?? []

  const defaultAlertProjectId = useMemo(() => {
    if (projectHealth.length === 0) return null

    const withWorstNet = [...projectHealth].sort((a, b) => a.net - b.net)
    return withWorstNet[0]?.projectId ?? projectHealth[0].projectId
  }, [projectHealth])

  const handleOpenProject = useCallback((projectId: string) => {
    router.push(`/projects/${projectId}`)
  }, [router])

  const handleOpenPaymentMethod = useCallback((paymentMethodId: string) => {
    router.push(`/payment-methods/${paymentMethodId}`)
  }, [router])

  const handleOpenAlert = useCallback((alert: DashboardAlert) => {
    if (alert.projectId) {
      router.push(`/projects/${alert.projectId}`)
      return
    }

    const fallbackProjectId =
      alert.code === "NEGATIVE_NET_BALANCE"
        ? defaultAlertProjectId
        : projectHealth[0]?.projectId ?? null

    if (fallbackProjectId) {
      router.push(`/projects/${fallbackProjectId}`)
      return
    }

    router.push("/projects")
  }, [defaultAlertProjectId, projectHealth, router])

  const handleOpenTrendDay = useCallback((day: DashboardTrendDay) => {
    const query = new URLSearchParams({
      from: day.date,
      to: day.date,
      autogenerate: "1",
    })

    const projectIds = Array.from(new Set(day.projectIds ?? []))
    if (projectIds.length > 0) {
      query.set("projectId", projectIds[0])
    }
    if (projectIds.length > 1) {
      query.set("projectIds", projectIds.join(","))
    }

    router.push(`/reports?${query.toString()}`)
  }, [router])

  if (!user) return null
  if (loading && !data) return <DashboardMonthlyLoading />

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      <DashboardMonthlyHeader
        userFirstName={userFirstName}
        monthLabel={monthLabel}
        generatedAt={data?.generatedAt}
        loading={loading}
        canGoNext={Boolean(data?.navigation.hasNextData)}
        onGoPreviousMonth={goPreviousMonth}
        onGoNextMonth={goNextMonth}
        onReload={reload}
      />

      <DashboardMonthlyStatusBadges
        isActive={user.isActive}
        isAdmin={user.isAdmin}
        loading={loading}
      />

      {error && (
        <DashboardMonthlyErrorCard error={error} onRetry={reload} />
      )}

      {data && (
        <>
          <section className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Resumen ejecutivo
              </h2>
              <p className="text-sm text-muted-foreground">
                Panorama rapido de gastos, ingresos, balance y salud operativa del mes.
              </p>
            </div>
            <DashboardMonthlySummaryCards
              summary={data.summary}
              comparison={data.comparison}
              currencyCode={data.currencyCode}
            />
          </section>

          <section className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Analitica mensual
              </h2>
              <p className="text-sm text-muted-foreground">
                Evolucion diaria, concentracion por categorias y distribucion por metodos de pago.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="min-w-0 xl:col-span-2">
                <DashboardMonthlyTrendChart
                  trendByDay={data.trendByDay}
                  currencyCode={data.currencyCode}
                  onOpenDayDetail={handleOpenTrendDay}
                />
              </div>
              <DashboardMonthlyAlertsPanel alerts={data.alerts} onOpenAlert={handleOpenAlert} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <DashboardMonthlyCategoriesChart
                topCategories={data.topCategories}
                currencyCode={data.currencyCode}
              />
              <DashboardMonthlyPaymentMethodsChart
                paymentMethodSplit={data.paymentMethodSplit}
                currencyCode={data.currencyCode}
                onOpenPaymentMethod={handleOpenPaymentMethod}
              />
            </div>
          </section>

          <section className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Proyectos
              </h2>
              <p className="text-sm text-muted-foreground">
                Estado financiero de cada proyecto y consumo relativo del presupuesto.
              </p>
            </div>
            <DashboardMonthlyProjectHealth
              projectHealth={data.projectHealth}
              currencyCode={data.currencyCode}
              onOpenProject={handleOpenProject}
            />
          </section>

        </>
      )}

      {/*  Inactive warning  */}
      {!user.isActive && <DashboardMonthlyInactiveWarning />}
    </div>
  )
}
