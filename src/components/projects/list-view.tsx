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

interface ListViewProps {
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
    year: "numeric",
  })
}

export function ListView({ projects, onEdit, onDelete, globalIndex }: ListViewProps) {
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
          onClick={() => router.push(`/projects/${project.id}/expenses`)}
        >
          {/* Accent dot */}
          <div className={cn("size-2 rounded-full shrink-0 mr-3.5", getAccent(globalIndex + i))} />

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
          <div className="w-24 flex justify-center hidden md:flex">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "shrink-0 ml-2 flex items-center justify-center size-7 rounded-md",
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
      ))}
    </div>
  )
}
