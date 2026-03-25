"use client"

// hooks/projects/use-project-members.ts
// State management for project member access control.

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import * as projectService from "@/services/project-service"
import { toastApiError } from "@/lib/error-utils"
import { useLanguage } from "@/context/language-context"
import type {
  ProjectMemberResponse,
  AddMemberRequest,
  ProjectMemberRole,
} from "@/types/project-member"
import type { MutationOptions } from "@/types/common"

export function useProjectMembers(projectId: string) {
  const { t } = useLanguage()
  const [members, setMembers] = useState<ProjectMemberResponse[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProjectMemberResponse | null>(null)
  const [roleTarget, setRoleTarget] = useState<ProjectMemberResponse | null>(null)

  // ── Fetch ─────────────────────────────────────────────────

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true)
      const data = await projectService.getMembers(projectId)
      setMembers(data)
    } catch (err) {
      toastApiError(err, t("members.errors.load"))
    } finally {
      setLoading(false)
    }
  }, [projectId, t])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  // ── Add member ────────────────────────────────────────────

  const mutateAdd = useCallback(
    async (data: AddMemberRequest, options?: MutationOptions) => {
      try {
        const created = await projectService.addMember(projectId, data)
        if (options?.refetch ?? true) {
          await fetchMembers()
        } else {
          setMembers((prev) => [...prev, created])
        }
        toast.success(t("members.toast.added"), {
          description: t("members.toast.addedDesc", { name: created.userFullName, role: created.role }),
        })
        return true
      } catch (err) {
        toastApiError(err, t("members.errors.add"))
        return false
      }
    },
    [projectId, fetchMembers, t],
  )

  // ── Change role ───────────────────────────────────────────

  const mutateChangeRole = useCallback(
    async (
      memberId: string,
      role: "editor" | "viewer",
      options?: MutationOptions
    ) => {
      try {
        await projectService.changeMemberRole(projectId, memberId, { role })
        if (options?.refetch ?? true) {
          await fetchMembers()
        } else {
          setMembers((prev) =>
            prev.map((m) =>
              m.id === memberId ? { ...m, role: role as ProjectMemberRole } : m,
            ),
          )
        }
        toast.success(t("members.toast.roleUpdated"))
      } catch (err) {
        toastApiError(err, t("members.errors.changeRole"))
      }
    },
    [projectId, fetchMembers, t],
  )

  // ── Remove member ─────────────────────────────────────────

  const mutateRemove = useCallback(
    async (member: ProjectMemberResponse, options?: MutationOptions) => {
      try {
        await projectService.removeMember(projectId, member.id)
        if (options?.refetch ?? true) {
          await fetchMembers()
        } else {
          setMembers((prev) => prev.filter((m) => m.id !== member.id))
        }
        toast.success(t("members.toast.removed"), {
          description: t("members.toast.removedDesc", { name: member.userFullName }),
        })
      } catch (err) {
        toastApiError(err, t("members.errors.remove"))
      }
    },
    [projectId, fetchMembers, t],
  )

  return {
    members,
    loading,
    addOpen, setAddOpen,
    deleteTarget, setDeleteTarget,
    roleTarget, setRoleTarget,
    mutateAdd,
    mutateChangeRole,
    mutateRemove,
    refetch: fetchMembers,
  }
}
