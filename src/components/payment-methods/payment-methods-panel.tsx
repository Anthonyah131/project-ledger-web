"use client"

import { useCallback, useEffect } from "react"
import { Plus } from "lucide-react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/language-context"
import { useOnboardingContext } from "@/context/onboarding-context"
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
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"

const CreatePaymentMethodModal = dynamic(() =>
  import("./create-payment-method-modal").then((mod) => mod.CreatePaymentMethodModal)
)
const EditPaymentMethodModal = dynamic(() =>
  import("./edit-payment-method-modal").then((mod) => mod.EditPaymentMethodModal)
)

export function PaymentMethodsPanel() {
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const { refreshProgress } = useOnboardingContext()
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
    mutateCreate,
    mutateUpdate,
    mutateDelete,
    handlePageSizeChange,
    handleSortChange,
    handleTypeFilterChange,
  } = usePaymentMethods()

  // Auto-open create modal when navigated from onboarding checklist
  useEffect(() => {
    if (searchParams.get("onboarding") === "1") {
      setCreateOpen(true)
    }
  }, [searchParams, setCreateOpen])

  const handleOpenCreate = useCallback(() => {
    setCreateOpen(true)
  }, [setCreateOpen])

  const handleCloseCreate = useCallback(() => {
    setCreateOpen(false)
  }, [setCreateOpen])

  const handleSelectEdit = useCallback((paymentMethod: (typeof paymentMethods)[number]) => {
    setEditTarget(paymentMethod)
  }, [setEditTarget])

  const handleCloseEdit = useCallback(() => {
    setEditTarget(null)
  }, [setEditTarget])

  const handleSelectDelete = useCallback((paymentMethod: (typeof paymentMethods)[number]) => {
    setDeleteTarget(paymentMethod)
  }, [setDeleteTarget])

  const handleCloseDelete = useCallback(() => {
    setDeleteTarget(null)
  }, [setDeleteTarget])

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            {t("paymentMethods.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="font-bold text-cyan-600 dark:text-cyan-400">{total}</span>{" "}
            {total === 1 ? t("paymentMethods.singular") : t("paymentMethods.plural")}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="bg-linear-to-r from-cyan-600 to-sky-600 text-white hover:from-cyan-700 hover:to-sky-700 border-0 shadow-sm shadow-cyan-500/30 transition-all"
        >
          <Plus className="size-3.5" />
          {t("paymentMethods.newButtonShort")}
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
      <div className="mt-4 bg-card rounded-xl border border-cyan-500/20 shadow-sm shadow-cyan-500/5 overflow-hidden">
        {loading ? (
          viewMode === "shelf" ? <PaymentMethodsShelfSkeleton /> : <PaymentMethodsSkeleton />
        ) : paymentMethods.length === 0 ? (
          <EmptyState hasSearch={hasSearch} onCreate={handleOpenCreate} />
        ) : viewMode === "shelf" ? (
          <PaymentMethodsShelfView
            paymentMethods={paymentMethods}
            onEdit={handleSelectEdit}
            onDelete={handleSelectDelete}
          />
        ) : (
          <PaymentMethodsList
            paymentMethods={paymentMethods}
            onEdit={handleSelectEdit}
            onDelete={handleSelectDelete}
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
      {createOpen && (
        <CreatePaymentMethodModal
          open={createOpen}
          onClose={handleCloseCreate}
          onCreate={async (data) => { await mutateCreate(data); refreshProgress() }}
        />
      )}
      {!!editTarget && (
        <EditPaymentMethodModal
          paymentMethod={editTarget}
          open={!!editTarget}
          onClose={handleCloseEdit}
          onSave={mutateUpdate}
        />
      )}
      <DeleteEntityModal
        item={deleteTarget}
        open={!!deleteTarget}
        onClose={handleCloseDelete}
        onConfirm={mutateDelete}
        title={t("paymentMethods.delete.title")}
        description={t("paymentMethods.delete.description")}
        getMessage={(pm) => t("paymentMethods.delete.confirm", { name: pm.name })}
      />
    </div>
  )
}
