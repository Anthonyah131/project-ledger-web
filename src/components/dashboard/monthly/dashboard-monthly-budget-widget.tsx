"use client"

// components/dashboard/monthly/dashboard-monthly-budget-widget.tsx
// Shows the selected project's budget status in the monthly dashboard.

import { memo } from "react"
import Link from "next/link"
import { PiggyBank, ArrowRight, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/context/language-context"
import { BudgetProgressBadge, BudgetProgressBadgeSkeleton } from "@/components/shared/budget-progress-badge"
import type { ProjectBudgetResponse } from "@/types/project-budget"

interface DashboardMonthlyBudgetWidgetProps {
  budget: ProjectBudgetResponse | null
  loading: boolean
  currencyCode: string
  projectId: string
}

function DashboardMonthlyBudgetWidgetComponent({
  budget,
  loading,
  currencyCode,
  projectId,
}: DashboardMonthlyBudgetWidgetProps) {
  const { t } = useLanguage()

  const isExceeded = budget?.alertLevel === "exceeded"
  const isCritical = budget?.alertLevel === "critical"
  const isWarning = budget?.alertLevel === "warning"

  const headerBorderClass = isExceeded || isCritical
    ? "border-rose-500/25 bg-gradient-to-r from-rose-500/8 via-card to-card"
    : isWarning
    ? "border-amber-500/25 bg-gradient-to-r from-amber-500/8 via-card to-card"
    : "border-violet-500/20 bg-gradient-to-r from-violet-500/8 via-card to-card"

  const cardBorderClass = isExceeded || isCritical
    ? "border-rose-500/20 shadow-rose-500/5"
    : isWarning
    ? "border-amber-500/20 shadow-amber-500/5"
    : "border-violet-500/20 shadow-violet-500/5"

  const iconBgClass = isExceeded || isCritical
    ? "from-rose-500/20 to-red-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20"
    : isWarning
    ? "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20"
    : "from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400 border-violet-500/20"

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card shadow-sm overflow-hidden",
        cardBorderClass,
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b",
          headerBorderClass,
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "size-8 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 border",
              iconBgClass,
            )}
          >
            {(isExceeded || isCritical) ? (
              <AlertTriangle className="size-4" />
            ) : (
              <PiggyBank className="size-4" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("budget.panel.title")}
          </h3>
        </div>

        {projectId && (
          <Link
            href={`/projects/${projectId}?tab=budget`}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors group"
            aria-label={t("budget.badge.viewDetail")}
          >
            {t("budget.badge.viewDetail")}
            <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3.5">
        {loading ? (
          <BudgetProgressBadgeSkeleton compact={false} />
        ) : budget ? (
          <BudgetProgressBadge
            budget={budget}
            currencyCode={currencyCode}
            compact={false}
          />
        ) : (
          <p className="text-xs text-muted-foreground py-1">
            {t("budget.noBudget")}
          </p>
        )}
      </div>
    </div>
  )
}

export const DashboardMonthlyBudgetWidget = memo(DashboardMonthlyBudgetWidgetComponent)
