"use client"

import { TabsContent } from "@/components/ui/tabs"
import { AlternativeCurrenciesPanel } from "@/components/project-detail/alternative-currencies/alternative-currencies-panel"
import type { CurrencyResponse } from "@/types/currency"
import type { ProjectAlternativeCurrencyResponse } from "@/types/project-alternative-currency"

interface ProjectDetailAlternativeCurrenciesTabProps {
  projectCurrency: string
  currencies: ProjectAlternativeCurrencyResponse[]
  allCurrencies: CurrencyResponse[]
  loading: boolean
  catalogLoading: boolean
  canManage: boolean
  onAdd: (currencyCode: string) => Promise<void> | void
  onDelete: (currency: ProjectAlternativeCurrencyResponse) => Promise<void> | void
}

export function ProjectDetailAlternativeCurrenciesTab({
  projectCurrency,
  currencies,
  allCurrencies,
  loading,
  catalogLoading,
  canManage,
  onAdd,
  onDelete,
}: ProjectDetailAlternativeCurrenciesTabProps) {
  return (
    <TabsContent value="alternative-currencies" className="flex flex-col gap-4">
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
    </TabsContent>
  )
}
