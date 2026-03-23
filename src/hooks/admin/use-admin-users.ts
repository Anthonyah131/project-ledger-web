"use client"

// hooks/admin/use-admin-users.ts
// State management + API orchestration for the admin users list view.
// Uses server-side pagination since the admin endpoint is paginated.

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import * as adminUserService from "@/services/admin-user-service"
import * as planService from "@/services/plan-service"
import { toastApiError } from "@/lib/error-utils"
import type { AdminUserResponse, AdminUserPlanDto, UpdateAdminUserRequest } from "@/types/admin-user"
import type { MutationOptions } from "@/types/common"

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

  // ── Plans (fetched once for the edit modal dropdown) ────────────────────────

  const [plans, setPlans] = useState<AdminUserPlanDto[]>([])

  useEffect(() => {
    planService.getPlans().then((list) =>
      setPlans(list.map((p) => ({ id: p.id, name: p.name, slug: p.slug })))
    ).catch(() => {
      // non-critical: dropdown will be empty but won't break the page
    })
  }, [])

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
      const msg = toastApiError(err, "Error al cargar usuarios")
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, sortBy, sortDirection, includeDeleted])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ── Actions ───────────────────────────────────────────────────────────────
  // Each mutating action refetches the page after success so the table always
  // shows fresh, complete data (including the embedded plan relation).

  const mutateActivate = useCallback(async (user: AdminUserResponse, options?: MutationOptions) => {
    try {
      await adminUserService.activateUser(user.id)
      toast.success("Usuario activado", {
        description: `"${user.fullName}" fue activado correctamente.`,
      })
      if (options?.refetch ?? true) {
        await fetchUsers()
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: true } : u)),
        )
      }
    } catch (err) {
      toastApiError(err, "Error al activar usuario")
    }
  }, [fetchUsers])

  const mutateDeactivate = useCallback(async (user: AdminUserResponse, options?: MutationOptions) => {
    try {
      await adminUserService.deactivateUser(user.id)
      toast.success("Usuario desactivado", {
        description: `"${user.fullName}" fue desactivado correctamente.`,
      })
      if (options?.refetch ?? true) {
        await fetchUsers()
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: false } : u)),
        )
      }
    } catch (err) {
      toastApiError(err, "Error al desactivar usuario")
    }
  }, [fetchUsers])

  const mutateUpdate = useCallback(async (id: string, data: UpdateAdminUserRequest, options?: MutationOptions) => {
    try {
      const updated = await adminUserService.updateUser(id, data)
      toast.success("Usuario actualizado", {
        description: `"${updated.fullName}" se guardó correctamente.`,
      })
      if (options?.refetch ?? true) {
        await fetchUsers()
      } else {
        setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
      }
    } catch (err) {
      toastApiError(err, "Error al actualizar usuario")
    }
  }, [fetchUsers])

  const mutateDelete = useCallback(async (user: AdminUserResponse, options?: MutationOptions) => {
    try {
      await adminUserService.deleteUser(user.id)
      toast.success("Usuario eliminado", {
        description: `"${user.fullName}" fue eliminado correctamente.`,
      })
      if (options?.refetch ?? true) {
        await fetchUsers()
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== user.id))
        setTotal((prev) => Math.max(0, prev - 1))
      }
    } catch (err) {
      toastApiError(err, "Error al eliminar usuario")
    }
  }, [fetchUsers])

  const mutateToggleAdmin = useCallback(async (user: AdminUserResponse, options?: MutationOptions) => {
    try {
      const updated = await adminUserService.updateUser(user.id, {
        fullName: user.fullName,
        isAdmin: !user.isAdmin,
      })
      toast.success(
        updated.isAdmin ? "Admin otorgado" : "Admin removido",
        { description: `"${updated.fullName}" fue actualizado correctamente.` },
      )
      if (options?.refetch ?? true) {
        await fetchUsers()
      } else {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)))
      }
    } catch (err) {
      toastApiError(err, "Error al cambiar rol")
    }
  }, [fetchUsers])

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
    mutateActivate,
    mutateDeactivate,
    mutateUpdate,
    mutateDelete,
    mutateToggleAdmin,
    handleSortChange,
    handlePageSizeChange,
    handleIncludeDeletedChange,
    refetch: fetchUsers,
  }
}
