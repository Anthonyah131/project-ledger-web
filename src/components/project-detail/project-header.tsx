"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
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

interface ProjectHeaderProps {
  project: ProjectResponse | null
  loading: boolean
  onEdit: () => void
  onDelete: () => void
}

const ROLE_LABEL: Record<string, string> = {
  owner: "Propietario",
  editor: "Editor",
  viewer: "Lector",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function ProjectHeader({ project, loading, onEdit, onDelete }: ProjectHeaderProps) {
  const router = useRouter()

  if (loading || !project) {
    return (
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="flex">
          <div className="w-1 bg-muted shrink-0" />
          <div className="flex-1 px-6 py-5">
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
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex">
        {/* Accent bar */}
        <div className={cn("w-1 shrink-0 bg-primary")} />

        <div className="flex-1 flex items-start justify-between px-6 py-5">
          {/* Info */}
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                {project.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="text-[11px] font-medium">
                {project.currencyCode}
              </Badge>
              <Badge
                variant={project.userRole === "owner" ? "default" : "secondary"}
                className="text-[11px] font-medium"
              >
                {ROLE_LABEL[project.userRole]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Creado {formatDate(project.createdAt)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => router.push("/projects")}
              className="flex items-center justify-center size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Volver a proyectos"
            >
              <ArrowLeft className="size-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center justify-center size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label="Acciones del proyecto"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="size-4" />
                  Editar proyecto
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Eliminar proyecto
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
