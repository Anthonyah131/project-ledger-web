"use client"

import { memo } from "react"
import { Pencil, PiggyBank, Target, Trash2, TrendingUp, TriangleAlert, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import { useLanguage } from "@/context/language-context"
import type { BudgetAlertLevel, ProjectBudgetResponse } from "@/types/project-budget"
import { BudgetEmptyState } from "./budget-states"

interface BudgetPanelProps {
  budget: ProjectBudgetResponse | null
  projectCurrency: string
  canManage: boolean
  canDelete: boolean
  onSet: () => void
  onDelete: (budget: ProjectBudgetResponse) => void
}

const ALERT_BADGE_CLASSES: Record<BudgetAlertLevel, string> = {
  normal: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
  critical: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
  exceeded: "bg-destructive/10 text-destructive border border-destructive/30",
}

const ALERT_PROGRESS_CLASSES: Record<BudgetAlertLevel, string> = {
  normal: "bg-gradient-to-r from-violet-500 to-purple-500",
  warning: "bg-gradient-to-r from-amber-400 to-orange-500",
  critical: "bg-gradient-to-r from-rose-500 to-red-500",
  exceeded: "bg-gradient-to-r from-red-500 to-rose-600",
}

function BudgetPanelComponent({
  budget,
  projectCurrency,
  canManage,
  canDelete,
  onSet,
  onDelete,
}: BudgetPanelProps) {
  const { t } = useLanguage()

  if (!budget) {
    return <BudgetEmptyState canManage={canManage} onSet={onSet} />
  }

  const alertBadgeClass = ALERT_BADGE_CLASSES[budget.alertLevel]
  const alertProgressClass = ALERT_PROGRESS_CLASSES[budget.alertLevel]
  const alertLabel = t(`budget.alertLevel.${budget.alertLevel}` as `budget.alertLevel.normal`)
  const alertCopyTitle = t(`budget.alertCopy.${budget.alertLevel}.title` as `budget.alertCopy.normal.title`)
  const alertCopyDetail = t(`budget.alertCopy.${budget.alertLevel}.detail` as `budget.alertCopy.normal.detail`)
  const progressWidth = Math.max(0, Math.min(100, budget.spentPercentage))
  const thresholdWidth = Math.max(0, Math.min(100, budget.alertPercentage))

  const alertAmount = (budget.totalBudget * budget.alertPercentage) / 100
  const amountToAlert = Math.max(0, alertAmount - budget.spentAmount)
  const amountToLimit = Math.max(0, budget.totalBudget - budget.spentAmount)
  const exceededBy = Math.max(0, budget.spentAmount - budget.totalBudget)

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-card shadow-sm shadow-violet-500/5 overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-violet-500/20 bg-linear-to-r from-violet-500/10 via-purple-500/5 to-transparent">
        <div className="flex items-start gap-3 min-w-0">
          <div className="size-9 rounded-xl bg-linear-to-br from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 mt-0.5 border border-violet-500/20">
            <PiggyBank className="size-4.5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-foreground">{t("budget.panel.title")}</h3>
              <Badge className={cn("text-[10px] px-2 py-0.5 font-semibold", alertBadgeClass)}>
                {alertLabel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {alertCopyTitle}. {alertCopyDetail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <Button size="sm" variant="outline" onClick={onSet} className="border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-600 hover:border-violet-500/50 transition-colors">
              <Pencil className="size-3.5" />
              {t("common.edit")}
            </Button>
          )}
          {canDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(budget)}
              aria-label={t("budget.panel.deleteAria")}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-violet-500/20 p-3.5 bg-linear-to-br from-violet-500/5 to-transparent">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-violet-500 dark:text-violet-400">
              <Target className="size-3.5" />
              {t("budget.panel.colTotal")}
            </div>
            <p className="text-base font-bold text-foreground mt-1.5 tabular-nums">
              {projectCurrency} {formatAmount(budget.totalBudget, "0.00")}
            </p>
          </div>

          <div className="rounded-xl border border-rose-500/20 p-3.5 bg-linear-to-br from-rose-500/5 to-transparent">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-rose-500 dark:text-rose-400">
              <TrendingUp className="size-3.5" />
              {t("budget.panel.colSpent")}
            </div>
            <p className="text-base font-bold text-foreground mt-1.5 tabular-nums">
              {projectCurrency} {formatAmount(budget.spentAmount, "0.00")}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/20 p-3.5 bg-linear-to-br from-emerald-500/5 to-transparent">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Wallet className="size-3.5" />
              {t("budget.panel.colAvailable")}
            </div>
            <p
              className={cn(
                "text-base font-bold mt-1.5 tabular-nums",
                budget.remainingAmount < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {projectCurrency} {formatAmount(budget.remainingAmount, "0.00")}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-violet-500/20 p-3.5 bg-linear-to-br from-violet-500/5 to-transparent space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">{t("budget.panel.consumption")}</span>
            <span className="font-bold text-foreground tabular-nums">
              {formatAmount(budget.spentPercentage, "0")}%
            </span>
          </div>

          <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden border border-border/50">
            <div
              className={cn("h-full rounded-full transition-all duration-500 shadow-sm", alertProgressClass)}
              style={{ width: `${progressWidth}%` }}
            />
            <div
              className="absolute top-0 bottom-0 border-l-2 border-dashed border-foreground/40"
              style={{ left: `${thresholdWidth}%` }}
              aria-hidden
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>0%</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{t("budget.panel.alertAt", { pct: String(budget.alertPercentage) })}</span>
            <span>100%</span>
          </div>
        </div>

        <div className="rounded-xl border border-border p-3.5 bg-card/60 text-xs text-muted-foreground space-y-1.5">
          {budget.alertLevel === "exceeded" ? (
            <div className="flex items-start gap-2 text-destructive">
              <TriangleAlert className="size-4 mt-0.5 shrink-0" />
              <p>
                {t("budget.panel.exceededBy", { currency: projectCurrency, amount: formatAmount(exceededBy, "0.00") })}
              </p>
            </div>
          ) : amountToAlert > 0 ? (
            <p>
              {t("budget.panel.toAlertPrefix")}{" "}
              <span className="font-medium text-foreground">{projectCurrency} {formatAmount(amountToAlert, "0.00")}</span>{" "}
              {t("budget.panel.toAlertMid")}{" "}
              <span className="font-medium text-foreground">{projectCurrency} {formatAmount(amountToLimit, "0.00")}</span>{" "}
              {t("budget.panel.toAlertSuffix")}
            </p>
          ) : (
            <p>
              {t("budget.panel.thresholdReachedPrefix")}{" "}
              <span className="font-medium text-foreground">{projectCurrency} {formatAmount(amountToLimit, "0.00")}</span>{" "}
              {t("budget.panel.thresholdReachedSuffix")}
            </p>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          {t("budget.panel.lastUpdated")} {formatDate(budget.updatedAt)}
        </p>
      </div>
    </div>
  )
}

export const BudgetPanel = memo(BudgetPanelComponent)
