"use client"

// hooks/workspaces/use-workspaces.ts
// State management for the workspaces list (CRUD).

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import * as workspaceService from "@/services/workspace-service"
import { toastApiError } from "@/lib/error-utils"
import { useLanguage } from "@/context/language-context"
import type {
  WorkspaceResponse,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
} from "@/types/workspace"

export function useWorkspaces() {
  const { t } = useLanguage()
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
      const msg = toastApiError(err, t("workspaces.errors.load"))
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  const mutateCreate = useCallback(
    async (data: CreateWorkspaceRequest) => {
      try {
        const created = await workspaceService.createWorkspace(data)
        toast.success(t("workspaces.toast.created"), { description: t("workspaces.toast.createdDesc", { name: created.name }) })
        await fetchWorkspaces()
      } catch (err) {
        toastApiError(err, t("workspaces.errors.create"))
      }
    },
    [fetchWorkspaces, t],
  )

  const mutateUpdate = useCallback(
    async (id: string, data: UpdateWorkspaceRequest) => {
      try {
        const updated = await workspaceService.updateWorkspace(id, data)
        toast.success(t("workspaces.toast.updated"), { description: t("workspaces.toast.updatedDesc", { name: updated.name }) })
        await fetchWorkspaces()
      } catch (err) {
        toastApiError(err, t("workspaces.errors.update"))
      }
    },
    [fetchWorkspaces, t],
  )

  const mutateDelete = useCallback(
    async (workspace: WorkspaceResponse) => {
      try {
        await workspaceService.deleteWorkspace(workspace.id)
        toast.success(t("workspaces.toast.deleted"), { description: t("workspaces.toast.deletedDesc", { name: workspace.name }) })
        await fetchWorkspaces()
        return true
      } catch (err) {
        toastApiError(err, t("workspaces.errors.delete"))
        return false
      }
    },
    [fetchWorkspaces, t],
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
