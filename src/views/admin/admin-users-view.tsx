"use client"

import { useCallback } from "react"
import dynamic from "next/dynamic"
import { useAdminUsers } from "@/hooks/admin/use-admin-users"
import { AdminUsersList } from "@/components/admin/users-list"
import { AdminUsersToolbar } from "@/components/admin/users-toolbar"
import { AdminUsersSkeleton, AdminUsersEmptyState } from "@/components/admin/user-states"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { Pagination } from "@/components/shared/pagination"
import { useLanguage } from "@/context/language-context"
import type { AdminUserResponse } from "@/types/admin-user"

const EditUserModal = dynamic(() =>
  import("@/components/admin/edit-user-modal").then((mod) => mod.EditUserModal)
)

export function AdminUsersView() {
  const { t } = useLanguage()
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
    mutateActivate,
    mutateDeactivate,
    mutateUpdate,
    mutateDelete,
    mutateToggleAdmin,
    handleSortChange,
    handlePageSizeChange,
    handleIncludeDeletedChange,
  } = useAdminUsers()

  const handleEdit = useCallback((user: AdminUserResponse) => {
    setEditTarget(user)
  }, [setEditTarget])

  const handleDelete = useCallback((user: AdminUserResponse) => {
    setDeleteTarget(user)
  }, [setDeleteTarget])

  const handleCloseEdit = useCallback(() => {
    setEditTarget(null)
  }, [setEditTarget])

  const handleCloseDelete = useCallback(() => {
    setDeleteTarget(null)
  }, [setDeleteTarget])

  const sort = `${sortBy}:${sortDirection}`

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            {t("admin.usersTab")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} {total === 1 ? t("admin.singular") : t("admin.plural")}
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
            onEdit={handleEdit}
            onDelete={handleDelete}
            onActivate={mutateActivate}
            onDeactivate={mutateDeactivate}
            onToggleAdmin={mutateToggleAdmin}
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
      {!!editTarget && (
        <EditUserModal
          user={editTarget}
          open={!!editTarget}
          onClose={handleCloseEdit}
          onSave={mutateUpdate}
          plans={plans}
        />
      )}

      {/* Delete modal */}
      <DeleteEntityModal<AdminUserResponse>
        item={deleteTarget}
        open={!!deleteTarget}
        onClose={handleCloseDelete}
        onConfirm={mutateDelete}
        title={t("admin.delete.title")}
        description={t("admin.delete.description")}
        getMessage={(u) => t("admin.delete.confirm", { name: u.fullName, email: u.email })}
      />
    </div>
  )
}
