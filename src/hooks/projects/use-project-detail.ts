"use client"

// hooks/projects/use-project-detail.ts
// Fetches a single project by id.

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import * as projectService from "@/services/project-service"
import { toastApiError } from "@/lib/error-utils"
import type { ProjectResponse, UpdateProjectRequest, UpdateProjectSettingsRequest } from "@/types/project"

export function useProjectDetail(projectId: string) {
  const [project, setProject] = useState<ProjectResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true)
      const data = await projectService.getProject(projectId)
      setProject(data)
    } catch (err) {
      toastApiError(err, "Error al cargar proyecto");
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  const mutateUpdate = useCallback(
    async (data: UpdateProjectRequest) => {
      try {
        const updated = await projectService.updateProject(projectId, data)
        setProject(updated)
        toast.success("Proyecto actualizado", {
          description: `"${updated.name}" se guardó correctamente.`,
        })
      } catch (err) {
        toastApiError(err, "Error al actualizar proyecto");
      }
    },
    [projectId]
  )

  const mutateDelete = useCallback(async () => {
    try {
      await projectService.deleteProject(projectId)
      toast.success("Proyecto eliminado")
      return true
    } catch (err) {
      toastApiError(err, "Error al eliminar proyecto");
      return false
    }
  }, [projectId])

  const mutateUpdateSettings = useCallback(
    async (data: UpdateProjectSettingsRequest) => {
      try {
        await projectService.updateProjectSettings(projectId, data)
        setProject((prev) =>
          prev ? { ...prev, partnersEnabled: data.partnersEnabled } : prev,
        )
        toast.success(
          data.partnersEnabled
            ? "Splits por partners activados"
            : "Splits por partners desactivados",
        )
        return true
      } catch (err) {
        toastApiError(err, "Error al actualizar configuración del proyecto")
        return false
      }
    },
    [projectId],
  )

  return {
    project,
    loading,
    mutateUpdate,
    mutateDelete,
    mutateUpdateSettings,
    refetch: fetchProject,
  }
}
