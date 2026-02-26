"use client"

import { useRouter } from "next/navigation"
import {
  Pencil,
  Trash2,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProjectResponse } from "@/types/project"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ShelfViewProps {
  projects: ProjectResponse[]
  onEdit: (project: ProjectResponse) => void
  onDelete: (project: ProjectResponse) => void
  globalIndex: number
}

const ROLE_LABEL: Record<string, string> = {
  owner: "Propietario",
  editor: "Editor",
  viewer: "Lector",
}

const ACCENT_COLORS = [
  "bg-primary",
  "bg-[oklch(0.60_0.16_155)]",
  "bg-[oklch(0.58_0.16_30)]",
  "bg-[oklch(0.55_0.14_280)]",
  "bg-[oklch(0.58_0.14_200)]",
  "bg-foreground/70",
  "bg-[oklch(0.62_0.14_55)]",
  "bg-[oklch(0.50_0.12_250)]",
]

function getAccent(index: number) {
  return ACCENT_COLORS[index % ACCENT_COLORS.length]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
  })
}

function formatCurrency(code: string) {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "\u20AC",
    CRC: "\u20A1",
    MXN: "$",
    GBP: "\u00A3",
    JPY: "\u00A5",
  }
  return symbols[code] || code
}

export function ShelfView({
  projects,
  onEdit,
  onDelete,
  globalIndex,
}: ShelfViewProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border"
      role="list"
      aria-label="Proyectos"
    >
      {projects.map((project, i) => (
        <ProjectCard
          key={project.id}
          project={project}
          accentIndex={globalIndex + i}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

function ProjectCard({
  project,
  accentIndex,
  onEdit,
  onDelete,
}: {
  project: ProjectResponse
  accentIndex: number
  onEdit: (project: ProjectResponse) => void
  onDelete: (project: ProjectResponse) => void
}) {
  const router = useRouter()
  const accent = getAccent(accentIndex)

  return (
    <div
      role="listitem"
      className={cn(
        "group relative bg-card flex flex-col",
        "transition-colors duration-150",
        "hover:bg-accent/30 cursor-pointer",
      )}
      onClick={() => router.push(`/projects/${project.id}/expenses`)}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "shrink-0 flex items-center justify-center size-7 rounded-md",
                    "text-muted-foreground/0 group-hover:text-muted-foreground",
                    "hover:bg-accent hover:text-foreground",
                    "transition-all duration-150",
                    "focus-visible:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  )}
                  aria-label="Acciones del proyecto"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/projects/${project.id}/expenses`)
                  }}
                >
                  <ArrowRight className="size-4" />
                  Abrir gastos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(project)
                  }}
                >
                  <Pencil className="size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(project)
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bottom: metadata */}
          <div className="flex items-center gap-2 mt-auto">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground/80">
              <span className="text-muted-foreground">{formatCurrency(project.currencyCode)}</span>
              {project.currencyCode}
            </span>
            <span className="text-border">{"/"}</span>
            <Badge
              variant={project.userRole === "owner" ? "default" : "secondary"}
              className="text-[10px] px-1.5 py-0 h-4 font-medium"
            >
              {ROLE_LABEL[project.userRole]}
            </Badge>
            <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
              {formatDate(project.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
