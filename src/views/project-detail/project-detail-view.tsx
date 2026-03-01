"use client"

// views/project-detail/project-detail-view.tsx
// Orchestrator for the project-detail page — header + 4 tabs.

import { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

// ── Hook ─────────────────────────────────────────────
import { useProjectDetailView } from "@/hooks/projects/use-project-detail-view";

// ── Header ───────────────────────────────────────────
import { ProjectHeader } from "@/components/project-detail/project-header";
import { EditProjectModal } from "@/components/projects/project-modals";
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal";

// ── Expenses ─────────────────────────────────────────
import { ExpensesToolbar } from "@/components/project-detail/expenses/expenses-toolbar";
import { ExpensesList } from "@/components/project-detail/expenses/expenses-list";
import {
  ExpensesEmptyState,
  ExpensesSkeleton,
} from "@/components/project-detail/expenses/expense-states";
import {
  CreateExpenseModal,
  EditExpenseModal,
} from "@/components/project-detail/expenses/expense-modals";

// ── Categories ───────────────────────────────────────
import { CategoriesToolbar } from "@/components/project-detail/categories/categories-toolbar";
import { CategoriesList } from "@/components/project-detail/categories/categories-list";
import {
  CategoriesEmptyState,
  CategoriesSkeleton,
} from "@/components/project-detail/categories/category-states";
import {
  CreateCategoryModal,
  EditCategoryModal,
} from "@/components/project-detail/categories/category-modals";

// ── Obligations ──────────────────────────────────────
import { ObligationsToolbar } from "@/components/project-detail/obligations/obligations-toolbar";
import { ObligationsList } from "@/components/project-detail/obligations/obligations-list";
import {
  ObligationsEmptyState,
  ObligationsSkeleton,
} from "@/components/project-detail/obligations/obligation-states";
import {
  CreateObligationModal,
  EditObligationModal,
} from "@/components/project-detail/obligations/obligation-modals";

// ── Payment Methods (project-scoped) ─────────────────
import {
  LinkPaymentMethodModal,
  ProjectPaymentMethodsList,
} from "@/components/project-detail/payment-methods/project-payment-methods";
import {
  ProjectPaymentMethodsEmptyState,
  ProjectPaymentMethodsSkeleton,
} from "@/components/project-detail/payment-methods/project-payment-method-states";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// ── Shared ───────────────────────────────────────────
import { Pagination } from "@/components/shared/pagination";

import type { PaymentMethodResponse } from "@/types/payment-method";

interface Props {
  projectId: string;
}

export function ProjectDetailView({ projectId }: Props) {
  const router = useRouter();
  const {
    detail,
    editProjectOpen, deleteProjectOpen,
    setEditProjectOpen, setDeleteProjectOpen,
    handleProjectEdit, handleProjectDelete,
    handleProjectEditSave, handleProjectDeleteConfirm,
    exp, cat, obl, ppm,
    handleExpenseCreate, handleExpenseEdit, handleExpenseDelete,
    handleCategoryDelete,
  } = useProjectDetailView(projectId);

  const isOwner = detail.project?.userRole === "owner";

  // Convert linked project payment methods to PaymentMethodResponse shape
  // so existing expense form components can consume them without changes.
  const paymentMethods: PaymentMethodResponse[] = useMemo(
    () =>
      ppm.linkedMethods.map((m) => ({
        id: m.paymentMethodId,
        name: m.paymentMethodName,
        type: m.type,
        currency: m.currency,
        bankName: m.bankName,
        accountNumber: m.accountNumber,
        description: null,
        createdAt: m.linkedAt,
        updatedAt: m.linkedAt,
      })),
    [ppm.linkedMethods],
  );

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <ProjectHeader
        project={detail.project}
        loading={detail.loading}
        onEdit={handleProjectEdit}
        onDelete={handleProjectDelete}
        onShare={
          isOwner
            ? () => router.push(`/projects/${projectId}/members`)
            : undefined
        }
      />

      {/* Tabs */}
      <Tabs defaultValue="expenses">
        <TabsList variant="line">
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="obligations">Obligaciones</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="payment-methods">Métodos de pago</TabsTrigger>
        </TabsList>

        {/* ───── Expenses tab ───── */}
        <TabsContent value="expenses" className="flex flex-col gap-4">
          <ExpensesToolbar
            query={exp.query}
            onQueryChange={exp.setQuery}
            sort={exp.sort}
            onSortChange={exp.handleSortChange}
            pageSize={exp.pageSize}
            onPageSizeChange={exp.handlePageSizeChange}
            categories={cat.categories}
            categoryId={exp.selectedCategoryId}
            onCategoryChange={exp.setSelectedCategoryId}
            onCreate={() => exp.setCreateOpen(true)}
          />

          {exp.loading ? (
            <ExpensesSkeleton />
          ) : exp.expenses.length === 0 ? (
            <ExpensesEmptyState
              hasSearch={exp.hasSearch}
              onCreate={() => exp.setCreateOpen(true)}
            />
          ) : (
            <>
              <ExpensesList
                expenses={exp.expenses}
                projectCurrency={detail.project?.currencyCode ?? ""}
                paymentMethods={paymentMethods}
                onEdit={(e) => exp.setEditTarget(e)}
                onDelete={(e) => exp.setDeleteTarget(e)}
              />
              {!exp.hasSearch && (
                <Pagination
                  page={exp.page}
                  pageSize={exp.pageSize}
                  total={exp.total}
                  onPageChange={exp.setPage}
                />
              )}
            </>
          )}

          <CreateExpenseModal
            open={exp.createOpen}
            onClose={() => exp.setCreateOpen(false)}
            onCreate={handleExpenseCreate}
            categories={cat.categories}
            paymentMethods={paymentMethods}
            obligations={obl.obligations}
            projectCurrency={detail.project?.currencyCode ?? ""}
          />
          <EditExpenseModal
            expense={exp.editTarget}
            open={!!exp.editTarget}
            onClose={() => exp.setEditTarget(null)}
            onSave={handleExpenseEdit}
            categories={cat.categories}
            paymentMethods={paymentMethods}
            projectCurrency={detail.project?.currencyCode ?? ""}
          />
          <DeleteEntityModal
            item={exp.deleteTarget}
            open={!!exp.deleteTarget}
            onClose={() => exp.setDeleteTarget(null)}
            onConfirm={handleExpenseDelete}
            title="Eliminar gasto"
            description="Esta accion no se puede deshacer."
            getMessage={(e) => `¿Eliminar gasto "${e.title}"?`}
          />
        </TabsContent>

        {/* ───── Obligations tab ───── */}
        <TabsContent value="obligations" className="flex flex-col gap-4">
          <ObligationsToolbar
            sort={obl.sort}
            onSortChange={obl.handleSortChange}
            statusFilter={obl.statusFilter}
            onStatusFilterChange={obl.handleStatusFilterChange}
            pageSize={obl.pageSize}
            onPageSizeChange={obl.handlePageSizeChange}
            onCreate={() => obl.setCreateOpen(true)}
          />

          {obl.loading ? (
            <ObligationsSkeleton />
          ) : obl.obligations.length === 0 ? (
            <ObligationsEmptyState
              hasFilter={obl.hasFilter}
              onCreate={() => obl.setCreateOpen(true)}
            />
          ) : (
            <>
              <ObligationsList
                obligations={obl.obligations}
                onEdit={(o) => obl.setEditTarget(o)}
                onDelete={(o) => obl.setDeleteTarget(o)}
              />
              {!obl.hasFilter && (
                <Pagination
                  page={obl.page}
                  pageSize={obl.pageSize}
                  total={obl.total}
                  onPageChange={obl.setPage}
                />
              )}
            </>
          )}

          <CreateObligationModal
            open={obl.createOpen}
            onClose={() => obl.setCreateOpen(false)}
            onCreate={obl.handleCreate}
          />
          <EditObligationModal
            obligation={obl.editTarget}
            open={!!obl.editTarget}
            onClose={() => obl.setEditTarget(null)}
            onSave={obl.handleEdit}
          />
          <DeleteEntityModal
            item={obl.deleteTarget}
            open={!!obl.deleteTarget}
            onClose={() => obl.setDeleteTarget(null)}
            onConfirm={obl.handleDelete}
            title="Eliminar obligacion"
            description="Esta accion no se puede deshacer."
            getMessage={(o) => `¿Eliminar obligación "${o.title}"?`}
          />
        </TabsContent>

        {/* ───── Categories tab ───── */}
        <TabsContent value="categories" className="flex flex-col gap-4">
          <CategoriesToolbar
            query={cat.query}
            onQueryChange={cat.setQuery}
            onCreate={() => cat.setCreateOpen(true)}
          />

          {cat.loading ? (
            <CategoriesSkeleton />
          ) : cat.categories.length === 0 ? (
            <CategoriesEmptyState
              hasSearch={cat.hasSearch}
              onCreate={() => cat.setCreateOpen(true)}
            />
          ) : (
            <CategoriesList
              categories={cat.categories}
              onEdit={(c) => cat.setEditTarget(c)}
              onDelete={(c) => cat.setDeleteTarget(c)}
            />
          )}

          <CreateCategoryModal
            open={cat.createOpen}
            onClose={() => cat.setCreateOpen(false)}
            onCreate={cat.handleCreate}
          />
          <EditCategoryModal
            category={cat.editTarget}
            open={!!cat.editTarget}
            onClose={() => cat.setEditTarget(null)}
            onSave={cat.handleEdit}
          />
          <DeleteEntityModal
            item={cat.deleteTarget}
            open={!!cat.deleteTarget}
            onClose={() => cat.setDeleteTarget(null)}
            onConfirm={handleCategoryDelete}
            title="Eliminar categoria"
            description="Esta accion no se puede deshacer."
            getMessage={(c) => `¿Eliminar categoría "${c.name}"? Los gastos de esta categoría se moverán a la categoría General.`}
          />
        </TabsContent>

        {/* ───── Payment Methods tab ───── */}
        <TabsContent value="payment-methods" className="flex flex-col gap-4">
          {isOwner && (
            <div className="flex justify-end px-5 py-3 border-b border-border bg-card">
              <Button onClick={ppm.openLinkDialog} size="sm">
                <Plus className="size-3.5" />
                Vincular método
              </Button>
            </div>
          )}

          {ppm.loading ? (
            <ProjectPaymentMethodsSkeleton />
          ) : ppm.linkedMethods.length === 0 ? (
            <ProjectPaymentMethodsEmptyState
              isOwner={!!isOwner}
              onLink={ppm.openLinkDialog}
            />
          ) : (
            <ProjectPaymentMethodsList
              methods={ppm.linkedMethods}
              isOwner={!!isOwner}
              onUnlink={(pm) => ppm.setUnlinkTarget(pm)}
            />
          )}

          <LinkPaymentMethodModal
            open={ppm.linkOpen}
            onClose={() => ppm.setLinkOpen(false)}
            availableMethods={ppm.availableMethods}
            linkedMethods={ppm.linkedMethods}
            loading={ppm.availableLoading}
            onLink={ppm.handleLink}
          />
          <DeleteEntityModal
            item={ppm.unlinkTarget}
            open={!!ppm.unlinkTarget}
            onClose={() => ppm.setUnlinkTarget(null)}
            onConfirm={ppm.handleUnlink}
            title="Desvincular método de pago"
            description="El método ya no podrá usarse para crear gastos en este proyecto."
            getMessage={(pm) => `¿Desvincular "${pm.paymentMethodName}" del proyecto?`}
          />
        </TabsContent>
      </Tabs>

      {/* ─── Project-level modals ─── */}
      {detail.project && (
        <>
          <EditProjectModal
            project={detail.project}
            open={editProjectOpen}
            onClose={() => setEditProjectOpen(false)}
            onSave={handleProjectEditSave}
          />
          <DeleteEntityModal
            item={detail.project}
            open={deleteProjectOpen}
            onClose={() => setDeleteProjectOpen(false)}
            onConfirm={handleProjectDeleteConfirm}
            title="Eliminar proyecto"
            description="Esta accion puede desactivarlo, no eliminarlo definitivamente."
            getMessage={(p) => `¿Eliminar proyecto "${p.name}"?`}
          />
        </>
      )}
    </div>
  );
}
