"use client"

import { useState, useCallback, useEffect } from "react"
import { Loader2, ArrowUpRight, ArrowDownLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/date-utils"
import { toastApiError } from "@/lib/error-utils"
import * as settlementService from "@/services/partner-settlement-service"
import type {
  PartnerHistoryResponse,
  PartnerHistoryTransactionItem,
  PartnerHistorySettlementItem,
} from "@/types/partner-settlement"

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

interface PartnerHistoryModalProps {
  open: boolean
  projectId: string
  partnerId: string
  partnerName: string
  projectCurrency: string
  onClose: () => void
}

export function PartnerHistoryModal({
  open,
  projectId,
  partnerId,
  partnerName,
  projectCurrency,
  onClose,
}: PartnerHistoryModalProps) {
  const [history, setHistory] = useState<PartnerHistoryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 20

  const fetchHistory = useCallback(async () => {
    if (!open || !partnerId) return
    try {
      setLoading(true)
      const data = await settlementService.getPartnerHistory(projectId, partnerId, {
        page,
        pageSize,
      })
      setHistory(data)
    } catch (err) {
      toastApiError(err, "Error al cargar historial")
    } finally {
      setLoading(false)
    }
  }, [open, projectId, partnerId, page, pageSize])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Reset page when partner changes
  useEffect(() => {
    setPage(1)
    setHistory(null)
  }, [partnerId])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historial — {partnerName}</DialogTitle>
          <DialogDescription>
            Transacciones con splits y liquidaciones de este partner.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : !history ? null : (
          <div className="flex flex-col gap-5">
            {/* Settlements */}
            {history.settlements.length > 0 && (
              <section>
                <h3 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-2">
                  Liquidaciones
                </h3>
                <div className="flex flex-col gap-1.5">
                  {history.settlements.map((s) => (
                    <SettlementHistoryRow key={s.id} item={s} projectCurrency={projectCurrency} />
                  ))}
                </div>
              </section>
            )}

            {/* Transactions */}
            <section>
              <h3 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-2">
                Transacciones con splits
                {history.transactions.totalCount > 0 && (
                  <span className="ml-2 font-normal normal-case text-muted-foreground">
                    ({history.transactions.totalCount})
                  </span>
                )}
              </h3>

              {history.transactions.items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Sin transacciones con splits registradas.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {history.transactions.items.map((t) => (
                    <TransactionHistoryRow
                      key={t.transactionId}
                      item={t}
                      projectCurrency={projectCurrency}
                    />
                  ))}
                </div>
              )}

              {/* Pagination for transactions */}
              {history.transactions.totalPages > 1 && (
                <div className="flex items-center justify-between mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!history.transactions.hasPreviousPage}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="size-4" />
                    Anterior
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {page} / {history.transactions.totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!history.transactions.hasNextPage}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Siguiente
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Sub-rows ──────────────────────────────────────────────────────────────────

function SettlementHistoryRow({
  item,
  projectCurrency,
}: {
  item: PartnerHistorySettlementItem
  projectCurrency: string
}) {
  const isPaid = item.type === "settlement_paid"
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/50 bg-muted/30">
      {isPaid ? (
        <ArrowUpRight className="size-4 text-rose-500 shrink-0" />
      ) : (
        <ArrowDownLeft className="size-4 text-emerald-500 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {isPaid ? (
            <>
              <span>Pagó a</span>
              <span className="font-medium text-foreground">{item.toPartner ?? "—"}</span>
            </>
          ) : (
            <>
              <span>Recibió de</span>
              <span className="font-medium text-foreground">{item.fromPartner ?? "—"}</span>
            </>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">{formatDate(item.date)}</p>
      </div>
      <p className={`text-sm font-semibold tabular-nums shrink-0 ${isPaid ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
        {isPaid ? "−" : "+"}
        {formatAmount(item.amount, item.currency)}
      </p>
    </div>
  )
}

function TransactionHistoryRow({
  item,
  projectCurrency,
}: {
  item: PartnerHistoryTransactionItem
  projectCurrency: string
}) {
  const isExpense = item.type === "expense"
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-[10px] py-0 px-1.5 shrink-0 ${isExpense ? "text-rose-600 border-rose-500/40" : "text-emerald-600 border-emerald-500/40"}`}
          >
            {isExpense ? "Gasto" : "Ingreso"}
          </Badge>
          <p className="text-sm text-foreground truncate font-medium">{item.title}</p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[11px] text-muted-foreground">{formatDate(item.date)}</p>
          {item.payingPartner && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <p className="text-[11px] text-muted-foreground truncate">
                Paga: {item.payingPartner}
              </p>
            </>
          )}
        </div>
        {/* Currency exchanges */}
        {item.currencyExchanges.length > 0 && (
          <div className="flex flex-wrap gap-x-3 mt-0.5">
            {item.currencyExchanges.map((ce) => (
              <p key={ce.currencyCode} className="text-[11px] text-muted-foreground tabular-nums">
                ≈ {formatAmount(ce.convertedAmount, ce.currencyCode)}
              </p>
            ))}
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold tabular-nums text-foreground">
          {formatAmount(item.splitAmount, projectCurrency)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {item.splitType === "percentage"
            ? `${item.splitValue}%`
            : `Fijo ${formatAmount(item.splitValue, projectCurrency)}`}
        </p>
      </div>
    </div>
  )
}
