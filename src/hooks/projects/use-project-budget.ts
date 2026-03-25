"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import * as budgetService from "@/services/budget-service"
import { toastApiError } from "@/lib/error-utils"
import { useLanguage } from "@/context/language-context"
import { ApiClientError } from "@/lib/api-client"
import type { MutationOptions } from "@/types/common"
import type {
  ProjectBudgetResponse,
  SetProjectBudgetRequest,
} from "@/types/project-budget"

export function useProjectBudget(projectId: string) {
  const { t } = useLanguage()
  const [budget, setBudget] = useState<ProjectBudgetResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const [upsertOpen, setUpsertOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProjectBudgetResponse | null>(null)

  const fetchBudget = useCallback(async () => {
    try {
      setLoading(true)
      const data = await budgetService.getProjectBudget(projectId)
      setBudget(data)
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setBudget(null)
      } else {
        toastApiError(err, t("budget.errors.load"))
      }
    } finally {
      setLoading(false)
    }
  }, [projectId, t])

  useEffect(() => {
    fetchBudget()
  }, [fetchBudget])

  const mutateSet = useCallback(
    async (data: SetProjectBudgetRequest, options?: MutationOptions) => {
      try {
        const saved = await budgetService.setProjectBudget(projectId, data)

        if (options?.refetch ?? true) {
          await fetchBudget()
        } else {
          setBudget(saved)
        }

        toast.success(budget ? t("budget.toast.updated") : t("budget.toast.set"))
      } catch (err) {
        toastApiError(err, t("budget.errors.save"))
      }
    },
    [projectId, fetchBudget, budget, t],
  )

  const mutateDelete = useCallback(
    async (_target: ProjectBudgetResponse, options?: MutationOptions) => {
      try {
        await budgetService.deleteProjectBudget(projectId)

        if (options?.refetch ?? true) {
          await fetchBudget()
        } else {
          setBudget(null)
        }

        toast.success(t("budget.toast.deleted"))
      } catch (err) {
        toastApiError(err, t("budget.errors.delete"))
      }
    },
    [projectId, fetchBudget, t],
  )

  return {
    budget,
    hasBudget: !!budget,
    loading,
    upsertOpen,
    setUpsertOpen,
    deleteTarget,
    setDeleteTarget,
    mutateSet,
    mutateDelete,
    refetch: fetchBudget,
  }
}
