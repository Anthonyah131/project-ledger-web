"use client"

// hooks/projects/use-project-members.ts
// State management for project member access control.

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import * as projectService from "@/services/project-service"
import { toastApiError } from "@/lib/error-utils"
import type {
  ProjectMemberResponse,
  AddMemberRequest,
  ProjectMemberRole,
} from "@/types/project-member"
import type { MutationOptions } from "@/types/common"

export function useProjectMembers(projectId: string) {
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
      const msg = err instanceof Error ? err.message : "Error al cargar miembros"
      toast.error("Error al cargar miembros", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [projectId])

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
        toast.success("Miembro agregado", {
          description: `${created.userFullName} fue agregado como ${created.role}.`,
        })
        return true
      } catch (err) {
        toastApiError(err, "Error al agregar miembro")
        return false
      }
    },
    [projectId, fetchMembers],
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
        toast.success("Rol actualizado")
      } catch (err) {
        toastApiError(err, "Error al cambiar rol")
      }
    },
    [projectId, fetchMembers],
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
        toast.success("Miembro removido", {
          description: `${member.userFullName} fue removido del proyecto.`,
        })
      } catch (err) {
        toastApiError(err, "Error al remover miembro")
      }
    },
    [projectId, fetchMembers],
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
