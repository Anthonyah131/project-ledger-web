"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2, Coins, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CurrencyResponse } from "@/types/currency"
import type { ProjectAlternativeCurrencyResponse } from "@/types/project-alternative-currency"

interface AlternativeCurrenciesPanelProps {
  projectCurrency: string
  currencies: ProjectAlternativeCurrencyResponse[]
  allCurrencies: CurrencyResponse[]
  loading: boolean
  catalogLoading: boolean
  canManage: boolean
  onAdd: (currencyCode: string) => Promise<void> | void
  onDelete: (currency: ProjectAlternativeCurrencyResponse) => Promise<void> | void
}

export function AlternativeCurrenciesPanel({
  projectCurrency,
  currencies,
  allCurrencies,
  loading,
  catalogLoading,
  canManage,
  onAdd,
  onDelete,
}: AlternativeCurrenciesPanelProps) {
  const [selectedCode, setSelectedCode] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const usedCodes = useMemo(() => new Set(currencies.map((c) => c.currencyCode)), [currencies])

  const availableCodes = useMemo(
    () => allCurrencies
      .filter((c) => c.code !== projectCurrency)
      .filter((c) => !usedCodes.has(c.code)),
    [allCurrencies, projectCurrency, usedCodes]
  )

  async function handleAdd() {
    if (!selectedCode) return
    setSubmitting(true)
    try {
      await onAdd(selectedCode)
      setSelectedCode("")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(currency: ProjectAlternativeCurrencyResponse) {
    setDeletingId(currency.id)
    try {
      await onDelete(currency)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-fuchsia-500/20 bg-card p-4 bg-gradient-to-r from-fuchsia-500/8 via-purple-500/5 to-transparent shadow-sm shadow-fuchsia-500/5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-bold text-foreground">Monedas alternativas del proyecto</p>
            <p className="text-xs text-muted-foreground mt-1">
              Moneda base del proyecto:{" "}
              <span className="font-semibold text-fuchsia-600 dark:text-fuchsia-400">{projectCurrency}</span>
            </p>
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              <Select value={selectedCode} onValueChange={setSelectedCode}>
                <SelectTrigger className="w-56 h-8 text-sm border-fuchsia-500/30" aria-label="Seleccionar moneda alternativa">
                  <SelectValue placeholder={catalogLoading ? "Cargando..." : "Agregar moneda"} />
                </SelectTrigger>
                <SelectContent>
                  {availableCodes.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!selectedCode || submitting || catalogLoading}
                className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:from-fuchsia-700 hover:to-purple-700 border-0 shadow-sm shadow-fuchsia-500/30"
              >
                {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                Agregar
              </Button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border bg-muted/20 p-8 flex items-center justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : currencies.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-5 py-8 text-center">
          <Coins className="size-6 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No hay monedas alternativas configuradas.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-fuchsia-500/20 overflow-hidden shadow-sm">
          <div className="flex items-center px-5 py-2.5 text-[11px] font-bold text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-widest border-b border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-500/10 via-purple-500/5 to-transparent">
            <span className="flex-1">Moneda</span>
            <span className="w-28 text-right hidden sm:block">Simbolo</span>
            {canManage && <span className="w-8" />}
          </div>

          {currencies.map((currency) => (
            <div
              key={currency.id}
              className="flex items-center px-5 py-3.5 border-b border-border/50 last:border-b-0 hover:bg-fuchsia-500/5 transition-colors"
            >
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-bold text-foreground">
                  {currency.currencyCode}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {currency.currencyName}
                </p>
              </div>

              <span className="w-28 text-right hidden sm:block">
                <Badge variant="secondary" className="text-xs bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-500/30">{currency.currencySymbol}</Badge>
              </span>

              {canManage && (
                <div className="w-8 flex justify-end">
                  <button
                    onClick={() => handleDelete(currency)}
                    disabled={deletingId === currency.id}
                    className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label={`Eliminar ${currency.currencyCode}`}
                  >
                    {deletingId === currency.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
