"use client"

// hooks/admin/use-admin-users.ts
// State management + API orchestration for the admin users list view.
// Uses server-side pagination since the admin endpoint is paginated.

import { useState, useCallback, useEffect, useMemo } from "react"
import { toast } from "sonner"
import * as adminUserService from "@/services/admin-user-service"
import type { AdminUserResponse, AdminUserPlanDto, UpdateAdminUserRequest } from "@/types/admin-user"

export function useAdminUsers() {
  // Data state
  const [users, setUsers] = useState<AdminUserResponse[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination (server-side)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Filter state
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Modal state
  const [editTarget, setEditTarget] = useState<AdminUserResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUserResponse | null>(null)

  // ── Derived: unique plans from loaded users ───────────────────────────────

  const plans: AdminUserPlanDto[] = useMemo(() => {
    const map = new Map<string, AdminUserPlanDto>()
    for (const u of users) {
      if (u.plan && !map.has(u.plan.id)) {
        map.set(u.plan.id, u.plan)
      }
    }
    return Array.from(map.values())
  }, [users])

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await adminUserService.getUsers({
        page,
        pageSize,
        sortBy,
        sortDirection,
        includeDeleted,
      })
      setUsers(result.items)
      setTotal(result.totalCount)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar usuarios"
      setError(msg)
      toast.error("Error al cargar usuarios", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, sortBy, sortDirection, includeDeleted])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleActivate = useCallback(async (user: AdminUserResponse) => {
    try {
      const updated = await adminUserService.activateUser(user.id)
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...updated, plan: updated.plan ?? u.plan } : u)),
      )
      toast.success("Usuario activado", {
        description: `"${updated.fullName}" fue activado correctamente.`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al activar usuario"
      toast.error("Error al activar", { description: msg })
    }
  }, [])

  const handleDeactivate = useCallback(async (user: AdminUserResponse) => {
    try {
      const updated = await adminUserService.deactivateUser(user.id)
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...updated, plan: updated.plan ?? u.plan } : u)),
      )
      toast.success("Usuario desactivado", {
        description: `"${updated.fullName}" fue desactivado correctamente.`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al desactivar usuario"
      toast.error("Error al desactivar", { description: msg })
    }
  }, [])

  const handleEdit = useCallback(async (id: string, data: UpdateAdminUserRequest) => {
    try {
      const updated = await adminUserService.updateUser(id, data)
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...updated, plan: updated.plan ?? u.plan } : u)),
      )
      toast.success("Usuario actualizado", {
        description: `"${updated.fullName}" se guardó correctamente.`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al actualizar usuario"
      toast.error("Error al actualizar", { description: msg })
    }
  }, [])

  const handleDelete = useCallback(async (user: AdminUserResponse) => {
    try {
      await adminUserService.deleteUser(user.id)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      setTotal((prev) => prev - 1)
      toast.success("Usuario eliminado", {
        description: `"${user.fullName}" fue eliminado correctamente.`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al eliminar usuario"
      toast.error("Error al eliminar", { description: msg })
    }
  }, [])

  const handleToggleAdmin = useCallback(async (user: AdminUserResponse) => {
    try {
      const updated = await adminUserService.updateUser(user.id, {
        fullName: user.fullName,
        isAdmin: !user.isAdmin,
      })
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...updated, plan: updated.plan ?? u.plan } : u)),
      )
      toast.success(
        updated.isAdmin ? "Admin otorgado" : "Admin removido",
        { description: `"${updated.fullName}" fue actualizado correctamente.` },
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cambiar rol"
      toast.error("Error al cambiar rol", { description: msg })
    }
  }, [])

  // ── Sort / filter handlers ────────────────────────────────────────────────

  const handleSortChange = useCallback((sort: string) => {
    const [field, dir] = sort.split(":") as [string, "asc" | "desc"]
    setSortBy(field)
    setSortDirection(dir)
    setPage(1)
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setPage(1)
  }, [])

  const handleIncludeDeletedChange = useCallback((value: boolean) => {
    setIncludeDeleted(value)
    setPage(1)
  }, [])

  return {
    // Data
    users,
    total,
    loading,
    error,

    // Pagination
    page,
    setPage,
    pageSize,

    // Filters
    includeDeleted,
    sortBy,
    sortDirection,

    // Modal state
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,

    // Derived
    plans,

    // Actions
    handleActivate,
    handleDeactivate,
    handleEdit,
    handleDelete,
    handleToggleAdmin,
    handleSortChange,
    handlePageSizeChange,
    handleIncludeDeletedChange,
    refetch: fetchUsers,
  }
}
