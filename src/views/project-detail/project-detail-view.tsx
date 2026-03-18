"use client"

// views/project-detail/project-detail-view.tsx
// Orchestrator for the project-detail page — header + resource tabs.

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

// ── Hook ─────────────────────────────────────────────
import { useProjectDetailView } from "@/hooks/projects/use-project-detail-view";

// ── Header ───────────────────────────────────────────
import { ProjectHeader } from "@/components/project-detail/project-header";
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal";

// ── Expenses ─────────────────────────────────────────
import { ProjectDetailExpensesTab } from "@/views/project-detail/tabs/project-detail-expenses-tab";

// ── Incomes ──────────────────────────────────────────
import { ProjectDetailIncomesTab } from "@/views/project-detail/tabs/project-detail-incomes-tab";

// ── Other tabs ───────────────────────────────────────
import { ProjectDetailObligationsTab } from "@/views/project-detail/tabs/project-detail-obligations-tab";
import { ProjectDetailCategoriesTab } from "@/views/project-detail/tabs/project-detail-categories-tab";
import { ProjectDetailBudgetTab } from "@/views/project-detail/tabs/project-detail-budget-tab";

// ── Settings tab ─────────────────────────────────────
import {
  ProjectDetailSettingsTab,
  type ProjectSettingsSection,
} from "@/views/project-detail/tabs/project-detail-settings-tab";

interface Props {
  projectId: string;
}

type CreateEntryMode = "manual" | "ai";

export function ProjectDetailView({ projectId }: Props) {
  const router = useRouter();
  const [expenseCreateMode, setExpenseCreateMode] = useState<CreateEntryMode>("manual");
  const [incomeCreateMode, setIncomeCreateMode] = useState<CreateEntryMode>("manual");
  const [activeTab, setActiveTab] = useState("expenses");
  const [settingsSection, setSettingsSection] =
    useState<ProjectSettingsSection>("general");

  const {
    detail,
    deleteProjectOpen,
    setDeleteProjectOpen,
    mutateProjectDeleteOpen,
    mutateProjectUpdate, mutateProjectDelete, mutateProjectSettingsUpdate,
    exp, inc, pac, cat, obl, bud, ppm, ppp,
    mutateExpenseCreate, mutateExpenseUpdate, mutateExpenseDelete,
    mutateExpenseActiveState,
    mutateIncomeCreate, mutateIncomeUpdate, mutateIncomeDelete,
    mutateIncomeActiveState,
    mutateAlternativeCurrencyAdd, mutateAlternativeCurrencyDelete,
    mutateCategoryCreate, mutateCategoryUpdate,
    mutateCategoryDelete,
    mutateObligationCreate, mutateObligationUpdate, mutateObligationDelete,
    mutateBudgetSet, mutateBudgetDelete,
  } = useProjectDetailView(projectId);

  const { setCreateOpen: setExpenseCreateOpen, setEditTarget: setExpenseEditTarget, setDeleteTarget: setExpenseDeleteTarget } = exp;
  const { setCreateOpen: setIncomeCreateOpen, setEditTarget: setIncomeEditTarget, setDeleteTarget: setIncomeDeleteTarget } = inc;
  const isOwner = detail.project?.userRole === "owner";
  const canManageBudget = detail.project?.userRole === "owner" || detail.project?.userRole === "editor";
  const canManageAlternativeCurrencies =
    detail.project?.userRole === "owner" || detail.project?.userRole === "editor";
  const canDeleteBudget = detail.project?.userRole === "owner";

  const alternativeCurrencyCodes = useMemo(
    () => pac.currencies.map((currency) => currency.currencyCode),
    [pac.currencies],
  );

  const linkedPartnerIds = useMemo(
    () => new Set(ppm.linkedPMs.map((pm) => pm.partner_id).filter((id): id is string => !!id)),
    [ppm.linkedPMs],
  );

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <ProjectHeader
        project={detail.project}
        loading={detail.loading}
        onEdit={() => {
          setActiveTab("settings");
          setSettingsSection("general");
        }}
        onDelete={mutateProjectDeleteOpen}
        onShare={
          isOwner
            ? () => router.push(`/projects/${projectId}/members`)
            : undefined
        }
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line">
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="incomes">Ingresos</TabsTrigger>
          <TabsTrigger value="obligations">Obligaciones</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="budget">Presupuesto</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <ProjectDetailExpensesTab
          projectId={projectId}
          exp={exp}
          categories={cat.categories}
          paymentMethods={ppm.paymentMethods}
          obligations={obl.obligations}
          projectCurrency={detail.project?.currencyCode ?? ""}
          alternativeCurrencyCodes={alternativeCurrencyCodes}
          createMode={expenseCreateMode}
          partnersEnabled={detail.project?.partnersEnabled ?? false}
          assignedPartners={ppp.assignedPartners}
          onCreateManual={() => {
            setExpenseCreateMode("manual")
            setExpenseCreateOpen(true)
          }}
          onCreateWithAi={() => {
            setExpenseCreateMode("ai")
            setExpenseCreateOpen(true)
          }}
          onCreateClose={() => {
            setExpenseCreateOpen(false)
            setExpenseCreateMode("manual")
          }}
          onEditSelect={setExpenseEditTarget}
          onEditClose={() => setExpenseEditTarget(null)}
          onDeleteSelect={setExpenseDeleteTarget}
          onDeleteClose={() => setExpenseDeleteTarget(null)}
          onCreate={mutateExpenseCreate}
          onSave={mutateExpenseUpdate}
          onDelete={mutateExpenseDelete}
          onToggleActive={mutateExpenseActiveState}
        />

        <ProjectDetailIncomesTab
          projectId={projectId}
          inc={inc}
          categories={cat.categories}
          paymentMethods={ppm.paymentMethods}
          availableCurrencies={pac.allCurrencies}
          projectCurrency={detail.project?.currencyCode ?? ""}
          alternativeCurrencyCodes={alternativeCurrencyCodes}
          createMode={incomeCreateMode}
          partnersEnabled={detail.project?.partnersEnabled ?? false}
          assignedPartners={ppp.assignedPartners}
          onCreateManual={() => {
            setIncomeCreateMode("manual")
            setIncomeCreateOpen(true)
          }}
          onCreateWithAi={() => {
            setIncomeCreateMode("ai")
            setIncomeCreateOpen(true)
          }}
          onCreateClose={() => {
            setIncomeCreateOpen(false)
            setIncomeCreateMode("manual")
          }}
          onEditSelect={setIncomeEditTarget}
          onEditClose={() => setIncomeEditTarget(null)}
          onDeleteSelect={setIncomeDeleteTarget}
          onDeleteClose={() => setIncomeDeleteTarget(null)}
          onCreate={mutateIncomeCreate}
          onSave={mutateIncomeUpdate}
          onDelete={mutateIncomeDelete}
          onToggleActive={mutateIncomeActiveState}
        />

        <ProjectDetailObligationsTab
          obl={obl}
          onCreateOpen={() => obl.setCreateOpen(true)}
          onCreateClose={() => obl.setCreateOpen(false)}
          onEditSelect={obl.setEditTarget}
          onEditClose={() => obl.setEditTarget(null)}
          onDeleteSelect={obl.setDeleteTarget}
          onDeleteClose={() => obl.setDeleteTarget(null)}
          onCreate={mutateObligationCreate}
          onSave={mutateObligationUpdate}
          onDelete={mutateObligationDelete}
        />

        <ProjectDetailCategoriesTab
          cat={cat}
          onCreateOpen={() => cat.setCreateOpen(true)}
          onCreateClose={() => cat.setCreateOpen(false)}
          onEditSelect={cat.setEditTarget}
          onEditClose={() => cat.setEditTarget(null)}
          onDeleteSelect={cat.setDeleteTarget}
          onDeleteClose={() => cat.setDeleteTarget(null)}
          onCreate={mutateCategoryCreate}
          onSave={mutateCategoryUpdate}
          onDelete={mutateCategoryDelete}
        />

        <ProjectDetailBudgetTab
          bud={bud}
          projectCurrency={detail.project?.currencyCode ?? ""}
          canManage={!!canManageBudget}
          canDelete={!!canDeleteBudget}
          onUpsertOpen={() => bud.setUpsertOpen(true)}
          onUpsertClose={() => bud.setUpsertOpen(false)}
          onDeleteSelect={bud.setDeleteTarget}
          onDeleteClose={() => bud.setDeleteTarget(null)}
          onSave={mutateBudgetSet}
          onDelete={mutateBudgetDelete}
        />

        <ProjectDetailSettingsTab
          activeSection={settingsSection}
          onSectionChange={setSettingsSection}
          // General
          project={detail.project ?? null}
          isOwner={!!isOwner}
          onSaveProject={mutateProjectUpdate}
          // Currencies
          projectCurrency={detail.project?.currencyCode ?? ""}
          currencies={pac.currencies}
          allCurrencies={pac.allCurrencies}
          currenciesLoading={pac.loading}
          currenciesCatalogLoading={pac.catalogLoading}
          canManageCurrencies={!!canManageAlternativeCurrencies}
          onAddCurrency={(currencyCode) => mutateAlternativeCurrencyAdd({ currencyCode })}
          onDeleteCurrency={(c) => { mutateAlternativeCurrencyDelete(c) }}
          // Partners
          ppp={ppp}
          partnersEnabled={detail.project?.partnersEnabled ?? false}
          linkedPartnerIds={linkedPartnerIds}
          onTogglePartners={(enabled) => mutateProjectSettingsUpdate({ partnersEnabled: enabled })}
          onAssignOpen={ppp.openAssignDialog}
          onAssignClose={() => ppp.setAssignOpen(false)}
          onRemoveSelectPartner={ppp.setRemoveTarget}
          onRemoveClosePartner={() => ppp.setRemoveTarget(null)}
          onAssign={ppp.handleAssign}
          onRemovePartner={(pp) => { ppp.handleRemove(pp) }}
          // Payment methods
          ppm={{
            loading: ppm.loading,
            linkedPMs: ppm.linkedPMs,
            linkableItems: ppm.linkableItems,
            linkableLoading: ppm.linkableLoading,
            addOpen: ppm.addOpen,
            removeTarget: ppm.removeTarget,
          }}
          onAddOpen={ppm.openAddDialog}
          onAddClose={() => ppm.setAddOpen(false)}
          onLink={ppm.handleLink}
          onRemoveSelectPM={ppm.setRemoveTarget}
          onRemoveClosePM={() => ppm.setRemoveTarget(null)}
          onUnlink={ppm.handleUnlink}
        />
      </Tabs>

      {/* ─── Project-level modals ─── */}
      {detail.project && (
        <DeleteEntityModal
          item={detail.project}
          open={deleteProjectOpen}
          onClose={() => setDeleteProjectOpen(false)}
          onConfirm={mutateProjectDelete}
          title="Eliminar proyecto"
          description="Esta accion puede desactivarlo, no eliminarlo definitivamente."
          getMessage={(p) => `¿Eliminar proyecto "${p.name}"?`}
        />
      )}
    </div>
  );
}
