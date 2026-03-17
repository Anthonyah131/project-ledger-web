"use client"

import { useEffect, useState, useMemo } from "react"
import { Search, FolderPlus } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getProjects } from "@/services/project-service"
import { assignProjectToWorkspace } from "@/services/workspace-service"
import { toastApiError } from "@/lib/error-utils"
import type { ProjectResponse } from "@/types/project"

interface AssignProjectsModalProps {
  open: boolean
  onClose: () => void
  workspaceId: string
  existingProjectIds: string[]
  onAssigned: () => void
}

export function AssignProjectsModal({
  open,
  onClose,
  workspaceId,
  existingProjectIds,
  onAssigned,
}: AssignProjectsModalProps) {
  const [allProjects, setAllProjects] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [assigning, setAssigning] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    getProjects({ pageSize: 200 })
      .then((data) => setAllProjects(data.items))
      .catch(() => toast.error("Error al cargar proyectos"))
      .finally(() => setLoading(false))
  }, [open])

  const existingSet = useMemo(() => new Set(existingProjectIds), [existingProjectIds])

  const available = useMemo(() => {
    const unassigned = allProjects.filter((p) => !existingSet.has(p.id))
    if (!query.trim()) return unassigned
    const lower = query.toLowerCase()
    return unassigned.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        (p.description?.toLowerCase().includes(lower) ?? false)
    )
  }, [allProjects, existingSet, query])

  async function handleAssign(project: ProjectResponse) {
    setAssigning(project.id)
    try {
      await assignProjectToWorkspace(workspaceId, project.id)
      toast.success("Proyecto asociado", { description: `"${project.name}" se agregó al workspace.` })
      onAssigned()
      onClose()
    } catch (err) {
      toastApiError(err, "Error al asociar proyecto")
    } finally {
      setAssigning(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asociar proyecto al workspace</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar proyecto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <div className="max-h-72 overflow-y-auto -mx-1 px-1 space-y-1">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))
          ) : available.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {query ? "Sin resultados" : "Todos los proyectos ya están en este workspace"}
            </div>
          ) : (
            available.map((project) => (
              <div
                key={project.id}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2.5 rounded-md",
                  "border border-border bg-card hover:bg-accent/30 transition-colors",
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                  {project.description && (
                    <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 h-7 text-xs gap-1.5"
                  onClick={() => handleAssign(project)}
                  disabled={assigning === project.id}
                >
                  <FolderPlus className="size-3.5" />
                  Asociar
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
