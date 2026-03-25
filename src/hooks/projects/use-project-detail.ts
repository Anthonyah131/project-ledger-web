"use client"

// hooks/projects/use-project-detail.ts
// Fetches a single project by id.

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import * as projectService from "@/services/project-service"
import { toastApiError } from "@/lib/error-utils"
import { useLanguage } from "@/context/language-context"
import type { ProjectResponse, UpdateProjectRequest, UpdateProjectSettingsRequest } from "@/types/project"

export function useProjectDetail(projectId: string) {
  const { t } = useLanguage()
  const [project, setProject] = useState<ProjectResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true)
      const data = await projectService.getProject(projectId)
      setProject(data)
    } catch (err) {
      toastApiError(err, t("projects.errors.loadDetail"))
    } finally {
      setLoading(false)
    }
  }, [projectId, t])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  const mutateUpdate = useCallback(
    async (data: UpdateProjectRequest) => {
      try {
        const updated = await projectService.updateProject(projectId, data)
        setProject(updated)
        toast.success(t("projects.toast.updated"), {
          description: t("projects.toast.updatedDesc", { name: updated.name }),
        })
      } catch (err) {
        toastApiError(err, t("projects.errors.update"))
      }
    },
    [projectId, t]
  )

  const mutateDelete = useCallback(async () => {
    try {
      await projectService.deleteProject(projectId)
      toast.success(t("projects.toast.deleted"))
      return true
    } catch (err) {
      toastApiError(err, t("projects.errors.delete"))
      return false
    }
  }, [projectId, t])

  const mutateUpdateSettings = useCallback(
    async (data: UpdateProjectSettingsRequest) => {
      try {
        await projectService.updateProjectSettings(projectId, data)
        setProject((prev) =>
          prev ? { ...prev, partnersEnabled: data.partnersEnabled } : prev,
        )
        toast.success(
          data.partnersEnabled
            ? t("projects.toast.partnersEnabled")
            : t("projects.toast.partnersDisabled"),
        )
        return true
      } catch (err) {
        toastApiError(err, t("projects.errors.updateSettings"))
        return false
      }
    },
    [projectId, t],
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
