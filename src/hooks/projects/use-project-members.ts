"use client"

// hooks/projects/use-project-members.ts
// State management for project member access control.

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import * as projectService from "@/services/project-service"
import type {
  ProjectMemberResponse,
  AddMemberRequest,
  ProjectMemberRole,
} from "@/types/project-member"

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

  const handleAdd = useCallback(
    async (data: AddMemberRequest) => {
      try {
        const created = await projectService.addMember(projectId, data)
        setMembers((prev) => [...prev, created])
        toast.success("Miembro agregado", {
          description: `${created.userFullName} fue agregado como ${created.role}.`,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al agregar miembro"
        toast.error("Error al agregar miembro", { description: msg })
      }
    },
    [projectId],
  )

  // ── Change role ───────────────────────────────────────────

  const handleChangeRole = useCallback(
    async (memberId: string, role: "editor" | "viewer") => {
      try {
        await projectService.changeMemberRole(projectId, memberId, { role })
        setMembers((prev) =>
          prev.map((m) =>
            m.id === memberId ? { ...m, role: role as ProjectMemberRole } : m,
          ),
        )
        toast.success("Rol actualizado")
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al cambiar rol"
        toast.error("Error al cambiar rol", { description: msg })
      }
    },
    [projectId],
  )

  // ── Remove member ─────────────────────────────────────────

  const handleRemove = useCallback(
    async (member: ProjectMemberResponse) => {
      try {
        await projectService.removeMember(projectId, member.id)
        setMembers((prev) => prev.filter((m) => m.id !== member.id))
        toast.success("Miembro removido", {
          description: `${member.userFullName} fue removido del proyecto.`,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al remover miembro"
        toast.error("Error al remover miembro", { description: msg })
      }
    },
    [projectId],
  )

  return {
    members,
    loading,
    addOpen, setAddOpen,
    deleteTarget, setDeleteTarget,
    roleTarget, setRoleTarget,
    handleAdd,
    handleChangeRole,
    handleRemove,
    refetch: fetchMembers,
  }
}
