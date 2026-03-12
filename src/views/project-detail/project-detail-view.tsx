"use client"

// views/project-detail/project-detail-view.tsx
// Orchestrator for the project-detail page — header + resource tabs.

import dynamic from "next/dynamic";
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

// ── Extracted tabs ───────────────────────────────────
import { ProjectDetailObligationsTab } from "@/views/project-detail/tabs/project-detail-obligations-tab";
import { ProjectDetailCategoriesTab } from "@/views/project-detail/tabs/project-detail-categories-tab";
import { ProjectDetailBudgetTab } from "@/views/project-detail/tabs/project-detail-budget-tab";
import { ProjectDetailPaymentMethodsTab } from "@/views/project-detail/tabs/project-detail-payment-methods-tab";
import { ProjectDetailAlternativeCurrenciesTab } from "@/views/project-detail/tabs/project-detail-alternative-currencies-tab";

import type { PaymentMethodResponse } from "@/types/payment-method";

const EditProjectModal = dynamic(() =>
  import("@/components/projects/edit-project-modal").then((mod) => mod.EditProjectModal)
);

interface Props {
  projectId: string;
}

type CreateEntryMode = "manual" | "ai";

export function ProjectDetailView({ projectId }: Props) {
  const router = useRouter();
  const [expenseCreateMode, setExpenseCreateMode] = useState<CreateEntryMode>("manual");
  const [incomeCreateMode, setIncomeCreateMode] = useState<CreateEntryMode>("manual");
  const {
    detail,
    editProjectOpen, deleteProjectOpen,
    setEditProjectOpen, setDeleteProjectOpen,
    mutateProjectEditOpen, mutateProjectDeleteOpen,
    mutateProjectUpdate, mutateProjectDelete,
    exp, inc, pac, cat, obl, bud, ppm,
    mutateExpenseCreate, mutateExpenseUpdate, mutateExpenseDelete,
    mutateIncomeCreate, mutateIncomeUpdate, mutateIncomeDelete,
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

  // Convert linked project payment methods to PaymentMethodResponse shape
  // so existing expense form components can consume them without changes.
  const paymentMethods: PaymentMethodResponse[] = useMemo(
    () =>
      ppm.linkedMethods.map((m) => ({
        id: m.paymentMethodId,
        name: m.paymentMethodName,
        type: m.type,
        currency: m.currency,
        bankName: m.bankName,
        accountNumber: m.accountNumber,
        description: null,
        createdAt: m.linkedAt,
        updatedAt: m.linkedAt,
      })),
    [ppm.linkedMethods],
  );

  const alternativeCurrencyCodes = useMemo(
    () => pac.currencies.map((currency) => currency.currencyCode),
    [pac.currencies],
  );

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <ProjectHeader
        project={detail.project}
        loading={detail.loading}
        onEdit={mutateProjectEditOpen}
        onDelete={mutateProjectDeleteOpen}
        onShare={
          isOwner
            ? () => router.push(`/projects/${projectId}/members`)
            : undefined
        }
      />

      {/* Tabs */}
      <Tabs defaultValue="expenses">
        <TabsList variant="line">
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="incomes">Ingresos</TabsTrigger>
          <TabsTrigger value="alternative-currencies">Monedas</TabsTrigger>
          <TabsTrigger value="obligations">Obligaciones</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="budget">Presupuesto</TabsTrigger>
          <TabsTrigger value="payment-methods">Métodos de pago</TabsTrigger>
        </TabsList>

        <ProjectDetailExpensesTab
          projectId={projectId}
          exp={exp}
          categories={cat.categories}
          paymentMethods={paymentMethods}
          obligations={obl.obligations}
          projectCurrency={detail.project?.currencyCode ?? ""}
          alternativeCurrencyCodes={alternativeCurrencyCodes}
          createMode={expenseCreateMode}
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
        />

        <ProjectDetailIncomesTab
          projectId={projectId}
          inc={inc}
          categories={cat.categories}
          paymentMethods={paymentMethods}
          availableCurrencies={pac.allCurrencies}
          projectCurrency={detail.project?.currencyCode ?? ""}
          alternativeCurrencyCodes={alternativeCurrencyCodes}
          createMode={incomeCreateMode}
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
        />

        <ProjectDetailAlternativeCurrenciesTab
          projectCurrency={detail.project?.currencyCode ?? ""}
          currencies={pac.currencies}
          allCurrencies={pac.allCurrencies}
          loading={pac.loading}
          catalogLoading={pac.catalogLoading}
          canManage={!!canManageAlternativeCurrencies}
          onAdd={(currencyCode) => mutateAlternativeCurrencyAdd({ currencyCode })}
          onDelete={(c) => { mutateAlternativeCurrencyDelete(c) }}
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

        <ProjectDetailPaymentMethodsTab
          ppm={ppm}
          isOwner={!!isOwner}
          onLinkOpen={ppm.openLinkDialog}
          onLinkClose={() => ppm.setLinkOpen(false)}
          onUnlinkSelect={ppm.setUnlinkTarget}
          onUnlinkClose={() => ppm.setUnlinkTarget(null)}
          onLink={ppm.handleLink}
          onUnlink={(pm) => { ppm.handleUnlink(pm) }}
        />
      </Tabs>

      {/* ─── Project-level modals ─── */}
      {detail.project && (
        <>
          {editProjectOpen && (
            <EditProjectModal
              project={detail.project}
              open={editProjectOpen}
              onClose={() => setEditProjectOpen(false)}
              onSave={mutateProjectUpdate}
            />
          )}
          <DeleteEntityModal
            item={detail.project}
            open={deleteProjectOpen}
            onClose={() => setDeleteProjectOpen(false)}
            onConfirm={mutateProjectDelete}
            title="Eliminar proyecto"
            description="Esta accion puede desactivarlo, no eliminarlo definitivamente."
            getMessage={(p) => `¿Eliminar proyecto "${p.name}"?`}
          />
        </>
      )}
    </div>
  );
}
