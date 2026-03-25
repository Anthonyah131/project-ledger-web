"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Plus } from "lucide-react"
import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { Pagination } from "@/components/shared/pagination"
import { PartnerBalanceCards } from "@/components/project-detail/partner-settlements/partner-balance-cards"
import { SettlementsList } from "@/components/project-detail/partner-settlements/settlements-list"
import {
  BalanceCardsSkeleton,
  SettlementsSkeleton,
  SettlementsEmptyState,
  NoPartnersState,
} from "@/components/project-detail/partner-settlements/settlement-states"
import type {
  PartnerSettlementResponse,
  CreateSettlementRequest,
  UpdateSettlementRequest,
  SettlementSuggestion,
  SettlementSuggestionsResponse,
  PartnersBalanceResponse,
  PartnerBalanceItem,
} from "@/types/partner-settlement"
import type { ProjectPartnerResponse } from "@/types/project-partner"
import { useLanguage } from "@/context/language-context"

const CreateSettlementModal = dynamic(() =>
  import("@/components/project-detail/partner-settlements/create-settlement-modal").then(
    (mod) => mod.CreateSettlementModal,
  ),
)
const EditSettlementModal = dynamic(() =>
  import("@/components/project-detail/partner-settlements/edit-settlement-modal").then(
    (mod) => mod.EditSettlementModal,
  ),
)
const PartnerHistoryModal = dynamic(() =>
  import("@/components/project-detail/partner-settlements/partner-history-modal").then(
    (mod) => mod.PartnerHistoryModal,
  ),
)
const SettlementSuggestionsModal = dynamic(() =>
  import(
    "@/components/project-detail/partner-settlements/settlement-suggestions-modal"
  ).then((mod) => mod.SettlementSuggestionsModal),
)

interface PartnersTabState {
  balance: PartnersBalanceResponse | null
  balanceLoading: boolean
  settlements: PartnerSettlementResponse[]
  totalCount: number
  settlementsLoading: boolean
  page: number
  setPage: (value: number) => void
  pageSize: number
  createOpen: boolean
  setCreateOpen: (value: boolean) => void
  editTarget: PartnerSettlementResponse | null
  setEditTarget: (value: PartnerSettlementResponse | null) => void
  deleteTarget: PartnerSettlementResponse | null
  setDeleteTarget: (value: PartnerSettlementResponse | null) => void
  historyPartnerId: string | null
  historyPartnerName: string
  openHistory: (partner: PartnerBalanceItem) => void
  closeHistory: () => void
  suggestions: SettlementSuggestionsResponse | null
  suggestionsLoading: boolean
  suggestionsOpen: boolean
  openSuggestions: () => void
  closeSuggestions: () => void
}

interface ProjectDetailPartnersTabProps {
  projectId: string
  sel: PartnersTabState
  assignedPartners: ProjectPartnerResponse[]
  projectCurrency: string
  alternativeCurrencyCodes: string[]
  canEdit: boolean
  onCreate: (data: CreateSettlementRequest) => void
  onSave: (id: string, data: UpdateSettlementRequest) => void
  onDelete: (settlement: PartnerSettlementResponse) => void
}

export function ProjectDetailPartnersTab({
  projectId,
  sel,
  assignedPartners,
  projectCurrency,
  alternativeCurrencyCodes,
  canEdit,
  onCreate,
  onSave,
  onDelete,
}: ProjectDetailPartnersTabProps) {
  const { t } = useLanguage()
  const hasPartners = (sel.balance?.partners.length ?? 0) > 0 || assignedPartners.length > 0

  // Prefill state for create modal from suggestion
  const [prefill, setPrefill] = useState<
    { fromPartnerId: string; toPartnerId: string; amount: string } | undefined
  >()

  function handleUseSuggestion(suggestion: SettlementSuggestion) {
    setPrefill({
      fromPartnerId: suggestion.fromPartnerId,
      toPartnerId: suggestion.toPartnerId,
      amount: String(suggestion.amount),
    })
    sel.setCreateOpen(true)
  }

  function handleCreateClose() {
    sel.setCreateOpen(false)
    setPrefill(undefined)
  }

  return (
    <TabsContent value="partners" className="flex flex-col gap-6">
      {/* ── Balance cards ── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">{t("partnerSettlements.balanceByPartner")}</h2>

        {sel.balanceLoading ? (
          <BalanceCardsSkeleton />
        ) : !hasPartners ? (
          <NoPartnersState />
        ) : sel.balance && sel.balance.partners.length > 0 ? (
          <PartnerBalanceCards
            balance={sel.balance}
            onViewHistory={sel.openHistory}
            onSuggest={sel.openSuggestions}
          />
        ) : null}
      </section>

      {/* ── Settlements ── */}
      {hasPartners && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{t("partnerSettlements.settlementsSection")}</h2>
            {canEdit && (
              <Button size="sm" onClick={() => sel.setCreateOpen(true)}>
                <Plus className="size-4" />
                {t("partnerSettlements.new")}
              </Button>
            )}
          </div>

          {sel.settlementsLoading ? (
            <SettlementsSkeleton />
          ) : sel.settlements.length === 0 ? (
            <SettlementsEmptyState onCreate={() => sel.setCreateOpen(true)} />
          ) : (
            <>
              <SettlementsList
                settlements={sel.settlements}
                projectCurrency={projectCurrency}
                canEdit={canEdit}
                onEdit={sel.setEditTarget}
                onDelete={sel.setDeleteTarget}
              />
              <Pagination
                page={sel.page}
                pageSize={sel.pageSize}
                total={sel.totalCount}
                onPageChange={sel.setPage}
              />
            </>
          )}
        </section>
      )}

      {/* ── Modals ── */}
      {sel.createOpen && (
        <CreateSettlementModal
          open={sel.createOpen}
          onClose={handleCreateClose}
          onCreate={onCreate}
          assignedPartners={assignedPartners}
          projectCurrency={projectCurrency}
          alternativeCurrencyCodes={alternativeCurrencyCodes}
          prefill={prefill}
        />
      )}

      {!!sel.editTarget && (
        <EditSettlementModal
          settlement={sel.editTarget}
          open={!!sel.editTarget}
          onClose={() => sel.setEditTarget(null)}
          onSave={onSave}
          projectCurrency={projectCurrency}
          alternativeCurrencyCodes={alternativeCurrencyCodes}
        />
      )}

      <DeleteEntityModal
        item={sel.deleteTarget}
        open={!!sel.deleteTarget}
        onClose={() => sel.setDeleteTarget(null)}
        onConfirm={onDelete}
        title={t("partnerSettlements.delete.title")}
        description={t("partnerSettlements.delete.revertWarning")}
        getMessage={(s) => t("partnerSettlements.delete.confirm", { from: s.fromPartnerName, to: s.toPartnerName })}
      />

      {!!sel.historyPartnerId && (
        <PartnerHistoryModal
          open={!!sel.historyPartnerId}
          projectId={projectId}
          partnerId={sel.historyPartnerId}
          partnerName={sel.historyPartnerName}
          projectCurrency={projectCurrency}
          onClose={sel.closeHistory}
        />
      )}

      {sel.suggestionsOpen && (
        <SettlementSuggestionsModal
          open={sel.suggestionsOpen}
          suggestions={sel.suggestions}
          loading={sel.suggestionsLoading}
          onClose={sel.closeSuggestions}
          onUseSuggestion={handleUseSuggestion}
        />
      )}
    </TabsContent>
  )
}
