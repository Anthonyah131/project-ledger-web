"use client";

// views/project-detail/project-detail-view.tsx
// Orchestrator for the project-detail page — header + 3 tabs.

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ── Hooks ────────────────────────────────────────────
import { useProjectDetail } from "@/hooks/projects/use-project-detail";
import { useProjectExpenses } from "@/hooks/projects/use-project-expenses";
import { useProjectCategories } from "@/hooks/projects/use-project-categories";
import { useProjectObligations } from "@/hooks/projects/use-project-obligations";

// ── Header ───────────────────────────────────────────
import { ProjectHeader } from "@/components/project-detail/project-header";
import { EditProjectModal } from "@/components/projects/project-modals";
import { DeleteProjectModal } from "@/components/projects/project-modals";

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
  DeleteExpenseModal,
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
  DeleteCategoryModal,
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
  DeleteObligationModal,
} from "@/components/project-detail/obligations/obligation-modals";

// ── Shared ───────────────────────────────────────────
import { Pagination } from "@/components/shared/pagination";

// ── Payment methods (for expense selects) ────────────
import * as paymentMethodService from "@/services/payment-method-service";
import type { PaymentMethodResponse } from "@/types/payment-method";

import type { ProjectResponse } from "@/types/project";

interface Props {
  projectId: string;
}

export function ProjectDetailView({ projectId }: Props) {
  const router = useRouter();

  // ─── Project ──────────────────────────────────────────────
  const detail = useProjectDetail(projectId);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);

  // ─── Expenses ─────────────────────────────────────────────
  const exp = useProjectExpenses(projectId);

  // ─── Categories ───────────────────────────────────────────
  const cat = useProjectCategories(projectId);

  // ─── Obligations ──────────────────────────────────────────
  const obl = useProjectObligations(projectId);

  // ─── Payment Methods (global, for expense selects) ───────
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>(
    [],
  );
  useEffect(() => {
    paymentMethodService
      .getPaymentMethods()
      .then(setPaymentMethods)
      .catch(() => {});
  }, []);

  // ─── Project header actions ───────────────────────────────
  const handleProjectEdit = useCallback(() => {
    setEditProjectOpen(true);
  }, []);

  const handleProjectDelete = useCallback(() => {
    setDeleteProjectOpen(true);
  }, []);

  const handleProjectEditSave = useCallback(
    (_id: string, data: { name: string; description: string }) => {
      detail.handleEdit(data);
    },
    [detail],
  );

  const handleProjectDeleteConfirm = useCallback(
    async (_project: ProjectResponse) => {
      const deleted = await detail.handleDelete();
      if (deleted) router.push("/projects");
    },
    [detail, router],
  );

  // ─── UI ───────────────────────────────────────────────────
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <ProjectHeader
        project={detail.project}
        loading={detail.loading}
        onEdit={handleProjectEdit}
        onDelete={handleProjectDelete}
      />

      {/* Tabs */}
      <Tabs defaultValue="expenses">
        <TabsList variant="line">
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="obligations">Obligaciones</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
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
            onCreate={exp.handleCreate}
            categories={cat.categories}
            paymentMethods={paymentMethods}
            obligations={obl.obligations}
            projectCurrency={detail.project?.currencyCode ?? ""}
          />
          <EditExpenseModal
            expense={exp.editTarget}
            open={!!exp.editTarget}
            onClose={() => exp.setEditTarget(null)}
            onSave={exp.handleEdit}
            categories={cat.categories}
            paymentMethods={paymentMethods}
            projectCurrency={detail.project?.currencyCode ?? ""}
          />
          <DeleteExpenseModal
            expense={exp.deleteTarget}
            open={!!exp.deleteTarget}
            onClose={() => exp.setDeleteTarget(null)}
            onConfirm={exp.handleDelete}
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
          <DeleteObligationModal
            obligation={obl.deleteTarget}
            open={!!obl.deleteTarget}
            onClose={() => obl.setDeleteTarget(null)}
            onConfirm={obl.handleDelete}
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
          <DeleteCategoryModal
            category={cat.deleteTarget}
            open={!!cat.deleteTarget}
            onClose={() => cat.setDeleteTarget(null)}
            onConfirm={cat.handleDelete}
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
          <DeleteProjectModal
            project={detail.project}
            open={deleteProjectOpen}
            onClose={() => setDeleteProjectOpen(false)}
            onConfirm={handleProjectDeleteConfirm}
          />
        </>
      )}
    </div>
  );
}
