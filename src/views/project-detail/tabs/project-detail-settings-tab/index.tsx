"use client"

import { CreditCard, Globe, Pencil, Users } from "lucide-react"
import { TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { GeneralSection } from "./general-section"
import { CurrenciesSection } from "./currencies-section"
import { PartnersSection } from "./partners-section"
import { PaymentMethodsSection } from "./payment-methods-section"
import type { ProjectResponse, UpdateProjectRequest } from "@/types/project"
import { useLanguage } from "@/context/language-context"
import type { CurrencyResponse } from "@/types/currency"
import type { ProjectAlternativeCurrencyResponse } from "@/types/project-alternative-currency"
import type { ProjectPartnerResponse } from "@/types/project-partner"
import type { PartnerResponse } from "@/types/partner"
import type {
  ProjectPaymentMethodItem,
  LinkablePaymentMethodItem,
} from "@/types/project-partner"

// ── Section type ──────────────────────────────────────────────────────────────

export type ProjectSettingsSection =
  | "general"
  | "currencies"
  | "partners"
  | "payment-methods"


// ── Prop interfaces ───────────────────────────────────────────────────────────

interface PartnersState {
  loading: boolean
  assignedPartners: ProjectPartnerResponse[]
  assignOpen: boolean
  availablePartners: PartnerResponse[]
  availableLoading: boolean
  removeTarget: ProjectPartnerResponse | null
}

interface PaymentMethodsState {
  loading: boolean
  linkedPMs: ProjectPaymentMethodItem[]
  linkableItems: LinkablePaymentMethodItem[]
  linkableLoading: boolean
  addOpen: boolean
  removeTarget: ProjectPaymentMethodItem | null
}

export interface ProjectDetailSettingsTabProps {
  // Navigation (controlled from parent)
  activeSection: ProjectSettingsSection
  onSectionChange: (section: ProjectSettingsSection) => void
  // Plan permission gates
  canUseMultiCurrency?: boolean
  canUsePartners?: boolean
  // General
  project: ProjectResponse | null
  isOwner: boolean
  onSaveProject: (id: string, data: UpdateProjectRequest) => void
  // Currencies
  projectCurrency: string
  currencies: ProjectAlternativeCurrencyResponse[]
  allCurrencies: CurrencyResponse[]
  currenciesLoading: boolean
  currenciesCatalogLoading: boolean
  canManageCurrencies: boolean
  hasExistingMovements?: boolean
  onAddCurrency: (currencyCode: string) => Promise<void> | void
  onDeleteCurrency: (currency: ProjectAlternativeCurrencyResponse) => Promise<void> | void
  // Partners
  ppp: PartnersState
  partnersEnabled: boolean
  linkedPartnerIds?: Set<string>
  onTogglePartners: (enabled: boolean) => Promise<boolean | void>
  onAssignOpen: () => void
  onAssignClose: () => void
  onRemoveSelectPartner: (pp: ProjectPartnerResponse) => void
  onRemoveClosePartner: () => void
  onAssign: (partnerId: string) => Promise<void>
  onRemovePartner: (pp: ProjectPartnerResponse) => Promise<boolean> | void
  // Payment methods
  ppm: PaymentMethodsState
  onAddOpen: () => void
  onAddClose: () => void
  onLink: (pmId: string, pmName: string) => Promise<void>
  onRemoveSelectPM: (pm: ProjectPaymentMethodItem) => void
  onRemoveClosePM: () => void
  onUnlink: (pm: ProjectPaymentMethodItem) => Promise<boolean> | void
}

// ── Main settings tab ─────────────────────────────────────────────────────────

export function ProjectDetailSettingsTab({
  activeSection,
  onSectionChange,
  canUseMultiCurrency = true,
  canUsePartners = true,
  project,
  isOwner,
  onSaveProject,
  projectCurrency,
  currencies,
  allCurrencies,
  currenciesLoading,
  currenciesCatalogLoading,
  canManageCurrencies,
  hasExistingMovements,
  onAddCurrency,
  onDeleteCurrency,
  ppp,
  partnersEnabled,
  linkedPartnerIds,
  onTogglePartners,
  onAssignOpen,
  onAssignClose,
  onRemoveSelectPartner,
  onRemoveClosePartner,
  onAssign,
  onRemovePartner,
  ppm,
  onAddOpen,
  onAddClose,
  onLink,
  onRemoveSelectPM,
  onRemoveClosePM,
  onUnlink,
}: ProjectDetailSettingsTabProps) {
  const { t } = useLanguage()

  const SECTIONS = [
    { key: "general" as ProjectSettingsSection, title: t("projects.settingsTab.general"), icon: Pencil },
    ...(canUseMultiCurrency
      ? [{ key: "currencies" as ProjectSettingsSection, title: t("projects.settingsTab.currencies"), icon: Globe }]
      : []),
    ...(canUsePartners
      ? [{ key: "partners" as ProjectSettingsSection, title: t("projects.settingsTab.partners"), icon: Users }]
      : []),
    { key: "payment-methods" as ProjectSettingsSection, title: t("projects.settingsTab.paymentMethods"), icon: CreditCard },
  ]

  return (
    <TabsContent value="settings" className="mt-0">
      <div className="flex flex-col gap-6 pt-4 md:flex-row md:gap-8">
        {/* Sidebar nav */}
        <aside className="shrink-0 bg-card md:w-52 p-2 rounded-md">
          <nav
            className="flex flex-row gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0"
            aria-label={t("projects.settingsTab.sectionLabel")}
          >
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.key
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => onSectionChange(section.key)}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    "whitespace-nowrap text-left",
                    isActive
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1 hidden h-[calc(100%-8px)] w-0.5 rounded-full bg-primary md:block" />
                  )}
                  <section.icon className="size-4 shrink-0" />
                  {section.title}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {activeSection === "general" && (
            <GeneralSection
              project={project}
              isOwner={isOwner}
              onSave={onSaveProject}
            />
          )}
          {activeSection === "currencies" && (
            <CurrenciesSection
              projectCurrency={projectCurrency}
              currencies={currencies}
              allCurrencies={allCurrencies}
              loading={currenciesLoading}
              catalogLoading={currenciesCatalogLoading}
              canManage={canManageCurrencies}
              hasExistingMovements={hasExistingMovements}
              onAdd={onAddCurrency}
              onDelete={onDeleteCurrency}
            />
          )}
          {activeSection === "partners" && (
            <PartnersSection
              ppp={ppp}
              isOwner={isOwner}
              partnersEnabled={partnersEnabled}
              linkedPartnerIds={linkedPartnerIds}
              onTogglePartners={onTogglePartners}
              onAssignOpen={onAssignOpen}
              onAssignClose={onAssignClose}
              onRemoveSelect={onRemoveSelectPartner}
              onRemoveClose={onRemoveClosePartner}
              onAssign={onAssign}
              onRemove={onRemovePartner}
            />
          )}
          {activeSection === "payment-methods" && (
            <PaymentMethodsSection
              ppm={ppm}
              isOwner={isOwner}
              onAddOpen={onAddOpen}
              onAddClose={onAddClose}
              onLink={onLink}
              onRemoveSelect={onRemoveSelectPM}
              onRemoveClose={onRemoveClosePM}
              onUnlink={onUnlink}
            />
          )}
        </div>
      </div>
    </TabsContent>
  )
}
