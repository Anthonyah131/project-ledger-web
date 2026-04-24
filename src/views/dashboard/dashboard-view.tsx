"use client"

import { useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, FolderPlus, HandCoins, Link2, Loader2, PinIcon, Rocket, UserRoundPlus } from "lucide-react"

import { DashboardMonthlyErrorCard } from "@/components/dashboard/monthly/dashboard-monthly-error-card"
import { DashboardMonthlyHeader } from "@/components/dashboard/monthly/dashboard-monthly-header"
import { DashboardMonthlyInactiveWarning } from "@/components/dashboard/monthly/dashboard-monthly-inactive-warning"
import { DashboardMonthlyLoading } from "@/components/dashboard/monthly/dashboard-monthly-loading"
import { DashboardMonthlyPaymentMethodsChart } from "@/components/dashboard/monthly/dashboard-monthly-payment-methods-chart"
import { DashboardMonthlySummaryCards } from "@/components/dashboard/monthly/dashboard-monthly-summary-cards"
import { DashboardMonthlyTopTransactions } from "@/components/dashboard/monthly/dashboard-monthly-top-transactions"
import { DashboardMonthlyTrendChart } from "@/components/dashboard/monthly/dashboard-monthly-trend-chart"
import { DashboardMonthlyBudgetWidget } from "@/components/dashboard/monthly/dashboard-monthly-budget-widget"
import { Button } from "@/components/ui/button"
import { useDateFormat } from "@/hooks/use-date-format"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { useOnboardingContext } from "@/context/onboarding-context"
import { useMonthlyOverview } from "@/hooks/dashboard/use-monthly-overview"
import {
  DashboardDndProvider,
  SortableSection,
  useDashboardLayout,
} from "@/hooks/dashboard/use-dashboard-layout"
import type { DashboardAlert, DashboardTrendDay } from "@/types/dashboard"

export function DashboardView() {
  const { t } = useLanguage()
  const { formatMonthLabel } = useDateFormat()
  const router = useRouter()
  const { user } = useAuth()
  const { openWizard } = useOnboardingContext()
  const {
    layout,
    sensors,
    activeId,
    handleDragStart,
    handleDragEnd,
    isMobile,
  } = useDashboardLayout()

  const {
    selectedMonth,
    data,
    projects,
    selectedProjectId,
    selectedProjectName,
    projectsLoading,
    loading,
    error,
    budget,
    budgetLoading,
    canGoPrevious,
    canGoNext,
    setSelectedMonth,
    goPreviousMonth,
    goNextMonth,
    reload,
    setSelectedProjectId,
    loadMoreProjects,
    projectsHasNextPage,
    projectsLoadMoreLoading,
  } = useMonthlyOverview()

  const observer = useRef<IntersectionObserver | null>(null)
  const lastProjectElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (projectsLoadMoreLoading) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && projectsHasNextPage) {
          loadMoreProjects()
        }
      })

      if (node) observer.current.observe(node)
    },
    [projectsLoadMoreLoading, projectsHasNextPage, loadMoreProjects]
  )

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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
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
              {projects.map((project, index) => {
                const isLast = index === projects.length - 1
                return (
                  <SelectItem key={project.id} value={project.id}>
                    <div
                      className="flex items-center gap-2"
                      ref={isLast ? lastProjectElementRef : undefined}
                    >
                      {project.isPinned && <PinIcon className="size-3 text-muted-foreground mr-1" />}
                      <span className="truncate">{project.name}</span>
                    </div>
                  </SelectItem>
                )
              })}
              {projectsLoadMoreLoading && (
                <div className="flex w-full items-center justify-center p-2">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </SelectContent>
          </Select>
        </section>
      )}

      {!projectsLoading && projects.length === 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/90 px-5 py-7 sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.14),transparent_35%),radial-gradient(circle_at_85%_10%,hsl(var(--accent)/0.16),transparent_40%)]" />

          <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <Rocket className="size-3.5 text-primary" />
              {t("onboarding.setupGuide")}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground sm:text-2xl">{t("dashboard.noProjects")}</h3>
              <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
                {t("dashboard.noProjectsSetupHint")}
              </p>
            </div>

            <ol className="flex w-full flex-wrap items-start justify-center gap-y-4">
              <li className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-2 px-3 py-1">
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/12 text-primary">
                    <UserRoundPlus className="size-4" />
                  </span>
                  <span className="max-w-24 text-center text-xs font-medium text-foreground leading-snug">1. {t("onboarding.steps.partner.title")}</span>
                </div>
                <ArrowRight className="mb-5 size-4 shrink-0 text-muted-foreground/60" />
              </li>

              <li className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-2 px-3 py-1">
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/12 text-primary">
                    <HandCoins className="size-4" />
                  </span>
                  <span className="max-w-24 text-center text-xs font-medium text-foreground leading-snug">2. {t("onboarding.steps.paymentMethod.title")}</span>
                </div>
                <ArrowRight className="mb-5 size-4 shrink-0 text-muted-foreground/60" />
              </li>

              <li className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-2 px-3 py-1">
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/12 text-primary">
                    <FolderPlus className="size-4" />
                  </span>
                  <span className="max-w-24 text-center text-xs font-medium text-foreground leading-snug">3. {t("onboarding.steps.project.title")}</span>
                </div>
                <ArrowRight className="mb-5 size-4 shrink-0 text-muted-foreground/60" />
              </li>

              <li className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-2 px-3 py-1">
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-accent/40 text-foreground">
                    <Link2 className="size-4" />
                  </span>
                  <span className="max-w-24 text-center text-xs font-medium text-foreground leading-snug">4. {t("onboarding.steps.assignPartner.title")}</span>
                </div>
                <ArrowRight className="mb-5 size-4 shrink-0 text-muted-foreground/60" />
              </li>

              <li className="flex items-center">
                <div className="flex flex-col items-center gap-2 px-3 py-1">
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-accent/40 text-foreground">
                    <Link2 className="size-4" />
                  </span>
                  <span className="max-w-24 text-center text-xs font-medium text-foreground leading-snug">5. {t("onboarding.steps.linkPaymentMethod.title")}</span>
                </div>
              </li>
            </ol>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Button size="sm" onClick={openWizard} className="min-w-36">
                {t("onboarding.setupGuide")}
              </Button>
              <Button size="sm" variant="outline" className="min-w-36" onClick={() => router.push("/projects?onboarding=1")}>
                {t("dashboard.startNow")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {(loading || projectsLoading) && (
        <DashboardMonthlyLoading />
      )}

      {!loading && !projectsLoading && error && (
        <DashboardMonthlyErrorCard error={error} onRetry={reload} />
      )}

{!loading && !projectsLoading && data && (
        (() => {
          const rows: React.ReactNode[] = []
          let i = 0
          while (i < layout.length) {
            const sectionId = layout[i]
            if (sectionId === "summary-cards") {
              rows.push(<SortableSection key={sectionId} id={sectionId} isMobile={isMobile}><DashboardMonthlySummaryCards summary={data.summary} comparison={data.comparison} currencyCode={data.currency_code} /></SortableSection>)
            } else if (sectionId === "budget-widget") {
              rows.push(<SortableSection key={sectionId} id={sectionId} isMobile={isMobile}>{selectedProjectId ? <DashboardMonthlyBudgetWidget budget={budget} loading={budgetLoading} currencyCode={data.currency_code} projectId={selectedProjectId} /> : <div className="rounded-2xl border border-border/70 bg-card/70 px-4 py-6 text-sm text-muted-foreground">{t("dashboard.selectProjectDescription")}</div>}</SortableSection>)
            } else if (sectionId === "payment-top-row") {
              rows.push(
                <SortableSection key={sectionId} id={sectionId} isMobile={isMobile}>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                    <DashboardMonthlyPaymentMethodsChart paymentMethodSplit={data.payment_method_split ?? []} currencyCode={data.currency_code} onOpenPaymentMethod={handleOpenPaymentMethod} />
                    <DashboardMonthlyTopTransactions transactions={data.top_transactions ?? []} currencyCode={data.currency_code} scopeLabel={selectedProjectName} />
                  </div>
                </SortableSection>
              )
            } else if (sectionId === "trend-chart") {
              rows.push(<SortableSection key={sectionId} id={sectionId} isMobile={isMobile}><DashboardMonthlyTrendChart trendByDay={data.trend_by_day ?? []} currencyCode={data.currency_code} scopeLabel={selectedProjectName} onOpenDayDetail={handleOpenTrendDay} dailyBudgetRate={data.daily_budget_rate} /></SortableSection>)
            }
            i++
          }
          return <DashboardDndProvider sensors={sensors} handleDragStart={handleDragStart} handleDragEnd={handleDragEnd} layout={layout} activeId={activeId}>{rows}</DashboardDndProvider>
        })()
      )}

      {!user.isActive && <DashboardMonthlyInactiveWarning />}
    </div>
  )
}
