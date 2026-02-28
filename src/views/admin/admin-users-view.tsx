"use client"

import { useAdminUsers } from "@/hooks/admin/use-admin-users"
import { AdminUsersList } from "@/components/admin/users-list"
import { AdminUsersToolbar } from "@/components/admin/users-toolbar"
import { AdminUsersSkeleton, AdminUsersEmptyState } from "@/components/admin/user-states"
import { EditUserModal } from "@/components/admin/edit-user-modal"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { Pagination } from "@/components/shared/pagination"
import type { AdminUserResponse } from "@/types/admin-user"

export function AdminUsersView() {
  const {
    users,
    total,
    loading,
    page,
    setPage,
    pageSize,
    includeDeleted,
    sortBy,
    sortDirection,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    plans,
    handleActivate,
    handleDeactivate,
    handleEdit,
    handleDelete,
    handleToggleAdmin,
    handleSortChange,
    handlePageSizeChange,
    handleIncludeDeletedChange,
  } = useAdminUsers()

  const sort = `${sortBy}:${sortDirection}`

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Usuarios
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} {total === 1 ? "usuario" : "usuarios"}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <AdminUsersToolbar
        sort={sort}
        onSortChange={handleSortChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        includeDeleted={includeDeleted}
        onIncludeDeletedChange={handleIncludeDeletedChange}
      />

      {/* Content */}
      <div className="mt-4 bg-card rounded-lg border border-border overflow-hidden">
        {loading ? (
          <AdminUsersSkeleton />
        ) : users.length === 0 ? (
          <AdminUsersEmptyState />
        ) : (
          <AdminUsersList
            users={users}
            onEdit={(u) => setEditTarget(u)}
            onDelete={(u) => setDeleteTarget(u)}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            onToggleAdmin={handleToggleAdmin}
          />
        )}

        {!loading && total > 0 && (
          <div className="border-t border-border">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Edit modal */}
      <EditUserModal
        user={editTarget}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleEdit}
        plans={plans}
      />

      {/* Delete modal */}
      <DeleteEntityModal<AdminUserResponse>
        item={deleteTarget}
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar usuario"
        description="Esta acción no se puede deshacer. El usuario será desactivado permanentemente."
        getMessage={(u) => `¿Eliminar a "${u.fullName}" (${u.email})?`}
      />
    </div>
  )
}
