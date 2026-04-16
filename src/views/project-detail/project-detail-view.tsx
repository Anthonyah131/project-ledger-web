"use client"

// views/project-detail/project-detail-view.tsx
// Orchestrator for the project-detail page — header + resource tabs.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";

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

// ── Partners tab ─────────────────────────────────────
import { ProjectDetailPartnersTab } from "@/views/project-detail/tabs/project-detail-partners-tab";

// ── Settings tab ─────────────────────────────────────
import {
  ProjectDetailSettingsTab,
  type ProjectSettingsSection,
} from "@/views/project-detail/tabs/project-detail-settings-tab";
import { useLanguage } from "@/context/language-context";
import { useOnboardingContext } from "@/context/onboarding-context";
import { useAuth } from "@/context/auth-context";

interface Props {
  projectId: string;
}

type CreateEntryMode = "manual" | "ai";

export function ProjectDetailView({ projectId }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const { refreshProgress } = useOnboardingContext();
  const { permissions } = useAuth();
  const searchParams = useSearchParams();
  const [expenseCreateMode, setExpenseCreateMode] = useState<CreateEntryMode>("manual");
  const [incomeCreateMode, setIncomeCreateMode] = useState<CreateEntryMode>("manual");

  // Honour ?tab=<name> from deep-links (e.g. dashboard budget widget)
  const VALID_TABS = ["expenses", "incomes", "obligations", "categories", "budget", "partners", "settings"];
  const tabParam = searchParams.get("tab") ?? "";
  const initialTab = VALID_TABS.includes(tabParam) ? tabParam : "expenses";
  const [activeTab, setActiveTab] = useState(initialTab);

  const VALID_SECTIONS: ProjectSettingsSection[] = ["general", "currencies", "partners", "payment-methods"];
  const sectionParam = searchParams.get("section") ?? "";
  const initialSection: ProjectSettingsSection = VALID_SECTIONS.includes(sectionParam as ProjectSettingsSection)
    ? (sectionParam as ProjectSettingsSection)
    : "general";
  const [settingsSection, setSettingsSection] =
    useState<ProjectSettingsSection>(initialSection);

  // Sync activeTab + settingsSection when searchParams change (soft navigation)
  useEffect(() => {
    const tp = searchParams.get("tab") ?? "";
    if (VALID_TABS.includes(tp)) setActiveTab(tp);
    const sp = searchParams.get("section") ?? "";
    if (VALID_SECTIONS.includes(sp as ProjectSettingsSection)) {
      setSettingsSection(sp as ProjectSettingsSection);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const {
    detail,
    deleteProjectOpen,
    setDeleteProjectOpen,
    mutateProjectDeleteOpen,
    mutateProjectUpdate, mutateProjectDelete, mutateProjectSettingsUpdate,
    exp, inc, pac, cat, obl, bud, ppm, ppp, sel,
    mutateExpenseCreate, mutateExpenseBulkCreate, mutateExpenseUpdate, mutateExpenseDelete,
    mutateExpenseActiveState,
    mutateIncomeCreate, mutateIncomeBulkCreate, mutateIncomeUpdate, mutateIncomeDelete,
    mutateIncomeActiveState,
    mutateAlternativeCurrencyAdd, mutateAlternativeCurrencyDelete,
    mutateCategoryCreate, mutateCategoryUpdate,
    mutateCategoryDelete,
    mutateObligationCreate, mutateObligationUpdate, mutateObligationDelete,
    mutateBudgetSet, mutateBudgetDelete,
    mutateSettlementCreate, mutateSettlementUpdate, mutateSettlementDelete,
  } = useProjectDetailView(projectId);

  // Auto-open the right modal when navigated from onboarding checklist
  const onboardingAutoOpened = useRef(false);
  useEffect(() => {
    if (searchParams.get("onboarding") !== "1") return;
    if (onboardingAutoOpened.current) return;
    if (activeTab === "settings" && settingsSection === "partners") {
      onboardingAutoOpened.current = true;
      ppp.openAssignDialog();
    } else if (activeTab === "settings" && settingsSection === "payment-methods") {
      onboardingAutoOpened.current = true;
      ppm.openAddDialog();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, settingsSection, ppp, ppm]);

  const { setCreateOpen: setExpenseCreateOpen, setEditTarget: setExpenseEditTarget, setDeleteTarget: setExpenseDeleteTarget, setDuplicateSource: setExpenseDuplicateSource } = exp;
  const { setCreateOpen: setIncomeCreateOpen, setEditTarget: setIncomeEditTarget, setDeleteTarget: setIncomeDeleteTarget, setDuplicateSource: setIncomeDuplicateSource } = inc;
  const isOwner = detail.project?.userRole === "owner";
  const isEditor = detail.project?.userRole === "editor";
  const canManageBudget = (isOwner || isEditor) && permissions?.canSetBudgets !== false;
  const canDeleteBudget = isOwner && permissions?.canSetBudgets !== false;
  const canManageAlternativeCurrencies = (isOwner || isEditor) && permissions?.canUseMultiCurrency !== false;
  const partnersEnabled = detail.project?.partnersEnabled ?? false;
  const canUsePartners = permissions?.canUsePartners !== false;
  const canEditSettlements = isOwner || isEditor;
  const canUseOcr = permissions?.canUseOcr !== false;

  const alternativeCurrencyCodes = useMemo(
    () => pac.currencies.map((currency) => currency.currencyCode),
    [pac.currencies],
  );

  const linkedPartnerIds = useMemo(
    () => new Set(ppm.linkedPMs.map((pm) => pm.partnerId).filter((id): id is string => !!id)),
    [ppm.linkedPMs],
  );

  // ── Stable callbacks (avoid inline arrows in JSX) ─────────

  const handleEditProject = useCallback(() => {
    setActiveTab("settings");
    setSettingsSection("general");
  }, []);

  const handleShareProject = useCallback(
    () => router.push(`/projects/${projectId}/members`),
    [router, projectId],
  );

  // Expense create/close handlers
  const handleExpenseCreateManual = useCallback(() => {
    setExpenseCreateMode("manual");
    setExpenseCreateOpen(true);
  }, [setExpenseCreateOpen]);

  const handleExpenseCreateAi = useCallback(() => {
    setExpenseCreateMode("ai");
    setExpenseCreateOpen(true);
  }, [setExpenseCreateOpen]);

  const handleExpenseDuplicate = useCallback((expense: import("@/types/expense").ExpenseResponse) => {
    setExpenseDuplicateSource(expense);
    setExpenseCreateMode("manual");
    setExpenseCreateOpen(true);
  }, [setExpenseDuplicateSource, setExpenseCreateOpen]);

  const handleExpenseCreateClose = useCallback(() => {
    setExpenseCreateOpen(false);
    setExpenseDuplicateSource(null);
    setExpenseCreateMode("manual");
  }, [setExpenseCreateOpen, setExpenseDuplicateSource]);

  const handleExpenseEditClose = useCallback(() => setExpenseEditTarget(null), [setExpenseEditTarget]);
  const handleExpenseDeleteClose = useCallback(() => setExpenseDeleteTarget(null), [setExpenseDeleteTarget]);

  // Income create/close handlers
  const handleIncomeCreateManual = useCallback(() => {
    setIncomeCreateMode("manual");
    setIncomeCreateOpen(true);
  }, [setIncomeCreateOpen]);

  const handleIncomeCreateAi = useCallback(() => {
    setIncomeCreateMode("ai");
    setIncomeCreateOpen(true);
  }, [setIncomeCreateOpen]);

  const handleIncomeDuplicate = useCallback((income: import("@/types/income").IncomeResponse) => {
    setIncomeDuplicateSource(income);
    setIncomeCreateMode("manual");
    setIncomeCreateOpen(true);
  }, [setIncomeDuplicateSource, setIncomeCreateOpen]);

  const handleIncomeCreateClose = useCallback(() => {
    setIncomeCreateOpen(false);
    setIncomeDuplicateSource(null);
    setIncomeCreateMode("manual");
  }, [setIncomeCreateOpen, setIncomeDuplicateSource]);

  const handleIncomeEditClose = useCallback(() => setIncomeEditTarget(null), [setIncomeEditTarget]);
  const handleIncomeDeleteClose = useCallback(() => setIncomeDeleteTarget(null), [setIncomeDeleteTarget]);

  // Obligations open/close
  const handleOblCreateOpen = useCallback(() => obl.setCreateOpen(true), [obl]);
  const handleOblCreateClose = useCallback(() => obl.setCreateOpen(false), [obl]);
  const handleOblEditClose = useCallback(() => obl.setEditTarget(null), [obl]);
  const handleOblDeleteClose = useCallback(() => obl.setDeleteTarget(null), [obl]);

  // Categories open/close
  const handleCatCreateOpen = useCallback(() => cat.setCreateOpen(true), [cat]);
  const handleCatCreateClose = useCallback(() => cat.setCreateOpen(false), [cat]);
  const handleCatEditClose = useCallback(() => cat.setEditTarget(null), [cat]);
  const handleCatDeleteClose = useCallback(() => cat.setDeleteTarget(null), [cat]);

  // Budget open/close
  const handleBudUpsertOpen = useCallback(() => bud.setUpsertOpen(true), [bud]);
  const handleBudUpsertClose = useCallback(() => bud.setUpsertOpen(false), [bud]);
  const handleBudDeleteClose = useCallback(() => bud.setDeleteTarget(null), [bud]);

  // Settings: currencies
  const handleAddCurrency = useCallback(
    (currencyCode: string) => mutateAlternativeCurrencyAdd({ currencyCode }),
    [mutateAlternativeCurrencyAdd],
  );

  // Settings: partners
  const handleTogglePartners = useCallback(
    (enabled: boolean) => mutateProjectSettingsUpdate({ partnersEnabled: enabled }),
    [mutateProjectSettingsUpdate],
  );
  const handleAssignClose = useCallback(() => ppp.setAssignOpen(false), [ppp]);
  const handleRemoveClosePartner = useCallback(() => ppp.setRemoveTarget(null), [ppp]);

  // Settings: payment methods
  const ppmState = useMemo(() => ({
    loading: ppm.loading,
    linkedPMs: ppm.linkedPMs,
    linkableItems: ppm.linkableItems,
    linkableLoading: ppm.linkableLoading,
    addOpen: ppm.addOpen,
    removeTarget: ppm.removeTarget,
  }), [ppm.loading, ppm.linkedPMs, ppm.linkableItems, ppm.linkableLoading, ppm.addOpen, ppm.removeTarget]);

  const handleAddClose = useCallback(() => ppm.setAddOpen(false), [ppm]);
  const handleRemoveClosePM = useCallback(() => ppm.setRemoveTarget(null), [ppm]);
  const handleDeleteProjectClose = useCallback(() => setDeleteProjectOpen(false), [setDeleteProjectOpen]);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <ProjectHeader
        project={detail.project}
        loading={detail.loading}
        budget={bud.budget}
        budgetLoading={bud.loading}
        onEdit={handleEditProject}
        onDelete={mutateProjectDeleteOpen}
        onShare={isOwner && permissions?.canShareProjects !== false ? handleShareProject : undefined}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="w-full flex-wrap gap-y-1 p-3">
          <TabsTrigger value="expenses">{t("projects.tabs.expenses")}</TabsTrigger>
          <TabsTrigger value="incomes">{t("projects.tabs.incomes")}</TabsTrigger>
          <TabsTrigger value="obligations">{t("projects.tabs.obligations")}</TabsTrigger>
          <TabsTrigger value="categories">{t("projects.tabs.categories")}</TabsTrigger>
          <TabsTrigger value="budget">{t("projects.tabs.budget")}</TabsTrigger>
          {partnersEnabled && canUsePartners && (
            <TabsTrigger value="partners">{t("projects.tabs.partners")}</TabsTrigger>
          )}
          <TabsTrigger value="settings">{t("projects.tabs.settings")}</TabsTrigger>
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
          canUseOcr={canUseOcr}
          onCreateManual={handleExpenseCreateManual}
          onCreateWithAi={handleExpenseCreateAi}
          onCreateClose={handleExpenseCreateClose}
          onEditSelect={setExpenseEditTarget}
          onEditClose={handleExpenseEditClose}
          onDeleteSelect={setExpenseDeleteTarget}
          onDeleteClose={handleExpenseDeleteClose}
          onCreate={mutateExpenseCreate}
          onBulkCreate={mutateExpenseBulkCreate}
          onSave={mutateExpenseUpdate}
          onDelete={mutateExpenseDelete}
          onToggleActive={mutateExpenseActiveState}
          onDuplicate={handleExpenseDuplicate}
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
          canUseOcr={canUseOcr}
          onCreateManual={handleIncomeCreateManual}
          onCreateWithAi={handleIncomeCreateAi}
          onCreateClose={handleIncomeCreateClose}
          onEditSelect={setIncomeEditTarget}
          onEditClose={handleIncomeEditClose}
          onDeleteSelect={setIncomeDeleteTarget}
          onDeleteClose={handleIncomeDeleteClose}
          onCreate={mutateIncomeCreate}
          onBulkCreate={mutateIncomeBulkCreate}
          onSave={mutateIncomeUpdate}
          onDelete={mutateIncomeDelete}
          onToggleActive={mutateIncomeActiveState}
          onDuplicate={handleIncomeDuplicate}
        />

        <ProjectDetailObligationsTab
          obl={obl}
          onCreateOpen={handleOblCreateOpen}
          onCreateClose={handleOblCreateClose}
          onEditSelect={obl.setEditTarget}
          onEditClose={handleOblEditClose}
          onDeleteSelect={obl.setDeleteTarget}
          onDeleteClose={handleOblDeleteClose}
          onCreate={mutateObligationCreate}
          onSave={mutateObligationUpdate}
          onDelete={mutateObligationDelete}
        />

        <ProjectDetailCategoriesTab
          cat={cat}
          onCreateOpen={handleCatCreateOpen}
          onCreateClose={handleCatCreateClose}
          onEditSelect={cat.setEditTarget}
          onEditClose={handleCatEditClose}
          onDeleteSelect={cat.setDeleteTarget}
          onDeleteClose={handleCatDeleteClose}
          onCreate={mutateCategoryCreate}
          onSave={mutateCategoryUpdate}
          onDelete={mutateCategoryDelete}
        />

        <ProjectDetailBudgetTab
          bud={bud}
          projectCurrency={detail.project?.currencyCode ?? ""}
          canManage={!!canManageBudget}
          canDelete={!!canDeleteBudget}
          onUpsertOpen={handleBudUpsertOpen}
          onUpsertClose={handleBudUpsertClose}
          onDeleteSelect={bud.setDeleteTarget}
          onDeleteClose={handleBudDeleteClose}
          onSave={mutateBudgetSet}
          onDelete={mutateBudgetDelete}
        />

        {partnersEnabled && canUsePartners && (
          <ProjectDetailPartnersTab
            projectId={projectId}
            sel={sel}
            assignedPartners={ppp.assignedPartners}
            projectCurrency={detail.project?.currencyCode ?? ""}
            alternativeCurrencyCodes={alternativeCurrencyCodes}
            canEdit={!!canEditSettlements}
            onCreate={mutateSettlementCreate}
            onSave={mutateSettlementUpdate}
            onDelete={mutateSettlementDelete}
          />
        )}

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
          canUseMultiCurrency={permissions?.canUseMultiCurrency !== false}
          canUsePartners={canUsePartners}
          canManageCurrencies={!!canManageAlternativeCurrencies}
          hasExistingMovements={(exp.total > 0 || inc.total > 0)}
          onAddCurrency={handleAddCurrency}
          onDeleteCurrency={mutateAlternativeCurrencyDelete}
          // Partners
          ppp={ppp}
          partnersEnabled={detail.project?.partnersEnabled ?? false}
          linkedPartnerIds={linkedPartnerIds}
          onTogglePartners={handleTogglePartners}
          onAssignOpen={ppp.openAssignDialog}
          onAssignClose={handleAssignClose}
          onRemoveSelectPartner={ppp.setRemoveTarget}
          onRemoveClosePartner={handleRemoveClosePartner}
          onAssign={async (partnerId) => { await ppp.handleAssign(partnerId); refreshProgress() }}
          onRemovePartner={ppp.handleRemove}
          // Payment methods
          ppm={ppmState}
          onAddOpen={ppm.openAddDialog}
          onAddClose={handleAddClose}
          onLink={async (pmId, pmName) => { await ppm.handleLink(pmId, pmName); refreshProgress() }}
          onRemoveSelectPM={ppm.setRemoveTarget}
          onRemoveClosePM={handleRemoveClosePM}
          onUnlink={ppm.handleUnlink}
        />
      </Tabs>

      {/* ─── Project-level modals ─── */}
      {detail.project && (
        <DeleteEntityModal
          item={detail.project}
          open={deleteProjectOpen}
          onClose={handleDeleteProjectClose}
          onConfirm={mutateProjectDelete}
          title={t("projects.delete.title")}
          description={t("projects.delete.description")}
          getMessage={(p) => t("projects.delete.confirm", { name: p.name })}
        />
      )}
    </div>
  );
}
