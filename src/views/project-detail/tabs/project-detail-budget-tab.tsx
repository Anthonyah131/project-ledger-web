"use client"

import dynamic from "next/dynamic"
import { TabsContent } from "@/components/ui/tabs"
import { DeleteEntityModal } from "@/components/shared/delete-entity-modal"
import { BudgetPanel } from "@/components/project-detail/budget/budget-panel"
import { BudgetSkeleton } from "@/components/project-detail/budget/budget-states"
import type {
  ProjectBudgetResponse,
  SetProjectBudgetRequest,
} from "@/types/project-budget"
import { useLanguage } from "@/context/language-context"

const SetProjectBudgetModal = dynamic(() =>
  import("@/components/project-detail/budget/set-budget-modal").then((mod) => mod.SetProjectBudgetModal)
)

interface BudgetTabState {
  loading: boolean
  budget: ProjectBudgetResponse | null
  upsertOpen: boolean
  deleteTarget: ProjectBudgetResponse | null
}

interface ProjectDetailBudgetTabProps {
  bud: BudgetTabState
  projectCurrency: string
  canManage: boolean
  canDelete: boolean
  onUpsertOpen: () => void
  onUpsertClose: () => void
  onDeleteSelect: (budget: ProjectBudgetResponse) => void
  onDeleteClose: () => void
  onSave: (data: SetProjectBudgetRequest) => void
  onDelete: (budget: ProjectBudgetResponse) => void
}

export function ProjectDetailBudgetTab({
  bud,
  projectCurrency,
  canManage,
  canDelete,
  onUpsertOpen,
  onUpsertClose,
  onDeleteSelect,
  onDeleteClose,
  onSave,
  onDelete,
}: ProjectDetailBudgetTabProps) {
  const { t } = useLanguage()
  return (
    <TabsContent value="budget" className="flex flex-col gap-4">
      {bud.loading ? (
        <BudgetSkeleton />
      ) : (
        <BudgetPanel
          budget={bud.budget}
          projectCurrency={projectCurrency}
          canManage={canManage}
          canDelete={canDelete}
          onSet={onUpsertOpen}
          onDelete={onDeleteSelect}
        />
      )}

      {bud.upsertOpen && (
        <SetProjectBudgetModal
          open={bud.upsertOpen}
          budget={bud.budget}
          projectCurrency={projectCurrency}
          onClose={onUpsertClose}
          onSave={onSave}
        />
      )}

      <DeleteEntityModal
        item={bud.deleteTarget}
        open={!!bud.deleteTarget}
        onClose={onDeleteClose}
        onConfirm={onDelete}
        title={t("budget.deleteTitle")}
        description={t("budget.deleteDescription")}
        getMessage={() => t("budget.deleteConfirm")}
      />
    </TabsContent>
  )
}
