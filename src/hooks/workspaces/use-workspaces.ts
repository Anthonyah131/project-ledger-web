"use client"

// hooks/workspaces/use-workspaces.ts
// State management for the workspaces list (CRUD).

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import * as workspaceService from "@/services/workspace-service"
import { toastApiError } from "@/lib/error-utils"
import type {
  WorkspaceResponse,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
} from "@/types/workspace"

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<WorkspaceResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceResponse | null>(null)

  const fetchWorkspaces = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const data = await workspaceService.getWorkspaces()
      setWorkspaces(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar workspaces"
      setError(msg)
      toast.error("Error al cargar workspaces", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  const mutateCreate = useCallback(
    async (data: CreateWorkspaceRequest) => {
      try {
        const created = await workspaceService.createWorkspace(data)
        toast.success("Workspace creado", { description: `"${created.name}" se creó correctamente.` })
        await fetchWorkspaces()
      } catch (err) {
        toastApiError(err, "Error al crear workspace")
      }
    },
    [fetchWorkspaces],
  )

  const mutateUpdate = useCallback(
    async (id: string, data: UpdateWorkspaceRequest) => {
      try {
        const updated = await workspaceService.updateWorkspace(id, data)
        toast.success("Workspace actualizado", { description: `"${updated.name}" se guardó correctamente.` })
        await fetchWorkspaces()
      } catch (err) {
        toastApiError(err, "Error al actualizar workspace")
      }
    },
    [fetchWorkspaces],
  )

  const mutateDelete = useCallback(
    async (workspace: WorkspaceResponse) => {
      try {
        await workspaceService.deleteWorkspace(workspace.id)
        toast.success("Workspace eliminado", { description: `"${workspace.name}" fue eliminado.` })
        await fetchWorkspaces()
        return true
      } catch (err) {
        toastApiError(err, "Error al eliminar workspace")
        return false
      }
    },
    [fetchWorkspaces],
  )

  return {
    workspaces,
    loading,
    error,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    mutateCreate,
    mutateUpdate,
    mutateDelete,
    refetch: fetchWorkspaces,
  }
}
