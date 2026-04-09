"use client"

// components/shared/budget-progress-badge.tsx
// Reusable budget progress indicator — used in ProjectHeader and Dashboard.

import { memo } from "react"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/format-utils"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLanguage } from "@/context/language-context"
import type { BudgetAlertLevel, ProjectBudgetResponse } from "@/types/project-budget"

// ─── Color maps per alert level ─────────────────────────────────────────────

const BAR_CLASSES: Record<BudgetAlertLevel, string> = {
  normal:   "bg-gradient-to-r from-emerald-500 to-green-500",
  warning:  "bg-gradient-to-r from-amber-400 to-orange-500",
  critical: "bg-gradient-to-r from-rose-500 to-red-500",
  exceeded: "bg-gradient-to-r from-red-600 to-rose-600",
}

const LABEL_CLASSES: Record<BudgetAlertLevel, string> = {
  normal:   "text-emerald-600 dark:text-emerald-400",
  warning:  "text-amber-600 dark:text-amber-400",
  critical: "text-rose-600 dark:text-rose-400",
  exceeded: "text-destructive",
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function BudgetProgressBadgeSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-1.5 w-28 rounded-full" />
        <Skeleton className="h-3.5 w-8 rounded" />
      </div>
    )
  }
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3.5 w-10" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-3 w-40" />
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

interface BudgetProgressBadgeProps {
  budget: ProjectBudgetResponse
  currencyCode: string
  /** compact = mini bar for headers; default = expanded for dashboard */
  compact?: boolean
  className?: string
}

function BudgetProgressBadgeComponent({
  budget,
  currencyCode,
  compact = false,
  className,
}: BudgetProgressBadgeProps) {
  const { t } = useLanguage()

  const progressWidth = Math.max(0, Math.min(100, budget.spentPercentage))
  const barClass = BAR_CLASSES[budget.alertLevel]
  const labelClass = LABEL_CLASSES[budget.alertLevel]
  const alertLabel = t(`budget.alertLevel.${budget.alertLevel}` as `budget.alertLevel.normal`)

  // ── Compact mode: mini bar for the project header ────────────────────────
  if (compact) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-2 cursor-default select-none",
                className,
              )}
              aria-label={t("budget.badge.ariaLabel", { pct: String(Math.round(budget.spentPercentage)) })}
            >
              {/* Mini bar */}
              <div className="relative h-1.5 w-28 rounded-full bg-muted/50 overflow-hidden border border-border/40">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", barClass)}
                  style={{ width: `${progressWidth}%` }}
                />
              </div>

              {/* Percentage label */}
              <span
                className={cn(
                  "text-[11px] font-semibold tabular-nums leading-none",
                  labelClass,
                )}
              >
                {Math.round(budget.spentPercentage)}%
              </span>

              {/* Alert badge */}
              {budget.alertLevel !== "normal" && (
                <span
                  className={cn(
                    "text-[10px] font-semibold px-1.5 py-0.5 rounded-full border leading-none",
                    budget.alertLevel === "warning"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400",
                  )}
                >
                  {alertLabel}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="text-xs space-y-1 max-w-52 bg-popover text-popover-foreground border border-border shadow-md"
          >
            <p className="font-semibold text-foreground">{t("budget.panel.title")}</p>
            <p className="text-muted-foreground">
              {t("budget.panel.colSpent")}:{" "}
              <span className="font-medium text-foreground">{currencyCode} {formatAmount(budget.spentAmount, "0.00")}</span>
            </p>
            <p className="text-muted-foreground">
              {t("budget.panel.colTotal")}:{" "}
              <span className="font-medium text-foreground">{currencyCode} {formatAmount(budget.totalBudget, "0.00")}</span>
            </p>
            <p className="text-muted-foreground">
              {t("budget.panel.colAvailable")}:{" "}
              <span
                className={cn(
                  "font-medium",
                  budget.remainingAmount < 0 ? "text-destructive" : "text-emerald-500",
                )}
              >
                {currencyCode} {formatAmount(budget.remainingAmount, "0.00")}
              </span>
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // ── Expanded mode: full widget for the dashboard ─────────────────────────
  return (
    <div className={cn("space-y-2", className)}>
      {/* Header row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">
          {t("budget.panel.consumption")}
        </span>
        <span className={cn("font-bold tabular-nums", labelClass)}>
          {formatAmount(budget.spentPercentage, "0")}%
          {budget.alertLevel !== "normal" && (
            <span className="ml-1.5 font-semibold opacity-80">· {alertLabel}</span>
          )}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden border border-border/40">
        <div
          className={cn("h-full rounded-full transition-all duration-500 shadow-sm", barClass)}
          style={{ width: `${progressWidth}%` }}
        />
        {/* Alert threshold marker */}
        <div
          className="absolute top-0 bottom-0 border-l-2 border-dashed border-foreground/30"
          style={{ left: `${Math.min(100, budget.alertPercentage)}%` }}
          aria-hidden
        />
      </div>

      {/* Amounts row */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
        <span>
          {t("budget.panel.colSpent")}:{" "}
          <span className={cn("font-semibold", labelClass)}>
            {currencyCode} {formatAmount(budget.spentAmount, "0.00")}
          </span>
        </span>
        <span>
          {t("budget.panel.colTotal")}:{" "}
          <span className="font-medium text-foreground">
            {currencyCode} {formatAmount(budget.totalBudget, "0.00")}
          </span>
        </span>
      </div>
    </div>
  )
}

export const BudgetProgressBadge = memo(BudgetProgressBadgeComponent)
