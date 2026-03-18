"use client"

import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatCurrencyAmount } from "@/lib/format-utils"
import type { SettlementSuggestionsResponse, SettlementSuggestion } from "@/types/partner-settlement"

interface SettlementSuggestionsModalProps {
  open: boolean
  suggestions: SettlementSuggestionsResponse | null
  loading: boolean
  onClose: () => void
  /** Pre-fills the create settlement form with this suggestion */
  onUseSuggestion: (suggestion: SettlementSuggestion) => void
}

export function SettlementSuggestionsModal({
  open,
  suggestions,
  loading,
  onClose,
  onUseSuggestion,
}: SettlementSuggestionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Cómo liquidar?</DialogTitle>
          <DialogDescription>
            Transferencias mínimas para llevar todos los balances a cero.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : !suggestions ? null : suggestions.suggestions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="size-8 text-emerald-500" />
            <p className="text-sm font-medium text-foreground">Todos los balances están saldados</p>
            <p className="text-xs text-muted-foreground">No hay transferencias pendientes.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">{suggestions.note}</p>
            {suggestions.suggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border p-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <span className="truncate">{s.fromPartnerName}</span>
                    <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{s.toPartnerName}</span>
                  </div>
                  <p className="text-base font-bold tabular-nums text-violet-600 dark:text-violet-400 mt-0.5">
                    {formatCurrencyAmount(s.amount, s.currency)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onUseSuggestion(s)
                    onClose()
                  }}
                >
                  Usar
                </Button>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
