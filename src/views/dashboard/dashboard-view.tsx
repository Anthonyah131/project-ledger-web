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
import { useDateFormat } from "@/hooks/use-date-format"
import { EmptyState } from "@/components/shared/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { useMonthlyOverview } from "@/hooks/dashboard/use-monthly-overview"
import type { DashboardAlert, DashboardTrendDay } from "@/types/dashboard"

export function DashboardView() {
  const { t } = useLanguage()
  const { formatMonthLabel } = useDateFormat()
  const router = useRouter()
  const { user } = useAuth()

  const {
    selectedMonth,
    data,
    projects,
    selectedProjectId,
    selectedProjectName,
    projectsLoading,
    loading,
    error,
    canGoPrevious,
    canGoNext,
    setSelectedMonth,
    goPreviousMonth,
    goNextMonth,
    reload,
    setSelectedProjectId,
  } = useMonthlyOverview()

  const monthLabel = formatMonthLabel(data?.navigation.current_month ?? selectedMonth)
  const displayName = user?.fullName?.trim() || "Usuario"
  const userFirstName = displayName.split(/\s+/)[0] || displayName

  const handleOpenPaymentMethod = useCallback((paymentMethodId: string) => {
    router.push(`/payment-methods/${paymentMethodId}`)
  }, [router])

  const handleOpenAlert = useCallback((alert: DashboardAlert) => {
    if (alert.project_id) {
      router.push(`/projects/${alert.project_id}`)
      return
    }

    if (alert.payment_method_id) {
      router.push(`/payment-methods/${alert.payment_method_id}`)
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

    const projectIds = Array.from(new Set(day.project_ids ?? []))
    if (projectIds.length > 0) {
      query.set("projectId", projectIds[0])
    }
    if (projectIds.length > 1) {
      query.set("projectIds", projectIds.join(","))
    }

    router.push(`/reports?${query.toString()}`)
  }, [router])

  if (!user) return null

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <DashboardMonthlyHeader
        userFirstName={userFirstName}
        isActive={user.isActive}
        monthLabel={monthLabel}
        selectedMonth={selectedMonth}
        generatedAt={data?.generated_at}
        alerts={data?.alerts ?? []}
        loading={loading}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onGoPreviousMonth={goPreviousMonth}
        onGoNextMonth={goNextMonth}
        onSelectMonth={setSelectedMonth}
        onReload={reload}
        onOpenAlert={handleOpenAlert}
      />

      {projects.length > 0 && (
        <section className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t("dashboard.projectAnalyzed")}
          </p>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full bg-background/80 sm:w-72">
              <SelectValue placeholder={t("dashboard.selectProject")} />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>
      )}

      {!projectsLoading && projects.length === 0 && (
        <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-6">
          <EmptyState
            hasSearch={false}
            onCreate={() => router.push("/workspaces")}
            title={t("dashboard.noProjects")}
            description={t("dashboard.noProjectsWorkspaceRequired")}
            createLabel={t("dashboard.createWorkspace")}
          />
        </div>
      )}

      {projects.length > 0 && !selectedProjectId && (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-4 py-6 text-sm text-muted-foreground">
          {t("dashboard.selectProjectDescription")}
        </div>
      )}

      {(loading || projectsLoading) && (
        <DashboardMonthlyLoading />
      )}

      {!loading && !projectsLoading && error && (
        <DashboardMonthlyErrorCard error={error} onRetry={reload} />
      )}

      {!loading && !projectsLoading && data && (
        <>
          <section>
            <DashboardMonthlySummaryCards
              summary={data.summary}
              comparison={data.comparison}
              currencyCode={data.currency_code}
            />
          </section>

          <section>
            <DashboardMonthlyPaymentMethodsChart
              paymentMethodSplit={data.payment_method_split ?? []}
              currencyCode={data.currency_code}
              onOpenPaymentMethod={handleOpenPaymentMethod}
            />
          </section>

          <section className="space-y-4">
            <DashboardMonthlyTrendChart
              trendByDay={data.trend_by_day ?? []}
              currencyCode={data.currency_code}
              scopeLabel={selectedProjectName}
              onOpenDayDetail={handleOpenTrendDay}
            />

            <DashboardMonthlyCategoriesChart
              topCategories={data.top_categories ?? []}
              currencyCode={data.currency_code}
              scopeLabel={selectedProjectName}
            />
          </section>
        </>
      )}

      {!user.isActive && <DashboardMonthlyInactiveWarning />}
    </div>
  )
}
