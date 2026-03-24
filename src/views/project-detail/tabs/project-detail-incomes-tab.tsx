"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { TabsContent } from "@/components/ui/tabs"
import { MovementDetailSheet } from "@/components/project-detail/shared/movement-detail-sheet"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { Pagination } from "@/components/shared/pagination"
import { IncomesToolbar } from "@/components/project-detail/incomes/incomes-toolbar"
import { IncomesList } from "@/components/project-detail/incomes/incomes-list"
import {
  IncomesEmptyState,
  IncomesSkeleton,
} from "@/components/project-detail/incomes/income-states"
import type { CategoryResponse } from "@/types/category"
import type { CurrencyResponse } from "@/types/currency"
import type {
  CreateIncomeRequest,
  IncomeResponse,
  UpdateIncomeRequest,
} from "@/types/income"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { ProjectPartnerResponse } from "@/types/project-partner"
import { useLanguage } from "@/context/language-context"

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
  loading: boolean
  incomes: IncomeResponse[]
  hasSearch: boolean
  page: number
  total: number
  setPage: (value: number) => void
  createOpen: boolean
  editTarget: IncomeResponse | null
  deleteTarget: IncomeResponse | null
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
  onCreateManual: () => void
  onCreateWithAi: () => void
  onCreateClose: () => void
  onEditSelect: (income: IncomeResponse) => void
  onEditClose: () => void
  onDeleteSelect: (income: IncomeResponse) => void
  onDeleteClose: () => void
  onCreate: (data: CreateIncomeRequest) => void
  onSave: (id: string, data: UpdateIncomeRequest) => void
  onDelete: (income: IncomeResponse) => void
  onToggleActive: (income: IncomeResponse, isActive: boolean) => void
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
}: ProjectDetailIncomesTabProps) {
  const { t } = useLanguage()
  const [viewTarget, setViewTarget] = useState<IncomeResponse | null>(null)

  return (
    <TabsContent value="incomes" className="flex flex-col gap-4">
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
        onCreateManual={onCreateManual}
        onCreateWithAi={onCreateWithAi}
      />

      {inc.loading ? (
        <IncomesSkeleton />
      ) : inc.incomes.length === 0 ? (
        <IncomesEmptyState hasSearch={inc.hasSearch} onCreate={onCreateManual} />
      ) : (
        <>
          <IncomesList
            incomes={inc.incomes}
            projectCurrency={projectCurrency}
            paymentMethods={paymentMethods}
            onEdit={onEditSelect}
            onDelete={onDeleteSelect}
            onToggleActive={onToggleActive}
            onView={setViewTarget}
          />
          {!inc.hasSearch && (
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
        title={t("incomes.deleteTitle")}
        description={t("incomes.deleteConfirmDescription")}
        getMessage={(income) => t("incomes.deleteConfirmDescriptionNamed", { name: income.title })}
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
