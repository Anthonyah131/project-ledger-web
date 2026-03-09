"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { ProjectResponse } from "@/types/project"
import { Badge } from "@/components/ui/badge"
import { getAccentColor, ROLE_LABEL } from "@/lib/constants"
import { formatDate } from "@/lib/date-utils"
import { ItemActionMenu } from "@/components/shared/item-action-menu"

interface ListViewProps {
  projects: ProjectResponse[]
  onEdit: (project: ProjectResponse) => void
  onDelete: (project: ProjectResponse) => void
  onShare: (project: ProjectResponse) => void
  globalIndex: number
}

function ListViewComponent({ projects, onEdit, onDelete, onShare, globalIndex }: ListViewProps) {
  const router = useRouter()

  return (
    <div role="list" aria-label="Lista de proyectos">
      {/* Header */}
      <div className="flex items-center px-5 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-widest border-b border-border bg-muted/30">
        <span className="flex-1">Proyecto</span>
        <span className="w-16 text-center hidden sm:block">Moneda</span>
        <span className="w-24 text-center hidden md:block">Rol</span>
        <span className="w-28 text-right hidden lg:block">Actualizado</span>
        <span className="w-8" />
      </div>

      {projects.map((project, i) => (
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
          <div className={cn("size-2 rounded-full shrink-0 mr-3.5", getAccentColor(globalIndex + i))} />

          {/* Name + desc */}
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-sm font-medium text-foreground truncate leading-snug">
              {project.name}
            </p>
            {project.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5 leading-relaxed">
                {project.description}
              </p>
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
              {ROLE_LABEL[project.userRole]}
            </Badge>
          </div>

          {/* Date */}
          <span className="w-28 text-right text-xs text-muted-foreground tabular-nums hidden lg:block">
            {formatDate(project.updatedAt)}
          </span>

          {/* Menu */}
          <ItemActionMenu
            ariaLabel="Acciones del proyecto"
            onOpen={() => router.push(`/projects/${project.id}`)}
            openLabel="Abrir proyecto"
            onEdit={() => onEdit(project)}
            onDelete={() => onDelete(project)}
            onShare={project.userRole === "owner" ? () => onShare(project) : undefined}
            stopPropagation
          />
        </div>
      ))}
    </div>
  )
}

export const ListView = memo(ListViewComponent)
