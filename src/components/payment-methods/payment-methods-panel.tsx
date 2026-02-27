"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePaymentMethods } from "@/hooks/payment-methods/use-payment-methods"
import { PaymentMethodsToolbar } from "./payment-methods-toolbar"
import { PaymentMethodsShelfView } from "./payment-methods-shelf-view"
import { PaymentMethodsList } from "./payment-methods-list"
import { Pagination } from "@/components/shared/pagination"
import {
  EmptyState,
  PaymentMethodsShelfSkeleton,
  PaymentMethodsSkeleton,
} from "./payment-method-states"
import {
  CreatePaymentMethodModal,
  EditPaymentMethodModal,
  DeletePaymentMethodModal,
} from "./payment-method-modals"

export function PaymentMethodsPanel() {
  const {
    paymentMethods,
    total,
    loading,
    hasSearch,
    viewMode, setViewMode,
    page, setPage,
    pageSize,
    query, setQuery,
    typeFilter,
    sort,
    createOpen, setCreateOpen,
    editTarget, setEditTarget,
    deleteTarget, setDeleteTarget,
    handleCreate,
    handleEdit,
    handleDelete,
    handlePageSizeChange,
    handleSortChange,
    handleTypeFilterChange,
  } = usePaymentMethods()

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Métodos de pago
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} {total === 1 ? "método" : "métodos"}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="size-3.5" />
          Nuevo
        </Button>
      </div>

      {/* Toolbar */}
      <PaymentMethodsToolbar
        query={query}
        onQueryChange={setQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={handleTypeFilterChange}
        sort={sort}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Content */}
      <div className="mt-4 bg-card rounded-lg border border-border overflow-hidden">
        {loading ? (
          viewMode === "shelf" ? <PaymentMethodsShelfSkeleton /> : <PaymentMethodsSkeleton />
        ) : paymentMethods.length === 0 ? (
          <EmptyState hasSearch={hasSearch} onCreate={() => setCreateOpen(true)} />
        ) : viewMode === "shelf" ? (
          <PaymentMethodsShelfView
            paymentMethods={paymentMethods}
            onEdit={(pm) => setEditTarget(pm)}
            onDelete={(pm) => setDeleteTarget(pm)}
          />
        ) : (
          <PaymentMethodsList
            paymentMethods={paymentMethods}
            onEdit={(pm) => setEditTarget(pm)}
            onDelete={(pm) => setDeleteTarget(pm)}
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

      {/* Modals */}
      <CreatePaymentMethodModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
      <EditPaymentMethodModal
        paymentMethod={editTarget}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleEdit}
      />
      <DeletePaymentMethodModal
        paymentMethod={deleteTarget}
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
