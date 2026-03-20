"use client"

// views/projects/workspace-detail-view.tsx

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, FolderPlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProjectsShelf } from "@/components/projects/projects-shelf"
import { AssignProjectsModal } from "@/components/workspaces/assign-projects-modal"
import * as workspaceService from "@/services/workspace-service"
import { toastApiError } from "@/lib/error-utils"
import type { WorkspaceDetailResponse } from "@/types/workspace"

interface WorkspaceDetailViewProps {
  workspaceId: string
  onBack?: () => void
}

export function WorkspaceDetailView({ workspaceId, onBack }: WorkspaceDetailViewProps) {
  const router = useRouter()
  const [workspace, setWorkspace] = useState<WorkspaceDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [assignOpen, setAssignOpen] = useState(false)

  const fetchWorkspace = useCallback(() => {
    workspaceService.getWorkspace(workspaceId)
      .then(setWorkspace)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [workspaceId])

  useEffect(() => {
    fetchWorkspace()
  }, [fetchWorkspace])

  const handleDisconnect = useCallback(async (projectId: string) => {
    try {
      await workspaceService.removeProjectFromWorkspace(workspaceId, projectId)
      toast.success("Proyecto desconectado del workspace")
      // Refresh workspace data so projectIds list updates
      workspaceService.getWorkspace(workspaceId)
        .then(setWorkspace)
        .catch(() => {})
    } catch (err) {
      toastApiError(err, "Error al desconectar proyecto")
    }
  }, [workspaceId])

  const projectIds = workspace?.projects.map((p) => p.id)

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Back navigation */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
          onClick={() => onBack ? onBack() : router.push("/projects?tab=workspaces")}
        >
          <ArrowLeft className="size-4" />
          Workspaces
        </Button>
      </div>

      {/* Workspace context header */}
      {loading ? (
        <div className="mb-6 space-y-1.5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      ) : workspace ? (
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {workspace.color ? (
              <div
                className="size-8 rounded shrink-0 flex items-center justify-center text-white text-xs font-semibold"
                style={{ backgroundColor: workspace.color }}
              >
                {workspace.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="size-8 rounded bg-muted shrink-0 flex items-center justify-center text-muted-foreground text-xs font-semibold">
                {workspace.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Workspace</p>
              <h2 className="text-base font-semibold text-foreground leading-tight">{workspace.name}</h2>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 shrink-0"
            onClick={() => setAssignOpen(true)}
          >
            <FolderPlus className="size-3.5" />
            Asociar proyecto
          </Button>
        </div>
      ) : null}

      {/* Projects scoped to this workspace */}
      <ProjectsShelf
        workspaceId={workspaceId}
        projectIds={projectIds}
        onDisconnect={handleDisconnect}
        onProjectMutated={fetchWorkspace}
      />

      {/* Assign projects modal */}
      {assignOpen && (
        <AssignProjectsModal
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          workspaceId={workspaceId}
          existingProjectIds={projectIds ?? []}
          onAssigned={fetchWorkspace}
        />
      )}
    </div>
  )
}
