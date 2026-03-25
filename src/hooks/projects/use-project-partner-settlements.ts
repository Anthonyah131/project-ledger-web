"use client"

// hooks/projects/use-project-partner-settlements.ts
// State management for partner balances and settlements within a project.

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import * as settlementService from "@/services/partner-settlement-service"
import { toastApiError } from "@/lib/error-utils"
import { useLanguage } from "@/context/language-context"
import type {
  PartnerBalanceItem,
  PartnersBalanceResponse,
  PartnerSettlementResponse,
  SettlementSuggestionsResponse,
  CreateSettlementRequest,
  UpdateSettlementRequest,
} from "@/types/partner-settlement"
import type { MutationOptions } from "@/types/common"

export function useProjectPartnerSettlements(projectId: string, enabled: boolean) {
  const { t } = useLanguage()
  // ── Balance ────────────────────────────────────────────────
  const [balance, setBalance] = useState<PartnersBalanceResponse | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)

  // ── Settlement suggestions ─────────────────────────────────
  const [suggestions, setSuggestions] = useState<SettlementSuggestionsResponse | null>(null)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)

  // ── Settlements list ──────────────────────────────────────
  const [settlements, setSettlements] = useState<PartnerSettlementResponse[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [settlementsLoading, setSettlementsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  // ── Modals ────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PartnerSettlementResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PartnerSettlementResponse | null>(null)
  const [historyPartnerId, setHistoryPartnerId] = useState<string | null>(null)
  const [historyPartnerName, setHistoryPartnerName] = useState<string>("")

  // ── Fetch balance ─────────────────────────────────────────
  const fetchBalance = useCallback(async () => {
    if (!enabled) return
    try {
      setBalanceLoading(true)
      const data = await settlementService.getPartnersBalance(projectId)
      setBalance(data)
    } catch (err) {
      toastApiError(err, t("partnerSettlements.errors.loadBalance"))
    } finally {
      setBalanceLoading(false)
    }
  }, [projectId, enabled, t])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  // ── Fetch settlement suggestions ──────────────────────────
  const fetchSuggestions = useCallback(async () => {
    if (!enabled) return
    try {
      setSuggestionsLoading(true)
      const data = await settlementService.getSettlementSuggestions(projectId)
      setSuggestions(data)
    } catch (err) {
      toastApiError(err, t("partnerSettlements.errors.loadSuggestions"))
    } finally {
      setSuggestionsLoading(false)
    }
  }, [projectId, enabled, t])

  // ── Fetch settlements ─────────────────────────────────────
  const fetchSettlements = useCallback(async () => {
    if (!enabled) return
    try {
      setSettlementsLoading(true)
      const data = await settlementService.getSettlements(projectId, { page, pageSize })
      setSettlements(data.items)
      setTotalCount(data.totalCount)
    } catch (err) {
      toastApiError(err, t("partnerSettlements.errors.load"))
    } finally {
      setSettlementsLoading(false)
    }
  }, [projectId, enabled, page, pageSize, t])

  useEffect(() => {
    fetchSettlements()
  }, [fetchSettlements])

  // ── CRUD ──────────────────────────────────────────────────
  const mutateCreate = useCallback(
    async (data: CreateSettlementRequest, options?: MutationOptions) => {
      try {
        await settlementService.createSettlement(projectId, data)
        toast.success(t("partnerSettlements.toast.created"))
        if (options?.refetch ?? true) {
          await Promise.all([fetchBalance(), fetchSettlements()])
        }
      } catch (err) {
        toastApiError(err, t("partnerSettlements.errors.create"))
      }
    },
    [projectId, fetchBalance, fetchSettlements, t],
  )

  const mutateUpdate = useCallback(
    async (settlementId: string, data: UpdateSettlementRequest, options?: MutationOptions) => {
      try {
        await settlementService.updateSettlement(projectId, settlementId, data)
        toast.success(t("partnerSettlements.toast.updated"))
        if (options?.refetch ?? true) {
          await Promise.all([fetchBalance(), fetchSettlements()])
        }
      } catch (err) {
        toastApiError(err, t("partnerSettlements.errors.update"))
      }
    },
    [projectId, fetchBalance, fetchSettlements, t],
  )

  const mutateDelete = useCallback(
    async (settlement: PartnerSettlementResponse, options?: MutationOptions) => {
      try {
        await settlementService.deleteSettlement(projectId, settlement.id)
        toast.success(t("partnerSettlements.toast.deleted"))
        if (options?.refetch ?? true) {
          await Promise.all([fetchBalance(), fetchSettlements()])
        }
      } catch (err) {
        toastApiError(err, t("partnerSettlements.errors.delete"))
      }
    },
    [projectId, fetchBalance, fetchSettlements, t],
  )

  // ── History panel ─────────────────────────────────────────
  const openHistory = useCallback((partner: PartnerBalanceItem) => {
    setHistoryPartnerId(partner.partnerId)
    setHistoryPartnerName(partner.partnerName)
  }, [])

  const closeHistory = useCallback(() => {
    setHistoryPartnerId(null)
    setHistoryPartnerName("")
  }, [])

  // ── Suggestions panel ──────────────────────────────────────
  const openSuggestions = useCallback(async () => {
    setSuggestionsOpen(true)
    await fetchSuggestions()
  }, [fetchSuggestions])

  const closeSuggestions = useCallback(() => {
    setSuggestionsOpen(false)
  }, [])

  return {
    balance,
    balanceLoading,
    refetchBalance: fetchBalance,
    suggestions,
    suggestionsLoading,
    suggestionsOpen,
    openSuggestions,
    closeSuggestions,
    settlements,
    totalCount,
    settlementsLoading,
    page,
    setPage,
    pageSize,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    historyPartnerId,
    historyPartnerName,
    openHistory,
    closeHistory,
    mutateCreate,
    mutateUpdate,
    mutateDelete,
    refetch: fetchSettlements,
  }
}
