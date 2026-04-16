"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { getCurrentMonthKey, getMonthBounds } from "@/lib/date-utils"
import { TabsContent } from "@/components/ui/tabs"
import { MovementDetailSheet } from "@/components/project-detail/shared/movement-detail-sheet"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { Pagination } from "@/components/shared/pagination"
import { IncomesToolbar } from "@/components/project-detail/incomes/incomes-toolbar"
import { IncomesList } from "@/components/project-detail/incomes/incomes-list"
import { BulkImportView } from "@/components/project-detail/shared/bulk-import/bulk-import-view"
import {
  IncomesEmptyState,
  IncomesSkeleton,
} from "@/components/project-detail/incomes/income-states"
import type { CategoryResponse } from "@/types/category"
import type { CurrencyResponse } from "@/types/currency"
import type {
  BulkCreateIncomesRequest,
  CreateIncomeRequest,
  IncomeResponse,
  UpdateIncomeRequest,
} from "@/types/income"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { ProjectPartnerResponse } from "@/types/project-partner"
import { useLanguage } from "@/context/language-context"

const IncomesCalendar = dynamic(() =>
  import("@/components/project-detail/incomes/incomes-calendar").then((mod) => mod.IncomesCalendar)
)
const IncomesCalendarDaySheet = dynamic(() =>
  import("@/components/project-detail/incomes/incomes-calendar-day-sheet").then((mod) => mod.IncomesCalendarDaySheet)
)

const CreateIncomeModal = dynamic(() =>
  import("@/components/project-detail/incomes/create-income-modal").then((mod) => mod.CreateIncomeModal)
)
const EditIncomeModal = dynamic(() =>
  import("@/components/project-detail/incomes/edit-income-modal").then((mod) => mod.EditIncomeModal)
)

interface IncomesTabState {
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
  incomes: IncomeResponse[]
  hasSearch: boolean
  page: number
  total: number
  setPage: (value: number) => void
  createOpen: boolean
  bulkImportOpen: boolean
  setBulkImportOpen: (v: boolean) => void
  editTarget: IncomeResponse | null
  deleteTarget: IncomeResponse | null
  duplicateSource: IncomeResponse | null
}

interface ProjectDetailIncomesTabProps {
  projectId: string
  inc: IncomesTabState
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  availableCurrencies: CurrencyResponse[]
  projectCurrency: string
  alternativeCurrencyCodes: string[]
  createMode: "manual" | "ai"
  partnersEnabled?: boolean
  assignedPartners?: ProjectPartnerResponse[]
  canUseOcr?: boolean
  onCreateManual: () => void
  onCreateWithAi: () => void
  onCreateClose: () => void
  onEditSelect: (income: IncomeResponse) => void
  onEditClose: () => void
  onDeleteSelect: (income: IncomeResponse) => void
  onDeleteClose: () => void
  onCreate: (data: CreateIncomeRequest) => void
  onBulkCreate: (data: BulkCreateIncomesRequest) => Promise<void>
  onSave: (id: string, data: UpdateIncomeRequest) => void
  onDelete: (income: IncomeResponse) => void
  onToggleActive: (income: IncomeResponse, isActive: boolean) => void
  onDuplicate: (income: IncomeResponse) => void
}

export function ProjectDetailIncomesTab({
  projectId,
  inc,
  categories,
  paymentMethods,
  availableCurrencies,
  projectCurrency,
  alternativeCurrencyCodes,
  createMode,
  canUseOcr = true,
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
}: ProjectDetailIncomesTabProps) {
  const { t, locale } = useLanguage()
  const [viewTarget, setViewTarget] = useState<IncomeResponse | null>(null)
  const [view, setView] = useState<"list" | "import">("list")

  // Calendar state
  const [viewMode, setViewMode] = useState<"list" | "calendar">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`incomes:view-mode:${projectId}`)
      return (saved as "list" | "calendar") || "list"
    }
    return "list"
  })
  const [calendarMonth, setCalendarMonth] = useState<string>(getCurrentMonthKey())
  const [calendarDayDetail, setCalendarDayDetail] = useState<string | null>(null)

  const handleViewModeChange = (mode: "list" | "calendar") => {
    setViewMode(mode)
    if (typeof window !== "undefined") {
      localStorage.setItem(`incomes:view-mode:${projectId}`, mode)
    }
    if (mode === "calendar") {
      const { from, to } = getMonthBounds(calendarMonth)
      inc.handleDateFromChange(from)
      inc.handleDateToChange(to)
    }
  }

  const handleCalendarMonthChange = (month: string) => {
    setCalendarMonth(month)
    const { from, to } = getMonthBounds(month)
    inc.handleDateFromChange(from)
    inc.handleDateToChange(to)
  }

  return (
    <TabsContent value="incomes" className="flex flex-col gap-4">
      {view === "import" ? (
        <BulkImportView
          mode="incomes"
          projectCurrency={projectCurrency}
          categories={categories}
          paymentMethods={paymentMethods}
          alternativeCurrencyCodes={alternativeCurrencyCodes}
          partnersEnabled={partnersEnabled}
          assignedPartners={assignedPartners}
          onSubmitIncomes={onBulkCreate}
          onClose={() => setView("list")}
        />
      ) : (
        <>
          <div className="min-w-0 rounded-xl border border-border bg-card overflow-hidden">
            <IncomesToolbar
              query={inc.query}
              onQueryChange={inc.setQuery}
              activeStatus={inc.activeStatus}
              onActiveStatusChange={inc.handleActiveStatusChange}
              sort={inc.sort}
              onSortChange={inc.handleSortChange}
              pageSize={inc.pageSize}
              onPageSizeChange={inc.handlePageSizeChange}
              categories={categories}
              categoryId={inc.selectedCategoryId}
              onCategoryChange={inc.setSelectedCategoryId}
              dateFrom={inc.dateFrom}
              dateTo={inc.dateTo}
              onDateFromChange={inc.handleDateFromChange}
              onDateToChange={inc.handleDateToChange}
              canUseOcr={canUseOcr}
              onCreateManual={onCreateManual}
              onCreateWithAi={onCreateWithAi}
              onBulkImport={() => setView("import")}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />

            {inc.loading ? (
              <IncomesSkeleton />
            ) : viewMode === "calendar" ? (
              <>
                <IncomesCalendar
                  incomes={inc.incomes}
                  month={calendarMonth}
                  onMonthChange={handleCalendarMonthChange}
                  onDayClick={setCalendarDayDetail}
                  projectCurrency={projectCurrency}
                  locale={locale}
                />
                <IncomesCalendarDaySheet
                  date={calendarDayDetail}
                  incomes={
                    calendarDayDetail
                      ? inc.incomes.filter((i) => i.incomeDate === calendarDayDetail)
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
            ) : inc.incomes.length === 0 ? (
              <IncomesEmptyState hasSearch={inc.hasSearch} onCreate={onCreateManual} />
            ) : (
              <div className="overflow-x-auto">
                <IncomesList
                  incomes={inc.incomes}
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

          {!inc.loading && inc.incomes.length > 0 && !inc.hasSearch && (
            <Pagination
              page={inc.page}
              pageSize={inc.pageSize}
              total={inc.total}
              onPageChange={inc.setPage}
            />
          )}
        </>
      )}

      {inc.createOpen && (
        <CreateIncomeModal
          key={inc.duplicateSource?.id ?? "new"}
          projectId={projectId}
          mode={createMode}
          open={inc.createOpen}
          onClose={onCreateClose}
          onCreate={onCreate}
          categories={categories}
          paymentMethods={paymentMethods}
          availableCurrencies={availableCurrencies}
          projectCurrency={projectCurrency}
          alternativeCurrencyCodes={alternativeCurrencyCodes}
          partnersEnabled={partnersEnabled}
          assignedPartners={assignedPartners}
          sourceIncome={inc.duplicateSource ?? undefined}
        />
      )}

      {!!inc.editTarget && (
        <EditIncomeModal
          income={inc.editTarget}
          open={!!inc.editTarget}
          onClose={onEditClose}
          onSave={onSave}
          categories={categories}
          paymentMethods={paymentMethods}
          availableCurrencies={availableCurrencies}
          projectCurrency={projectCurrency}
          alternativeCurrencyCodes={alternativeCurrencyCodes}
          partnersEnabled={partnersEnabled}
          assignedPartners={assignedPartners}
        />
      )}

      <DeleteEntityModal
        item={inc.deleteTarget}
        open={!!inc.deleteTarget}
        onClose={onDeleteClose}
        onConfirm={onDelete}
        title={t("incomes.delete.title")}
        description={t("incomes.delete.description")}
        getMessage={(income) => t("incomes.delete.confirm", { name: income.title })}
      />

      <MovementDetailSheet
        movement={viewTarget ? { type: "income", data: viewTarget } : null}
        projectCurrency={projectCurrency}
        paymentMethods={paymentMethods}
        onClose={() => setViewTarget(null)}
        onEdit={() => { setViewTarget(null); onEditSelect(viewTarget!) }}
      />

    </TabsContent>
  )
}
