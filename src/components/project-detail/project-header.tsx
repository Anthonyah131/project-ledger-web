"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, MoreHorizontal, Pencil, Trash2, Users, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { getRoleLabel } from "@/lib/constants"
import { formatDate } from "@/lib/date-utils"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import type { ProjectResponse } from "@/types/project"
import type { ProjectBudgetResponse } from "@/types/project-budget"
import { useLanguage } from "@/context/language-context"
import { BudgetProgressBadge, BudgetProgressBadgeSkeleton } from "@/components/shared/budget-progress-badge"

interface ProjectHeaderProps {
  project: ProjectResponse | null
  loading: boolean
  budget?: ProjectBudgetResponse | null
  budgetLoading?: boolean
  onEdit: () => void
  onDelete: () => void
  onShare?: () => void
}

export function ProjectHeader({ project, loading, budget, budgetLoading, onEdit, onDelete, onShare }: ProjectHeaderProps) {
  const router = useRouter()
  const { t } = useLanguage()

  if (loading || !project) {
    return (
      <div className="bg-card rounded-xl border border-violet-500/20 overflow-hidden shadow-sm">
        <div className="flex">
          <div className="w-1.5 bg-linear-to-b from-violet-500 to-purple-600 shrink-0" />
          <div className="flex-1 px-6 py-5 bg-linear-to-r from-violet-500/5 to-transparent">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-2 mt-3">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-violet-500/20 overflow-hidden shadow-sm shadow-violet-500/5">
      <div className="flex">
        {/* Vivid gradient accent bar */}
        <div className="w-1.5 shrink-0 bg-linear-to-b from-violet-500 via-purple-600 to-fuchsia-600" />

        <div className="flex-1 flex items-start justify-between px-6 py-5 bg-linear-to-r from-violet-500/5 via-transparent to-transparent">
          {/* Info */}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {project.name}
              </h1>
              <Sparkles className="size-4 text-violet-400 opacity-70" />
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                {project.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge
                variant="outline"
                className="text-[11px] font-semibold border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-300"
              >
                {project.currencyCode}
              </Badge>
              <Badge
                className={cn(
                  "text-[11px] font-semibold",
                  project.userRole === "owner"
                    ? "bg-linear-to-r from-violet-600 to-purple-600 text-white border-0 shadow-sm shadow-violet-500/30"
                    : "bg-violet-500/10 text-violet-600 dark:text-violet-300 border-violet-500/30"
                )}
              >
                {getRoleLabel(project.userRole, t)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {t("projects.createdAt", { date: formatDate(project.createdAt) })}
              </span>
            </div>

            {/* Budget progress indicator */}
            {budgetLoading ? (
              <div className="mt-2">
                <BudgetProgressBadgeSkeleton compact />
              </div>
            ) : budget ? (
              <div className="mt-2">
                <BudgetProgressBadge
                  budget={budget}
                  currencyCode={project.currencyCode}
                  compact
                />
              </div>
            ) : null}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => router.push("/projects")}
              className="flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-violet-600 hover:bg-violet-500/10 transition-all duration-150"
              aria-label={t("projects.backToProjects")}
            >
              <ArrowLeft className="size-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-violet-600 hover:bg-violet-500/10 transition-all duration-150"
                  aria-label={t("projects.projectActions")}
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="size-4" />
                  {t("projects.editTitle")}
                </DropdownMenuItem>
                {onShare && (
                  <DropdownMenuItem onClick={onShare}>
                    <Users className="size-4" />
                    {t("projects.manageAccess")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4" />
                  {t("projects.deleteProject")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
