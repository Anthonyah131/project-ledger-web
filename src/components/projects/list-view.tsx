"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { Pin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProjectResponse, PinnedProjectResponse } from "@/types/project"
import { Badge } from "@/components/ui/badge"
import { getAccentColor, getRoleLabel } from "@/lib/constants"
import { formatDate } from "@/lib/date-utils"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import { useLanguage } from "@/context/language-context"

interface ListViewProps {
  projects: ProjectResponse[]
  pinnedProjects: PinnedProjectResponse[]
  onEdit: (project: ProjectResponse) => void
  onDelete: (project: ProjectResponse) => void
  onShare: (project: ProjectResponse) => void
  onDisconnect?: (project: ProjectResponse) => void
  onTogglePin: (projectId: string) => void
  globalIndex: number
  pinnedIds: Set<string>
  canPin: boolean
  pinLoading: Set<string>
}

function ListViewComponent({
  projects,
  pinnedProjects,
  onEdit,
  onDelete,
  onShare,
  onDisconnect,
  onTogglePin,
  globalIndex,
  pinnedIds,
  canPin,
  pinLoading,
}: ListViewProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const hasPinned = pinnedProjects.length > 0

  const header = (
    <div className="flex items-center px-5 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-widest border-b border-border bg-muted/30">
      <span className="flex-1">{t("projects.list.colProject")}</span>
      <span className="w-16 text-center hidden sm:block">{t("common.currency")}</span>
      <span className="w-24 text-center hidden md:block">{t("projects.list.colRole")}</span>
      <span className="w-28 text-right hidden lg:block">{t("projects.list.colUpdated")}</span>
      <span className="w-16" />
    </div>
  )

  function renderRow(project: ProjectResponse, absoluteIndex: number) {
    const isPinned = pinnedIds.has(project.id)
    const isPinLoading = pinLoading.has(project.id)
    const pinDisabled = isPinLoading || (!isPinned && !canPin)

    return (
      <div
        key={project.id}
        role="listitem"
        className={cn(
          "group flex items-center px-5 py-3.5",
          "border-b border-border last:border-b-0",
          "hover:bg-accent/30 transition-colors duration-150 cursor-pointer",
        )}
        onClick={() => router.push(`/projects/${project.id}`)}
      >
        {/* Accent dot */}
        <div className={cn("size-2 rounded-full shrink-0 mr-3.5", getAccentColor(absoluteIndex))} />

        {/* Name + desc + workspace badge */}
        <div className="flex-1 min-w-0 mr-4">
          <p className="text-sm font-medium text-foreground truncate leading-snug">
            {project.name}
          </p>
          {project.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5 leading-relaxed">
              {project.description}
            </p>
          )}
          {project.workspaceName && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 font-medium text-muted-foreground mt-1"
            >
              {project.workspaceName}
            </Badge>
          )}
        </div>

        {/* Currency */}
        <span className="w-16 text-center text-xs font-medium text-foreground/80 hidden sm:block">
          {project.currencyCode}
        </span>

        {/* Role */}
        <div className="w-24 flex justify-center md:flex">
          <Badge
            variant={project.userRole === "owner" ? "default" : "secondary"}
            className="text-[10px] px-1.5 py-0 h-4 font-medium"
          >
            {getRoleLabel(project.userRole, t)}
          </Badge>
        </div>

        {/* Date */}
        <span className="w-28 text-right text-xs text-muted-foreground tabular-nums hidden lg:block">
          {formatDate(project.updatedAt)}
        </span>

        {/* Pin + Menu */}
        <div className="flex items-center w-16 justify-end">
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePin(project.id) }}
            aria-label={isPinned ? t("projects.unpin") : t("projects.pin")}
            disabled={pinDisabled}
            className={cn(
              "flex items-center justify-center size-7 rounded-md transition-all duration-150",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              "disabled:pointer-events-none disabled:opacity-30",
              isPinned
                ? "text-foreground/70"
                : "text-muted-foreground/0 group-hover:text-muted-foreground/50 hover:!text-foreground/70",
              "hover:bg-accent",
            )}
          >
            <Pin className={cn("size-3.5", isPinned && "fill-current")} />
          </button>

          <ItemActionMenu
            ariaLabel={t("projects.projectActions")}
            onOpen={() => router.push(`/projects/${project.id}`)}
            openLabel={t("projects.openLabel")}
            onEdit={() => onEdit(project)}
            onDelete={() => onDelete(project)}
            onShare={project.userRole === "owner" ? () => onShare(project) : undefined}
            onDisconnect={onDisconnect ? () => onDisconnect(project) : undefined}
            stopPropagation
          />
        </div>
      </div>
    )
  }

  return (
    <div role="list" aria-label={t("projects.list.ariaLabel")}>
      {header}

      {hasPinned && (
        <>
          <div className="px-5 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-widest border-b border-border bg-muted/20 flex items-center gap-1.5">
            <Pin className="size-3 fill-current" />
            {t("projects.pinnedSection")}
          </div>
          {pinnedProjects.map((project, i) => renderRow(project, i))}
        </>
      )}

      {hasPinned && projects.length > 0 && (
        <div className="px-5 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-widest border-b border-border bg-muted/20">
          {t("projects.allProjectsSection")}
        </div>
      )}

      {projects.map((project, i) => renderRow(project, globalIndex + i))}
    </div>
  )
}

export const ListView = memo(ListViewComponent)
