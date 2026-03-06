"use client"

// views/project-detail/project-detail-view.tsx
// Orchestrator for the project-detail page — header + resource tabs.

import dynamic from "next/dynamic";
import { useCallback, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

// ── Hook ─────────────────────────────────────────────
import { useProjectDetailView } from "@/hooks/projects/use-project-detail-view";

// ── Header ───────────────────────────────────────────
import { ProjectHeader } from "@/components/project-detail/project-header";
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal";

// ── Expenses ─────────────────────────────────────────
import { ExpensesToolbar } from "@/components/project-detail/expenses/expenses-toolbar";
import { ExpensesList } from "@/components/project-detail/expenses/expenses-list";
import {
  ExpensesEmptyState,
  ExpensesSkeleton,
} from "@/components/project-detail/expenses/expense-states";

// ── Categories ───────────────────────────────────────
import { CategoriesToolbar } from "@/components/project-detail/categories/categories-toolbar";
import { CategoriesList } from "@/components/project-detail/categories/categories-list";
import {
  CategoriesEmptyState,
  CategoriesSkeleton,
} from "@/components/project-detail/categories/category-states";

// ── Obligations ──────────────────────────────────────
import { ObligationsToolbar } from "@/components/project-detail/obligations/obligations-toolbar";
import { ObligationsList } from "@/components/project-detail/obligations/obligations-list";
import {
  ObligationsEmptyState,
  ObligationsSkeleton,
} from "@/components/project-detail/obligations/obligation-states";

// ── Budget ───────────────────────────────────────────
import { BudgetPanel } from "@/components/project-detail/budget/budget-panel";
import { BudgetSkeleton } from "@/components/project-detail/budget/budget-states";

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
import type { ExpenseResponse } from "@/types/expense";
import type { CategoryResponse } from "@/types/category";
import type { ObligationResponse } from "@/types/obligation";
import type { ProjectBudgetResponse, SetProjectBudgetRequest } from "@/types/project-budget";
import type { ProjectPaymentMethodResponse } from "@/types/project-payment-method";

const EditProjectModal = dynamic(() =>
  import("@/components/projects/edit-project-modal").then((mod) => mod.EditProjectModal)
);
const CreateExpenseModal = dynamic(() =>
  import("@/components/project-detail/expenses/create-expense-modal").then((mod) => mod.CreateExpenseModal)
);
const EditExpenseModal = dynamic(() =>
  import("@/components/project-detail/expenses/edit-expense-modal").then((mod) => mod.EditExpenseModal)
);
const CreateCategoryModal = dynamic(() =>
  import("@/components/project-detail/categories/create-category-modal").then((mod) => mod.CreateCategoryModal)
);
const EditCategoryModal = dynamic(() =>
  import("@/components/project-detail/categories/edit-category-modal").then((mod) => mod.EditCategoryModal)
);
const CreateObligationModal = dynamic(() =>
  import("@/components/project-detail/obligations/create-obligation-modal").then((mod) => mod.CreateObligationModal)
);
const EditObligationModal = dynamic(() =>
  import("@/components/project-detail/obligations/edit-obligation-modal").then((mod) => mod.EditObligationModal)
);
const SetProjectBudgetModal = dynamic(() =>
  import("@/components/project-detail/budget/set-budget-modal").then((mod) => mod.SetProjectBudgetModal)
);

interface Props {
  projectId: string;
}

export function ProjectDetailView({ projectId }: Props) {
  const router = useRouter();
  const {
    detail,
    editProjectOpen, deleteProjectOpen,
    setEditProjectOpen, setDeleteProjectOpen,
    mutateProjectEditOpen, mutateProjectDeleteOpen,
    mutateProjectUpdate, mutateProjectDelete,
    exp, cat, obl, bud, ppm,
    mutateExpenseCreate, mutateExpenseUpdate, mutateExpenseDelete,
    mutateCategoryCreate, mutateCategoryUpdate,
    mutateCategoryDelete,
    mutateObligationCreate, mutateObligationUpdate, mutateObligationDelete,
    mutateBudgetSet, mutateBudgetDelete,
  } = useProjectDetailView(projectId);

  const { setCreateOpen: setExpenseCreateOpen, setEditTarget: setExpenseEditTarget, setDeleteTarget: setExpenseDeleteTarget } = exp;
  const { setCreateOpen: setObligationCreateOpen, setEditTarget: setObligationEditTarget, setDeleteTarget: setObligationDeleteTarget } = obl;
  const { setCreateOpen: setCategoryCreateOpen, setEditTarget: setCategoryEditTarget, setDeleteTarget: setCategoryDeleteTarget } = cat;
  const { setUpsertOpen: setBudgetUpsertOpen, setDeleteTarget: setBudgetDeleteTarget } = bud;
  const { setLinkOpen, setUnlinkTarget } = ppm;

  const isOwner = detail.project?.userRole === "owner";
  const canManageBudget = detail.project?.userRole === "owner" || detail.project?.userRole === "editor";
  const canDeleteBudget = detail.project?.userRole === "owner";

  const handleShareMembers = useCallback(() => {
    router.push(`/projects/${projectId}/members`);
  }, [router, projectId]);

  const handleExpenseCreateOpen = useCallback(() => {
    setExpenseCreateOpen(true);
  }, [setExpenseCreateOpen]);

  const handleExpenseCreateClose = useCallback(() => {
    setExpenseCreateOpen(false);
  }, [setExpenseCreateOpen]);

  const handleExpenseEditSelect = useCallback((expense: ExpenseResponse) => {
    setExpenseEditTarget(expense);
  }, [setExpenseEditTarget]);

  const handleExpenseEditClose = useCallback(() => {
    setExpenseEditTarget(null);
  }, [setExpenseEditTarget]);

  const handleExpenseDeleteSelect = useCallback((expense: ExpenseResponse) => {
    setExpenseDeleteTarget(expense);
  }, [setExpenseDeleteTarget]);

  const handleExpenseDeleteClose = useCallback(() => {
    setExpenseDeleteTarget(null);
  }, [setExpenseDeleteTarget]);

  const handleObligationCreateOpen = useCallback(() => {
    setObligationCreateOpen(true);
  }, [setObligationCreateOpen]);

  const handleObligationCreateClose = useCallback(() => {
    setObligationCreateOpen(false);
  }, [setObligationCreateOpen]);

  const handleObligationEditSelect = useCallback((obligation: ObligationResponse) => {
    setObligationEditTarget(obligation);
  }, [setObligationEditTarget]);

  const handleObligationEditClose = useCallback(() => {
    setObligationEditTarget(null);
  }, [setObligationEditTarget]);

  const handleObligationDeleteSelect = useCallback((obligation: ObligationResponse) => {
    setObligationDeleteTarget(obligation);
  }, [setObligationDeleteTarget]);

  const handleObligationDeleteClose = useCallback(() => {
    setObligationDeleteTarget(null);
  }, [setObligationDeleteTarget]);

  const handleCategoryCreateOpen = useCallback(() => {
    setCategoryCreateOpen(true);
  }, [setCategoryCreateOpen]);

  const handleCategoryCreateClose = useCallback(() => {
    setCategoryCreateOpen(false);
  }, [setCategoryCreateOpen]);

  const handleCategoryEditSelect = useCallback((category: CategoryResponse) => {
    setCategoryEditTarget(category);
  }, [setCategoryEditTarget]);

  const handleCategoryEditClose = useCallback(() => {
    setCategoryEditTarget(null);
  }, [setCategoryEditTarget]);

  const handleCategoryDeleteSelect = useCallback((category: CategoryResponse) => {
    setCategoryDeleteTarget(category);
  }, [setCategoryDeleteTarget]);

  const handleCategoryDeleteClose = useCallback(() => {
    setCategoryDeleteTarget(null);
  }, [setCategoryDeleteTarget]);

  const handleBudgetUpsertOpen = useCallback(() => {
    setBudgetUpsertOpen(true);
  }, [setBudgetUpsertOpen]);

  const handleBudgetUpsertClose = useCallback(() => {
    setBudgetUpsertOpen(false);
  }, [setBudgetUpsertOpen]);

  const handleBudgetDeleteSelect = useCallback((budget: ProjectBudgetResponse) => {
    setBudgetDeleteTarget(budget);
  }, [setBudgetDeleteTarget]);

  const handleBudgetDeleteClose = useCallback(() => {
    setBudgetDeleteTarget(null);
  }, [setBudgetDeleteTarget]);

  const handleBudgetSave = useCallback((data: SetProjectBudgetRequest) => {
    mutateBudgetSet(data);
  }, [mutateBudgetSet]);

  const handleLinkDialogClose = useCallback(() => {
    setLinkOpen(false);
  }, [setLinkOpen]);

  const handleUnlinkSelect = useCallback((paymentMethod: ProjectPaymentMethodResponse) => {
    setUnlinkTarget(paymentMethod);
  }, [setUnlinkTarget]);

  const handleUnlinkClose = useCallback(() => {
    setUnlinkTarget(null);
  }, [setUnlinkTarget]);

  const handleProjectEditClose = useCallback(() => {
    setEditProjectOpen(false);
  }, [setEditProjectOpen]);

  const handleProjectDeleteClose = useCallback(() => {
    setDeleteProjectOpen(false);
  }, [setDeleteProjectOpen]);

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
        onEdit={mutateProjectEditOpen}
        onDelete={mutateProjectDeleteOpen}
        onShare={
          isOwner
            ? handleShareMembers
            : undefined
        }
      />

      {/* Tabs */}
      <Tabs defaultValue="expenses">
        <TabsList variant="line">
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="obligations">Obligaciones</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="budget">Presupuesto</TabsTrigger>
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
            onCreate={handleExpenseCreateOpen}
          />

          {exp.loading ? (
            <ExpensesSkeleton />
          ) : exp.expenses.length === 0 ? (
            <ExpensesEmptyState
              hasSearch={exp.hasSearch}
              onCreate={handleExpenseCreateOpen}
            />
          ) : (
            <>
              <ExpensesList
                expenses={exp.expenses}
                projectCurrency={detail.project?.currencyCode ?? ""}
                paymentMethods={paymentMethods}
                onEdit={handleExpenseEditSelect}
                onDelete={handleExpenseDeleteSelect}
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

          {exp.createOpen && (
            <CreateExpenseModal
              open={exp.createOpen}
              onClose={handleExpenseCreateClose}
              onCreate={mutateExpenseCreate}
              categories={cat.categories}
              paymentMethods={paymentMethods}
              obligations={obl.obligations}
              projectCurrency={detail.project?.currencyCode ?? ""}
            />
          )}
          {!!exp.editTarget && (
            <EditExpenseModal
              expense={exp.editTarget}
              open={!!exp.editTarget}
              onClose={handleExpenseEditClose}
              onSave={mutateExpenseUpdate}
              categories={cat.categories}
              paymentMethods={paymentMethods}
              obligations={obl.obligations}
              projectCurrency={detail.project?.currencyCode ?? ""}
            />
          )}
          <DeleteEntityModal
            item={exp.deleteTarget}
            open={!!exp.deleteTarget}
            onClose={handleExpenseDeleteClose}
            onConfirm={mutateExpenseDelete}
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
            onCreate={handleObligationCreateOpen}
          />

          {obl.loading ? (
            <ObligationsSkeleton />
          ) : obl.obligations.length === 0 ? (
            <ObligationsEmptyState
              hasFilter={obl.hasFilter}
              onCreate={handleObligationCreateOpen}
            />
          ) : (
            <>
              <ObligationsList
                obligations={obl.obligations}
                onEdit={handleObligationEditSelect}
                onDelete={handleObligationDeleteSelect}
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

          {obl.createOpen && (
            <CreateObligationModal
              open={obl.createOpen}
              onClose={handleObligationCreateClose}
              onCreate={mutateObligationCreate}
            />
          )}
          {!!obl.editTarget && (
            <EditObligationModal
              obligation={obl.editTarget}
              open={!!obl.editTarget}
              onClose={handleObligationEditClose}
              onSave={mutateObligationUpdate}
            />
          )}
          <DeleteEntityModal
            item={obl.deleteTarget}
            open={!!obl.deleteTarget}
            onClose={handleObligationDeleteClose}
            onConfirm={mutateObligationDelete}
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
            onCreate={handleCategoryCreateOpen}
          />

          {cat.loading ? (
            <CategoriesSkeleton />
          ) : cat.categories.length === 0 ? (
            <CategoriesEmptyState
              hasSearch={cat.hasSearch}
              onCreate={handleCategoryCreateOpen}
            />
          ) : (
            <CategoriesList
              categories={cat.categories}
              onEdit={handleCategoryEditSelect}
              onDelete={handleCategoryDeleteSelect}
            />
          )}

          {cat.createOpen && (
            <CreateCategoryModal
              open={cat.createOpen}
              onClose={handleCategoryCreateClose}
              onCreate={mutateCategoryCreate}
            />
          )}
          {!!cat.editTarget && (
            <EditCategoryModal
              category={cat.editTarget}
              open={!!cat.editTarget}
              onClose={handleCategoryEditClose}
              onSave={mutateCategoryUpdate}
            />
          )}
          <DeleteEntityModal
            item={cat.deleteTarget}
            open={!!cat.deleteTarget}
            onClose={handleCategoryDeleteClose}
            onConfirm={mutateCategoryDelete}
            title="Eliminar categoria"
            description="Esta accion no se puede deshacer."
            getMessage={(c) => `¿Eliminar categoría "${c.name}"? Los gastos de esta categoría se moverán a la categoría General.`}
          />
        </TabsContent>

        {/* ───── Budget tab ───── */}
        <TabsContent value="budget" className="flex flex-col gap-4">
          {bud.loading ? (
            <BudgetSkeleton />
          ) : (
            <BudgetPanel
              budget={bud.budget}
              projectCurrency={detail.project?.currencyCode ?? ""}
              canManage={!!canManageBudget}
              canDelete={!!canDeleteBudget}
              onSet={handleBudgetUpsertOpen}
              onDelete={handleBudgetDeleteSelect}
            />
          )}

          {bud.upsertOpen && (
            <SetProjectBudgetModal
              open={bud.upsertOpen}
              budget={bud.budget}
              projectCurrency={detail.project?.currencyCode ?? ""}
              onClose={handleBudgetUpsertClose}
              onSave={handleBudgetSave}
            />
          )}

          <DeleteEntityModal
            item={bud.deleteTarget}
            open={!!bud.deleteTarget}
            onClose={handleBudgetDeleteClose}
            onConfirm={mutateBudgetDelete}
            title="Eliminar presupuesto"
            description="El proyecto quedará sin un límite general de gastos."
            getMessage={() => "¿Eliminar el presupuesto configurado para este proyecto?"}
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
              onUnlink={handleUnlinkSelect}
            />
          )}

          <LinkPaymentMethodModal
            open={ppm.linkOpen}
            onClose={handleLinkDialogClose}
            availableMethods={ppm.availableMethods}
            linkedMethods={ppm.linkedMethods}
            loading={ppm.availableLoading}
            onLink={ppm.handleLink}
          />
          <DeleteEntityModal
            item={ppm.unlinkTarget}
            open={!!ppm.unlinkTarget}
            onClose={handleUnlinkClose}
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
          {editProjectOpen && (
            <EditProjectModal
              project={detail.project}
              open={editProjectOpen}
              onClose={handleProjectEditClose}
              onSave={mutateProjectUpdate}
            />
          )}
          <DeleteEntityModal
            item={detail.project}
            open={deleteProjectOpen}
            onClose={handleProjectDeleteClose}
            onConfirm={mutateProjectDelete}
            title="Eliminar proyecto"
            description="Esta accion puede desactivarlo, no eliminarlo definitivamente."
            getMessage={(p) => `¿Eliminar proyecto "${p.name}"?`}
          />
        </>
      )}
    </div>
  );
}
