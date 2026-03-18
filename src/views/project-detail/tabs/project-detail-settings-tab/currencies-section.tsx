"use client"

import { Separator } from "@/components/ui/separator"
import { AlternativeCurrenciesPanel } from "@/components/project-detail/alternative-currencies/alternative-currencies-panel"
import type { CurrencyResponse } from "@/types/currency"
import type { ProjectAlternativeCurrencyResponse } from "@/types/project-alternative-currency"

export function CurrenciesSection({
  projectCurrency,
  currencies,
  allCurrencies,
  loading,
  catalogLoading,
  canManage,
  onAdd,
  onDelete,
}: {
  projectCurrency: string
  currencies: ProjectAlternativeCurrencyResponse[]
  allCurrencies: CurrencyResponse[]
  loading: boolean
  catalogLoading: boolean
  canManage: boolean
  onAdd: (currencyCode: string) => Promise<void> | void
  onDelete: (currency: ProjectAlternativeCurrencyResponse) => Promise<void> | void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">Monedas alternativas</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona las monedas en las que se registran equivalencias para este
          proyecto.
        </p>
      </div>

      <Separator />

      <AlternativeCurrenciesPanel
        projectCurrency={projectCurrency}
        currencies={currencies}
        allCurrencies={allCurrencies}
        loading={loading}
        catalogLoading={catalogLoading}
        canManage={canManage}
        onAdd={onAdd}
        onDelete={onDelete}
      />
    </div>
  )
}
