"use client"

import { useMemo, useState } from "react"
import { CreditCard, Globe, Pencil, Users, Plus, X } from "lucide-react"
import { TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { AlternativeCurrenciesPanel } from "@/components/project-detail/alternative-currencies/alternative-currencies-panel"
import {
  AssignPartnerModal,
  ProjectPartnersList,
} from "@/components/project-detail/partners/project-partners"
import {
  ProjectPartnersEmptyState,
  ProjectPartnersSkeleton,
} from "@/components/project-detail/partners/project-partner-states"
import { useUpdateProjectForm } from "@/hooks/forms/use-project-form"
import { PAYMENT_METHOD_TYPE_LABEL } from "@/lib/constants"
import type { ProjectResponse, UpdateProjectRequest } from "@/types/project"
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

const SECTIONS = [
  { key: "general" as ProjectSettingsSection, title: "General", icon: Pencil },
  { key: "currencies" as ProjectSettingsSection, title: "Monedas", icon: Globe },
  { key: "partners" as ProjectSettingsSection, title: "Partners", icon: Users },
  {
    key: "payment-methods" as ProjectSettingsSection,
    title: "Métodos de pago",
    icon: CreditCard,
  },
] as const

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
  onAddCurrency: (currencyCode: string) => Promise<void> | void
  onDeleteCurrency: (
    currency: ProjectAlternativeCurrencyResponse,
  ) => Promise<void | boolean> | void
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

// ── General section ───────────────────────────────────────────────────────────

function GeneralSection({
  project,
  isOwner,
  onSave,
}: {
  project: ProjectResponse | null
  isOwner: boolean
  onSave: (id: string, data: UpdateProjectRequest) => void
}) {
  const { form, onSubmit } = useUpdateProjectForm({
    project,
    onSave,
    onClose: () => {},
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">Información del proyecto</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Actualiza el nombre y la descripción del proyecto.
        </p>
      </div>

      <Separator />

      {!project ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del proyecto</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={!isOwner}
                      className={!isOwner ? "bg-muted/40" : undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      className={cn("resize-none", !isOwner && "bg-muted/40")}
                      readOnly={!isOwner}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isOwner && (
              <Button type="submit" size="sm">
                Guardar cambios
              </Button>
            )}
          </form>
        </Form>
      )}
    </div>
  )
}

// ── Currencies section ────────────────────────────────────────────────────────

function CurrenciesSection({
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

// ── Partners section ──────────────────────────────────────────────────────────

function PartnersSection({
  ppp,
  isOwner,
  partnersEnabled,
  linkedPartnerIds,
  onTogglePartners,
  onAssignOpen,
  onAssignClose,
  onRemoveSelect,
  onRemoveClose,
  onAssign,
  onRemove,
}: {
  ppp: PartnersState
  isOwner: boolean
  partnersEnabled: boolean
  linkedPartnerIds?: Set<string>
  onTogglePartners: (enabled: boolean) => Promise<boolean | void>
  onAssignOpen: () => void
  onAssignClose: () => void
  onRemoveSelect: (pp: ProjectPartnerResponse) => void
  onRemoveClose: () => void
  onAssign: (partnerId: string) => Promise<void>
  onRemove: (pp: ProjectPartnerResponse) => Promise<boolean> | void
}) {
  const assignLimitReached = !partnersEnabled && ppp.assignedPartners.length >= 1

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">Partners del proyecto</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Asigna partners y controla la distribución de gastos e ingresos.
        </p>
      </div>

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {isOwner ? (
          <div className="flex items-center gap-2">
            <Switch
              id="partners-enabled-settings"
              checked={partnersEnabled}
              onCheckedChange={onTogglePartners}
            />
            <Label
              htmlFor="partners-enabled-settings"
              className="cursor-pointer select-none text-sm"
            >
              Splits por partners
            </Label>
          </div>
        ) : (
          <div />
        )}

        {isOwner && (
          <div className="flex items-center gap-3">
            {assignLimitReached && (
              <p className="text-xs text-muted-foreground">
                Activa splits para asignar más de un partner.
              </p>
            )}
            <Button onClick={onAssignOpen} size="sm" disabled={assignLimitReached}>
              <Plus className="size-3.5" />
              Asignar partner
            </Button>
          </div>
        )}
      </div>

      {ppp.loading ? (
        <ProjectPartnersSkeleton />
      ) : ppp.assignedPartners.length === 0 ? (
        <ProjectPartnersEmptyState isOwner={isOwner} onAssign={onAssignOpen} />
      ) : (
        <ProjectPartnersList
          partners={ppp.assignedPartners}
          isOwner={isOwner}
          linkedPartnerIds={linkedPartnerIds}
          onRemove={onRemoveSelect}
        />
      )}

      <AssignPartnerModal
        open={ppp.assignOpen}
        onClose={onAssignClose}
        availablePartners={ppp.availablePartners}
        assignedPartners={ppp.assignedPartners}
        loading={ppp.availableLoading}
        partnersEnabled={partnersEnabled}
        onAssign={onAssign}
      />

      <DeleteEntityModal
        item={ppp.removeTarget}
        open={!!ppp.removeTarget}
        onClose={onRemoveClose}
        onConfirm={onRemove}
        title="Quitar partner del proyecto"
        description="Sus cuentas ya no estarán disponibles para nuevos gastos e ingresos en este proyecto."
        getMessage={(pp) => `¿Quitar el partner "${pp.partnerName}" del proyecto?`}
      />
    </div>
  )
}

// ── Payment methods section ───────────────────────────────────────────────────

function PMSkeleton() {
  return (
    <div className="divide-y divide-border rounded-md border border-border">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-10" />
          <Skeleton className="size-7 rounded" />
        </div>
      ))}
    </div>
  )
}

function PMEmptyState({
  isOwner,
  onAdd,
}: {
  isOwner: boolean
  onAdd: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border py-16 px-4 text-center">
      <CreditCard className="size-10 text-muted-foreground/40" />
      <p className="text-sm font-medium">Sin métodos de pago vinculados</p>
      {isOwner ? (
        <>
          <p className="max-w-xs text-xs text-muted-foreground">
            Vincula métodos de pago para usarlos en gastos e ingresos del
            proyecto.
          </p>
          <Button size="sm" variant="outline" onClick={onAdd}>
            <Plus className="size-3.5" />
            Agregar método de pago
          </Button>
        </>
      ) : (
        <p className="max-w-xs text-xs text-muted-foreground">
          No hay métodos de pago vinculados a este proyecto.
        </p>
      )}
    </div>
  )
}

function PMList({
  linkedPMs,
  isOwner,
  onRemove,
}: {
  linkedPMs: ProjectPaymentMethodItem[]
  isOwner: boolean
  onRemove: (pm: ProjectPaymentMethodItem) => void
}) {
  return (
    <div className="divide-y divide-border rounded-md border border-border">
      {linkedPMs.map((pm) => (
        <div
          key={pm.id}
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/20"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{pm.paymentMethodName}</p>
            {(pm.bankName || pm.partnerName) && (
              <p className="truncate text-xs text-muted-foreground">
                {[pm.bankName, pm.partnerName].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              {PAYMENT_METHOD_TYPE_LABEL[pm.type]}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {pm.currency}
            </Badge>
          </div>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(pm)}
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

function AddPMDialog({
  open,
  onClose,
  linkableItems,
  loading,
  onLink,
}: {
  open: boolean
  onClose: () => void
  linkableItems: LinkablePaymentMethodItem[]
  loading: boolean
  onLink: (pmId: string, pmName: string) => Promise<void>
}) {
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function handleLinkClick(pmId: string, pmName: string) {
    setPendingId(pmId)
    try {
      await onLink(pmId, pmName)
    } finally {
      setPendingId(null)
    }
  }

  const groupEntries = useMemo(() => {
    const groups = linkableItems.reduce<
      Record<string, { partnerName: string; items: LinkablePaymentMethodItem[] }>
    >((acc, pm) => {
      if (!acc[pm.partnerId]) {
        acc[pm.partnerId] = { partnerName: pm.partnerName, items: [] }
      }
      acc[pm.partnerId].items.push(pm)
      return acc
    }, {})
    return Object.entries(groups)
  }, [linkableItems])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[80vh] max-w-md flex-col">
        <DialogHeader>
          <DialogTitle>Agregar método de pago</DialogTitle>
          <DialogDescription>
            Métodos de pago de partners asignados al proyecto que aún no están
            vinculados.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-6 flex-1 overflow-y-auto px-6">
          {loading ? (
            <div className="flex flex-col gap-3 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-7 w-20" />
                </div>
              ))}
            </div>
          ) : groupEntries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CreditCard className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No hay métodos de pago disponibles para vincular.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              {groupEntries.map(([partnerId, group]) => (
                <div key={partnerId}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.partnerName}
                  </p>
                  <div className="flex flex-col gap-1">
                    {group.items.map((pm) => (
                      <div key={pm.id} className="flex items-center gap-2 py-1.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{pm.name}</p>
                          {pm.bankName && (
                            <p className="truncate text-xs text-muted-foreground">
                              {pm.bankName}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px]">
                            {PAYMENT_METHOD_TYPE_LABEL[pm.type]}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {pm.currency}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 shrink-0 text-xs"
                          disabled={pendingId === pm.id}
                          onClick={() => handleLinkClick(pm.id, pm.name)}
                        >
                          {pendingId === pm.id ? "..." : "Agregar"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PaymentMethodsSection({
  ppm,
  isOwner,
  onAddOpen,
  onAddClose,
  onLink,
  onRemoveSelect,
  onRemoveClose,
  onUnlink,
}: {
  ppm: PaymentMethodsState
  isOwner: boolean
  onAddOpen: () => void
  onAddClose: () => void
  onLink: (pmId: string, pmName: string) => Promise<void>
  onRemoveSelect: (pm: ProjectPaymentMethodItem) => void
  onRemoveClose: () => void
  onUnlink: (pm: ProjectPaymentMethodItem) => Promise<boolean> | void
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Métodos de pago</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Vincula métodos de pago de partners para usarlos en gastos e
            ingresos.
          </p>
        </div>
        {isOwner && (
          <Button onClick={onAddOpen} size="sm">
            <Plus className="size-3.5" />
            Agregar
          </Button>
        )}
      </div>

      <Separator />

      {ppm.loading ? (
        <PMSkeleton />
      ) : ppm.linkedPMs.length === 0 ? (
        <PMEmptyState isOwner={isOwner} onAdd={onAddOpen} />
      ) : (
        <PMList
          linkedPMs={ppm.linkedPMs}
          isOwner={isOwner}
          onRemove={onRemoveSelect}
        />
      )}

      <AddPMDialog
        open={ppm.addOpen}
        onClose={onAddClose}
        linkableItems={ppm.linkableItems}
        loading={ppm.linkableLoading}
        onLink={onLink}
      />

      <DeleteEntityModal
        item={ppm.removeTarget}
        open={!!ppm.removeTarget}
        onClose={onRemoveClose}
        onConfirm={onUnlink}
        title="Quitar método de pago"
        description="El método de pago ya no estará disponible en este proyecto para nuevos gastos e ingresos."
        getMessage={(pm) => `¿Quitar "${pm.paymentMethodName}" del proyecto?`}
      />
    </div>
  )
}

// ── Main settings tab ─────────────────────────────────────────────────────────

export function ProjectDetailSettingsTab({
  activeSection,
  onSectionChange,
  project,
  isOwner,
  onSaveProject,
  projectCurrency,
  currencies,
  allCurrencies,
  currenciesLoading,
  currenciesCatalogLoading,
  canManageCurrencies,
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
  return (
    <TabsContent value="settings" className="mt-0">
      <div className="flex flex-col gap-6 pt-4 md:flex-row md:gap-8">
        {/* Sidebar nav */}
        <aside className="shrink-0 md:w-52">
          <nav
            className="flex flex-row gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0"
            aria-label="Secciones de configuración del proyecto"
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
