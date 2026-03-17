"use client"

// components/workspaces/workspaces-panel.tsx
// Main orchestrator for the workspaces list page (CRUD).

import dynamic from "next/dynamic"
import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, Briefcase, Users } from "lucide-react"
import { useWorkspaces } from "@/hooks/workspaces/use-workspaces"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import { Skeleton } from "@/components/ui/skeleton"
import type { WorkspaceResponse } from "@/types/workspace"

const CreateWorkspaceModal = dynamic(() =>
  import("./create-workspace-modal").then((m) => m.CreateWorkspaceModal),
)
const EditWorkspaceModal = dynamic(() =>
  import("./edit-workspace-modal").then((m) => m.EditWorkspaceModal),
)

function WorkspaceCard({ workspace, onOpen, onEdit, onDelete }: {
  workspace: WorkspaceResponse
  onOpen: (w: WorkspaceResponse) => void
  onEdit: (w: WorkspaceResponse) => void
  onDelete: (w: WorkspaceResponse) => void
}) {
  const isOwner = workspace.role === "owner"

  return (
    <div
      className="group flex items-start justify-between gap-3 px-5 py-4 border-b border-border last:border-b-0 hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={() => onOpen(workspace)}
    >
      <div className="flex items-start gap-3 min-w-0">
        {workspace.color ? (
          <div
            className="size-8 rounded shrink-0 flex items-center justify-center text-white text-xs font-semibold mt-0.5"
            style={{ backgroundColor: workspace.color }}
          >
            {workspace.name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="size-8 rounded bg-muted shrink-0 flex items-center justify-center text-muted-foreground text-xs font-semibold mt-0.5">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">{workspace.name}</span>
            <Badge variant={isOwner ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
              {isOwner ? "propietario" : "miembro"}
            </Badge>
          </div>
          {workspace.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{workspace.description}</p>
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Briefcase className="size-3" />
            {workspace.projectCount} {workspace.projectCount === 1 ? "proyecto" : "proyectos"}
          </span>
        </div>
      </div>
      {isOwner ? (
        <ItemActionMenu
          onOpen={() => onOpen(workspace)}
          onEdit={() => onEdit(workspace)}
          onDelete={() => onDelete(workspace)}
          stopPropagation
        />
      ) : (
        <div className="shrink-0 size-7" />
      )}
    </div>
  )
}

function WorkspacesSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-4">
          <Skeleton className="size-8 rounded shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-7 w-7 rounded" />
        </div>
      ))}
    </div>
  )
}

function WorkspacesEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
      <Users className="size-10 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">Aún no tienes workspaces creados.</p>
      <Button size="sm" onClick={onCreate}>
        <Plus className="size-3.5" />
        Crear workspace
      </Button>
    </div>
  )
}

export function WorkspacesPanel({ onSelectWorkspace }: { onSelectWorkspace?: (id: string) => void } = {}) {
  const router = useRouter()
  const {
    workspaces,
    loading,
    createOpen, setCreateOpen,
    editTarget, setEditTarget,
    deleteTarget, setDeleteTarget,
    mutateCreate,
    mutateUpdate,
    mutateDelete,
  } = useWorkspaces()

  const handleOpenCreate = useCallback(() => setCreateOpen(true), [setCreateOpen])
  const handleCloseCreate = useCallback(() => setCreateOpen(false), [setCreateOpen])
  const handleOpenWorkspace = useCallback((w: WorkspaceResponse) => {
    if (onSelectWorkspace) onSelectWorkspace(w.id)
    else router.push(`/workspaces/${w.id}`)
  }, [router, onSelectWorkspace])
  const handleSelectEdit = useCallback((w: WorkspaceResponse) => setEditTarget(w), [setEditTarget])
  const handleCloseEdit = useCallback(() => setEditTarget(null), [setEditTarget])
  const handleSelectDelete = useCallback((w: WorkspaceResponse) => setDeleteTarget(w), [setDeleteTarget])
  const handleCloseDelete = useCallback(() => setDeleteTarget(null), [setDeleteTarget])

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Workspaces</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {workspaces.length} {workspaces.length === 1 ? "workspace" : "workspaces"}
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="size-3.5" />
          Nuevo
        </Button>
      </div>

      {/* Content */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {loading ? (
          <WorkspacesSkeleton />
        ) : workspaces.length === 0 ? (
          <WorkspacesEmptyState onCreate={handleOpenCreate} />
        ) : (
          <div>
            {workspaces.map((w) => (
              <WorkspaceCard
                key={w.id}
                workspace={w}
                onOpen={handleOpenWorkspace}
                onEdit={handleSelectEdit}
                onDelete={handleSelectDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {createOpen && (
        <CreateWorkspaceModal
          open={createOpen}
          onClose={handleCloseCreate}
          onCreate={mutateCreate}
        />
      )}
      {!!editTarget && (
        <EditWorkspaceModal
          workspace={editTarget}
          open={!!editTarget}
          onClose={handleCloseEdit}
          onSave={mutateUpdate}
        />
      )}
      <DeleteEntityModal
        item={deleteTarget}
        open={!!deleteTarget}
        onClose={handleCloseDelete}
        onConfirm={mutateDelete}
        title="Eliminar workspace"
        description="Se eliminará el workspace. Esta acción no puede deshacerse si no tiene proyectos activos."
        getMessage={(w) => `¿Eliminar workspace "${w.name}"?`}
      />
    </div>
  )
}
