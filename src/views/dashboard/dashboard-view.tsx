"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"

import { DashboardMonthlyCategoriesChart } from "@/components/dashboard/monthly/dashboard-monthly-categories-chart"
import { DashboardMonthlyErrorCard } from "@/components/dashboard/monthly/dashboard-monthly-error-card"
import { DashboardMonthlyHeader } from "@/components/dashboard/monthly/dashboard-monthly-header"
import { DashboardMonthlyInactiveWarning } from "@/components/dashboard/monthly/dashboard-monthly-inactive-warning"
import { DashboardMonthlyLoading } from "@/components/dashboard/monthly/dashboard-monthly-loading"
import { DashboardMonthlyPaymentMethodsChart } from "@/components/dashboard/monthly/dashboard-monthly-payment-methods-chart"
import { DashboardMonthlySummaryCards } from "@/components/dashboard/monthly/dashboard-monthly-summary-cards"
import { DashboardMonthlyTrendChart } from "@/components/dashboard/monthly/dashboard-monthly-trend-chart"
import { formatMonthLabel } from "@/components/dashboard/monthly/dashboard-monthly-format"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { useMonthlyOverview } from "@/hooks/dashboard/use-monthly-overview"
import type { DashboardAlert, DashboardTrendDay } from "@/types/dashboard"

export function DashboardView() {
  const router = useRouter()
  const { user } = useAuth()

  const {
    selectedMonth,
    data,
    projects,
    selectedProjectId,
    selectedProjectName,
    loading,
    error,
    goPreviousMonth,
    goNextMonth,
    reload,
    setSelectedProjectId,
  } = useMonthlyOverview()

  const monthLabel = formatMonthLabel(data?.navigation.currentMonth ?? selectedMonth)
  const displayName = user?.fullName?.trim() || "Usuario"
  const userFirstName = displayName.split(/\s+/)[0] || displayName

  const handleOpenPaymentMethod = useCallback((paymentMethodId: string) => {
    router.push(`/payment-methods/${paymentMethodId}`)
  }, [router])

  const handleOpenAlert = useCallback((alert: DashboardAlert) => {
    if (alert.projectId) {
      router.push(`/projects/${alert.projectId}`)
      return
    }

    if (alert.paymentMethodId) {
      router.push(`/payment-methods/${alert.paymentMethodId}`)
      return
    }

    router.push("/reports")
  }, [router])

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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <DashboardMonthlyHeader
        userFirstName={userFirstName}
        isActive={user.isActive}
        monthLabel={monthLabel}
        generatedAt={data?.generatedAt}
        alerts={data?.alerts ?? []}
        loading={loading}
        canGoNext={Boolean(data?.navigation.hasNextData)}
        onGoPreviousMonth={goPreviousMonth}
        onGoNextMonth={goNextMonth}
        onReload={reload}
        onOpenAlert={handleOpenAlert}
      />

      {error && (
        <DashboardMonthlyErrorCard error={error} onRetry={reload} />
      )}

      {data && (
        <>
          <section>
            <DashboardMonthlySummaryCards
              summary={data.summary}
              comparison={data.comparison}
              currencyCode={data.currencyCode}
            />
          </section>

          <section>
            <DashboardMonthlyPaymentMethodsChart
              paymentMethodSplit={data.paymentMethodSplit}
              currencyCode={data.currencyCode}
              onOpenPaymentMethod={handleOpenPaymentMethod}
            />
          </section>

          <section className="space-y-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Proyecto analizado
              </p>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-full bg-background/80 sm:w-72">
                  <SelectValue placeholder="Todos los proyectos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proyectos</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <DashboardMonthlyTrendChart
                trendByDay={data.trendByDay}
                currencyCode={data.currencyCode}
                scopeLabel={selectedProjectName}
                onOpenDayDetail={handleOpenTrendDay}
              />

              <DashboardMonthlyCategoriesChart
                topCategories={data.topCategories}
                currencyCode={data.currencyCode}
                scopeLabel={selectedProjectName}
              />
            </div>
          </section>
        </>
      )}

      {!user.isActive && <DashboardMonthlyInactiveWarning />}
    </div>
  )
}
