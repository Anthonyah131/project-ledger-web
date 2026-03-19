"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { TabsContent } from "@/components/ui/tabs"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { Pagination } from "@/components/shared/pagination"
import { ExpensesToolbar } from "@/components/project-detail/expenses/expenses-toolbar"
import { ExpensesList } from "@/components/project-detail/expenses/expenses-list"
import { MovementDetailSheet } from "@/components/project-detail/shared/movement-detail-sheet"
import {
  ExpensesEmptyState,
  ExpensesSkeleton,
} from "@/components/project-detail/expenses/expense-states"
import type { CategoryResponse } from "@/types/category"
import type {
  CreateExpenseRequest,
  ExpenseResponse,
  UpdateExpenseRequest,
} from "@/types/expense"
import type { ObligationResponse } from "@/types/obligation"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { ProjectPartnerResponse } from "@/types/project-partner"

const CreateExpenseModal = dynamic(() =>
  import("@/components/project-detail/expenses/create-expense-modal").then((mod) => mod.CreateExpenseModal)
)
const EditExpenseModal = dynamic(() =>
  import("@/components/project-detail/expenses/edit-expense-modal").then((mod) => mod.EditExpenseModal)
)

interface ExpensesTabState {
  query: string
  setQuery: (value: string) => void
  activeStatus: "all" | "active" | "inactive"
  handleActiveStatusChange: (value: "all" | "active" | "inactive") => void
  sort: string
  handleSortChange: (value: string) => void
  pageSize: number
  handlePageSizeChange: (value: number) => void
  selectedCategoryId: string
  setSelectedCategoryId: (value: string) => void
  loading: boolean
  expenses: ExpenseResponse[]
  hasSearch: boolean
  page: number
  total: number
  setPage: (value: number) => void
  createOpen: boolean
  editTarget: ExpenseResponse | null
  deleteTarget: ExpenseResponse | null
}

interface ProjectDetailExpensesTabProps {
  projectId: string
  exp: ExpensesTabState
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  obligations: ObligationResponse[]
  projectCurrency: string
  alternativeCurrencyCodes: string[]
  createMode: "manual" | "ai"
  partnersEnabled?: boolean
  assignedPartners?: ProjectPartnerResponse[]
  onCreateManual: () => void
  onCreateWithAi: () => void
  onCreateClose: () => void
  onEditSelect: (expense: ExpenseResponse) => void
  onEditClose: () => void
  onDeleteSelect: (expense: ExpenseResponse) => void
  onDeleteClose: () => void
  onCreate: (data: CreateExpenseRequest) => void
  onSave: (id: string, data: UpdateExpenseRequest) => void
  onDelete: (expense: ExpenseResponse) => void
  onToggleActive: (expense: ExpenseResponse, isActive: boolean) => void
}

export function ProjectDetailExpensesTab({
  projectId,
  exp,
  categories,
  paymentMethods,
  obligations,
  projectCurrency,
  alternativeCurrencyCodes,
  createMode,
  partnersEnabled = false,
  assignedPartners = [],
  onCreateManual,
  onCreateWithAi,
  onCreateClose,
  onEditSelect,
  onEditClose,
  onDeleteSelect,
  onDeleteClose,
  onCreate,
  onSave,
  onDelete,
  onToggleActive,
}: ProjectDetailExpensesTabProps) {
  const [viewTarget, setViewTarget] = useState<ExpenseResponse | null>(null)

  return (
    <TabsContent value="expenses" className="flex flex-col gap-4">
      <ExpensesToolbar
        query={exp.query}
        onQueryChange={exp.setQuery}
        activeStatus={exp.activeStatus}
        onActiveStatusChange={exp.handleActiveStatusChange}
        sort={exp.sort}
        onSortChange={exp.handleSortChange}
        pageSize={exp.pageSize}
        onPageSizeChange={exp.handlePageSizeChange}
        categories={categories}
        categoryId={exp.selectedCategoryId}
        onCategoryChange={exp.setSelectedCategoryId}
        onCreateManual={onCreateManual}
        onCreateWithAi={onCreateWithAi}
      />

      {exp.loading ? (
        <ExpensesSkeleton />
      ) : exp.expenses.length === 0 ? (
        <ExpensesEmptyState hasSearch={exp.hasSearch} onCreate={onCreateManual} />
      ) : (
        <>
          <ExpensesList
            expenses={exp.expenses}
            projectCurrency={projectCurrency}
            paymentMethods={paymentMethods}
            onEdit={onEditSelect}
            onDelete={onDeleteSelect}
            onToggleActive={onToggleActive}
            onView={setViewTarget}
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
          projectId={projectId}
          mode={createMode}
          open={exp.createOpen}
          onClose={onCreateClose}
          onCreate={onCreate}
          categories={categories}
          paymentMethods={paymentMethods}
          obligations={obligations}
          projectCurrency={projectCurrency}
          alternativeCurrencyCodes={alternativeCurrencyCodes}
          partnersEnabled={partnersEnabled}
          assignedPartners={assignedPartners}
        />
      )}

      {!!exp.editTarget && (
        <EditExpenseModal
          expense={exp.editTarget}
          open={!!exp.editTarget}
          onClose={onEditClose}
          onSave={onSave}
          categories={categories}
          paymentMethods={paymentMethods}
          obligations={obligations}
          projectCurrency={projectCurrency}
          alternativeCurrencyCodes={alternativeCurrencyCodes}
          partnersEnabled={partnersEnabled}
          assignedPartners={assignedPartners}
        />
      )}

      <DeleteEntityModal
        item={exp.deleteTarget}
        open={!!exp.deleteTarget}
        onClose={onDeleteClose}
        onConfirm={onDelete}
        title="Eliminar gasto"
        description="Esta accion no se puede deshacer."
        getMessage={(expense) => `¿Eliminar gasto "${expense.title}"?`}
      />

      <MovementDetailSheet
        movement={viewTarget ? { type: "expense", data: viewTarget } : null}
        projectCurrency={projectCurrency}
        paymentMethods={paymentMethods}
        onClose={() => setViewTarget(null)}
        onEdit={() => { setViewTarget(null); onEditSelect(viewTarget!) }}
      />
    </TabsContent>
  )
}
