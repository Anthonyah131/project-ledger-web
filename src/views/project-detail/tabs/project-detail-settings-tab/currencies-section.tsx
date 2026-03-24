"use client"

import { Separator } from "@/components/ui/separator"
import { AlternativeCurrenciesPanel } from "@/components/project-detail/alternative-currencies/alternative-currencies-panel"
import { useLanguage } from "@/context/language-context"
import type { CurrencyResponse } from "@/types/currency"
import type { ProjectAlternativeCurrencyResponse } from "@/types/project-alternative-currency"

export function CurrenciesSection({
  projectCurrency,
  currencies,
  allCurrencies,
  loading,
  catalogLoading,
  canManage,
  hasExistingMovements,
  onAdd,
  onDelete,
}: {
  projectCurrency: string
  currencies: ProjectAlternativeCurrencyResponse[]
  allCurrencies: CurrencyResponse[]
  loading: boolean
  catalogLoading: boolean
  canManage: boolean
  hasExistingMovements?: boolean
  onAdd: (currencyCode: string) => Promise<void> | void
  onDelete: (currency: ProjectAlternativeCurrencyResponse) => Promise<void> | void
}) {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">{t("projects.settingsTab.currenciesTitle")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("projects.settingsTab.currenciesSubtitle")}
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
        hasExistingMovements={hasExistingMovements}
        onAdd={onAdd}
        onDelete={onDelete}
      />
    </div>
  )
}
