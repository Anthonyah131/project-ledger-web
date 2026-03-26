"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { ProjectResponse } from "@/types/project"
import { Badge } from "@/components/ui/badge"
import { getAccentColor, getRoleLabel } from "@/lib/constants"
import { formatDate } from "@/lib/date-utils"
import { formatCurrencySymbol } from "@/lib/format-utils"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import { useLanguage } from "@/context/language-context"

interface ShelfViewProps {
  projects: ProjectResponse[]
  onEdit: (project: ProjectResponse) => void
  onDelete: (project: ProjectResponse) => void
  onShare: (project: ProjectResponse) => void
  onDisconnect?: (project: ProjectResponse) => void
  globalIndex: number
}

function ShelfViewComponent({
  projects,
  onEdit,
  onDelete,
  onShare,
  onDisconnect,
  globalIndex,
}: ShelfViewProps) {
  const { t } = useLanguage()
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border"
      role="list"
      aria-label={t("projects.title")}
    >
      {projects.map((project, i) => (
        <ProjectCard
          key={project.id}
          project={project}
          accentIndex={globalIndex + i}
          onEdit={onEdit}
          onDelete={onDelete}
          onShare={onShare}
          onDisconnect={onDisconnect}
        />
      ))}
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
}: {
  project: ProjectResponse
  accentIndex: number
  onEdit: (project: ProjectResponse) => void
  onDelete: (project: ProjectResponse) => void
  onShare: (project: ProjectResponse) => void
  onDisconnect?: (project: ProjectResponse) => void
}) {
  const router = useRouter()
  const { t } = useLanguage()
  const accent = getAccentColor(accentIndex)
  const workspaceName = project.workspaceName

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
          {/* Top: name + menu */}
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

            {/* Menu */}
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
