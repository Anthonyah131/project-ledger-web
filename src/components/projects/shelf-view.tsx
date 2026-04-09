"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { Pin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProjectResponse, PinnedProjectResponse } from "@/types/project"
import { Badge } from "@/components/ui/badge"
import { getAccentColor, getRoleLabel } from "@/lib/constants"
import { formatDate } from "@/lib/date-utils"
import { formatCurrencySymbol } from "@/lib/format-utils"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import { useLanguage } from "@/context/language-context"

interface ShelfViewProps {
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

function ShelfViewComponent({
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
}: ShelfViewProps) {
  const { t } = useLanguage()
  const hasPinned = pinnedProjects.length > 0
  const hasRest = projects.length > 0

  return (
    <div role="list" aria-label={t("projects.title")}>
      {hasPinned && (
        <>
          <div className="px-5 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-widest border-b border-border bg-muted/30 flex items-center gap-1.5">
            <Pin className="size-3 fill-current" />
            {t("projects.pinnedSection")}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {pinnedProjects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                accentIndex={i}
                onEdit={onEdit}
                onDelete={onDelete}
                onShare={onShare}
                onDisconnect={onDisconnect}
                onTogglePin={onTogglePin}
                isPinned
                canPin={canPin}
                isPinLoading={pinLoading.has(project.id)}
              />
            ))}
          </div>
        </>
      )}

      {hasPinned && hasRest && (
        <div className="px-5 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-widest border-b border-t border-border bg-muted/30">
          {t("projects.allProjectsSection")}
        </div>
      )}

      {hasRest && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              accentIndex={globalIndex + i}
              onEdit={onEdit}
              onDelete={onDelete}
              onShare={onShare}
              onDisconnect={onDisconnect}
              onTogglePin={onTogglePin}
              isPinned={pinnedIds.has(project.id)}
              canPin={canPin}
              isPinLoading={pinLoading.has(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const ShelfView = memo(ShelfViewComponent)

function ProjectCard({
  project,
  accentIndex,
  onEdit,
  onDelete,
  onShare,
  onDisconnect,
  onTogglePin,
  isPinned,
  canPin,
  isPinLoading,
}: {
  project: ProjectResponse
  accentIndex: number
  onEdit: (project: ProjectResponse) => void
  onDelete: (project: ProjectResponse) => void
  onShare: (project: ProjectResponse) => void
  onDisconnect?: (project: ProjectResponse) => void
  onTogglePin: (projectId: string) => void
  isPinned: boolean
  canPin: boolean
  isPinLoading: boolean
}) {
  const router = useRouter()
  const { t } = useLanguage()
  const accent = getAccentColor(accentIndex)
  const workspaceName = project.workspaceName
  const pinDisabled = isPinLoading || (!isPinned && !canPin)

  return (
    <div
      role="listitem"
      className={cn(
        "group relative bg-card flex flex-col",
        "transition-colors duration-150",
        "hover:bg-accent/30 cursor-pointer",
      )}
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <div className="flex flex-1 gap-4 p-5">
        {/* Accent bar */}
        <div className={cn("w-1 shrink-0 rounded-full self-stretch", accent)} />

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Top: name + pin + menu */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground leading-snug truncate text-pretty">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>

            <div className="flex items-center shrink-0">
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

          {/* Bottom: metadata */}
          <div className="flex items-center gap-2 mt-auto flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground/80">
              <span className="text-muted-foreground">{formatCurrencySymbol(project.currencyCode)}</span>
              {project.currencyCode}
            </span>
            <span className="text-border">{"/"}</span>
            <Badge
              variant={project.userRole === "owner" ? "default" : "secondary"}
              className="text-[10px] px-1.5 py-0 h-4 font-medium"
            >
              {getRoleLabel(project.userRole, t)}
            </Badge>
            {workspaceName && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 font-medium text-muted-foreground"
              >
                {workspaceName}
              </Badge>
            )}
            <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
              {formatDate(project.updatedAt, { withYear: false })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
