"use client"

// hooks/projects/use-project-detail.ts
// Fetches a single project by id.

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import * as projectService from "@/services/project-service"
import type { ProjectResponse, UpdateProjectRequest } from "@/types/project"

export function useProjectDetail(projectId: string) {
  const [project, setProject] = useState<ProjectResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true)
      const data = await projectService.getProject(projectId)
      setProject(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar proyecto"
      toast.error("Error al cargar proyecto", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  const handleEdit = useCallback(
    async (data: UpdateProjectRequest) => {
      try {
        const updated = await projectService.updateProject(projectId, data)
        setProject(updated)
        toast.success("Proyecto actualizado", {
          description: `"${updated.name}" se guardó correctamente.`,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al actualizar proyecto"
        toast.error("Error al actualizar", { description: msg })
      }
    },
    [projectId]
  )

  const handleDelete = useCallback(async () => {
    try {
      await projectService.deleteProject(projectId)
      toast.success("Proyecto eliminado")
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al eliminar proyecto"
      toast.error("Error al eliminar", { description: msg })
      return false
    }
  }, [projectId])

  return {
    project,
    loading,
    handleEdit,
    handleDelete,
    refetch: fetchProject,
  }
}
