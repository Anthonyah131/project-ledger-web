"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { TabsContent } from "@/components/ui/tabs"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { Pagination } from "@/components/shared/pagination"
import { ExpensesToolbar } from "@/components/project-detail/expenses/expenses-toolbar"
import { ExpensesList } from "@/components/project-detail/expenses/expenses-list"
import { MovementDetailSheet } from "@/components/project-detail/shared/movement-detail-sheet"
import { BulkImportView } from "@/components/project-detail/shared/bulk-import/bulk-import-view"
import {
  ExpensesEmptyState,
  ExpensesSkeleton,
} from "@/components/project-detail/expenses/expense-states"
import type { CategoryResponse } from "@/types/category"
import type {
  BulkCreateExpensesRequest,
  CreateExpenseRequest,
  ExpenseResponse,
  UpdateExpenseRequest,
} from "@/types/expense"
import type { ObligationResponse } from "@/types/obligation"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { ProjectPartnerResponse } from "@/types/project-partner"
import { useLanguage } from "@/context/language-context"
import { getCurrentMonthKey, getMonthBounds } from "@/lib/date-utils"

const CreateExpenseModal = dynamic(() =>
  import("@/components/project-detail/expenses/create-expense-modal").then((mod) => mod.CreateExpenseModal)
)
const EditExpenseModal = dynamic(() =>
  import("@/components/project-detail/expenses/edit-expense-modal").then((mod) => mod.EditExpenseModal)
)
const ExpensesCalendar = dynamic(() =>
  import("@/components/project-detail/expenses/expenses-calendar").then((mod) => mod.ExpensesCalendar)
)
const ExpensesCalendarDaySheet = dynamic(() =>
  import("@/components/project-detail/expenses/expenses-calendar-day-sheet").then((mod) => mod.ExpensesCalendarDaySheet)
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
  dateFrom: string
  dateTo: string
  handleDateFromChange: (value: string) => void
  handleDateToChange: (value: string) => void
  loading: boolean
  expenses: ExpenseResponse[]
  hasSearch: boolean
  page: number
  total: number
  setPage: (value: number) => void
  createOpen: boolean
  bulkImportOpen: boolean
  setBulkImportOpen: (v: boolean) => void
  editTarget: ExpenseResponse | null
  deleteTarget: ExpenseResponse | null
  duplicateSource: ExpenseResponse | null
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
  onBulkCreate: (data: BulkCreateExpensesRequest) => Promise<void>
  onSave: (id: string, data: UpdateExpenseRequest) => void
  onDelete: (expense: ExpenseResponse) => void
  onToggleActive: (expense: ExpenseResponse, isActive: boolean) => void
  onDuplicate: (expense: ExpenseResponse) => void
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
  onBulkCreate,
  onSave,
  onDelete,
  onToggleActive,
  onDuplicate,
}: ProjectDetailExpensesTabProps) {
  const { t, locale } = useLanguage()
  const [viewTarget, setViewTarget] = useState<ExpenseResponse | null>(null)
  const [view, setView] = useState<"list" | "import">("list")

  // Calendar state
  const [viewMode, setViewMode] = useState<"list" | "calendar">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`expenses:view-mode:${projectId}`)
      return (saved as "list" | "calendar") || "list"
    }
    return "list"
  })
  const [calendarMonth, setCalendarMonth] = useState<string>(getCurrentMonthKey())
  const [calendarDayDetail, setCalendarDayDetail] = useState<string | null>(null)

  // Handle viewMode change and month bounds
  const handleViewModeChange = (mode: "list" | "calendar") => {
    setViewMode(mode)
    if (typeof window !== "undefined") {
      localStorage.setItem(`expenses:view-mode:${projectId}`, mode)
    }
    if (mode === "calendar") {
      const { from, to } = getMonthBounds(calendarMonth)
      exp.handleDateFromChange(from)
      exp.handleDateToChange(to)
    }
  }

  const handleCalendarMonthChange = (month: string) => {
    setCalendarMonth(month)
    const { from, to } = getMonthBounds(month)
    exp.handleDateFromChange(from)
    exp.handleDateToChange(to)
  }

  return (
    <TabsContent value="expenses" className="flex flex-col gap-4">
      {view === "import" ? (
        <BulkImportView
          mode="expenses"
          projectCurrency={projectCurrency}
          categories={categories}
          paymentMethods={paymentMethods}
          alternativeCurrencyCodes={alternativeCurrencyCodes}
          partnersEnabled={partnersEnabled}
          assignedPartners={assignedPartners}
          obligations={obligations}
          onSubmitExpenses={onBulkCreate}
          onClose={() => setView("list")}
        />
      ) : (
        <>
          <div className="min-w-0 rounded-xl border border-border bg-card overflow-hidden">
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
              dateFrom={exp.dateFrom}
              dateTo={exp.dateTo}
              onDateFromChange={exp.handleDateFromChange}
              onDateToChange={exp.handleDateToChange}
              categoryId={exp.selectedCategoryId}
              onCategoryChange={exp.setSelectedCategoryId}
              onCreateManual={onCreateManual}
              onCreateWithAi={onCreateWithAi}
              onBulkImport={() => setView("import")}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />

            {exp.loading ? (
              <ExpensesSkeleton />
            ) : viewMode === "calendar" ? (
              <>
                <ExpensesCalendar
                  expenses={exp.expenses}
                  month={calendarMonth}
                  onMonthChange={handleCalendarMonthChange}
                  onDayClick={setCalendarDayDetail}
                  projectCurrency={projectCurrency}
                  locale={locale}
                />
                <ExpensesCalendarDaySheet
                  date={calendarDayDetail}
                  expenses={
                    calendarDayDetail
                      ? exp.expenses.filter((e) => e.expenseDate === calendarDayDetail)
                      : []
                  }
                  open={calendarDayDetail !== null}
                  onOpenChange={(v) => !v && setCalendarDayDetail(null)}
                  onCreate={onCreateManual}
                  onEdit={onEditSelect}
                  onDelete={onDeleteSelect}
                  projectCurrency={projectCurrency}
                  locale={locale}
                />
              </>
            ) : exp.expenses.length === 0 ? (
              <ExpensesEmptyState hasSearch={exp.hasSearch} onCreate={onCreateManual} />
            ) : (
              <div className="overflow-x-auto">
                <ExpensesList
                  expenses={exp.expenses}
                  projectCurrency={projectCurrency}
                  paymentMethods={paymentMethods}
                  onEdit={onEditSelect}
                  onDelete={onDeleteSelect}
                  onToggleActive={onToggleActive}
                  onView={setViewTarget}
                  onDuplicate={onDuplicate}
                />
              </div>
            )}
          </div>

          {!exp.loading && exp.expenses.length > 0 && !exp.hasSearch && (
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
          key={exp.duplicateSource?.id ?? "new"}
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
          sourceExpense={exp.duplicateSource ?? undefined}
          defaultDate={viewMode === "calendar" ? calendarDayDetail ?? undefined : undefined}
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
        title={t("expenses.delete.title")}
        description={t("expenses.delete.description")}
        getMessage={(expense) => t("expenses.delete.confirm", { name: expense.title })}
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
