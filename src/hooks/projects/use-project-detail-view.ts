"use client"

// hooks/projects/use-project-detail-view.ts
// Orchestrates all state and side-effects for the project-detail page.

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useProjectDetail } from "./use-project-detail"
import { useProjectExpenses } from "./use-project-expenses"
import { useProjectCategories } from "./use-project-categories"
import { useProjectObligations } from "./use-project-obligations"
import { useProjectBudget } from "./use-project-budget"
import { useProjectPaymentMethods } from "./use-project-payment-methods"
import { useProjectIncomes } from "./use-project-incomes"
import { useProjectAlternativeCurrencies } from "./use-project-alternative-currencies"
import { useProjectPartners } from "./use-project-partners"
import type { UpdateProjectRequest } from "@/types/project"
import type { CreateExpenseRequest, UpdateExpenseRequest, ExpenseResponse } from "@/types/expense"
import type { CreateIncomeRequest, IncomeResponse, UpdateIncomeRequest } from "@/types/income"
import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category"
import type {
  ObligationResponse,
  CreateObligationRequest,
  UpdateObligationRequest,
} from "@/types/obligation"
import type {
  ProjectBudgetResponse,
  SetProjectBudgetRequest,
} from "@/types/project-budget"
import type { AddAlternativeCurrencyRequest, ProjectAlternativeCurrencyResponse } from "@/types/project-alternative-currency"

export function useProjectDetailView(projectId: string) {
  const router = useRouter()

  // ─── Sub-hooks ────────────────────────────────────────────
  const detail = useProjectDetail(projectId)
  const exp = useProjectExpenses(projectId)
  const cat = useProjectCategories(projectId)
  const obl = useProjectObligations(projectId)
  const bud = useProjectBudget(projectId)
  const ppm = useProjectPaymentMethods(projectId)
  const inc = useProjectIncomes(projectId)
  const pac = useProjectAlternativeCurrencies(projectId)
  const ppp = useProjectPartners(projectId)

  const { mutateUpdate: mutateDetailUpdate, mutateDelete: mutateDetailDelete } = detail
  const {
    mutateCreate: mutateExpenseCreateRaw,
    mutateUpdate: mutateExpenseUpdateRaw,
    mutateDelete: mutateExpenseDeleteRaw,
    mutateActiveState: mutateExpenseActiveStateRaw,
    refetch: refetchExpenses,
  } = exp
  const {
    mutateCreate: mutateCategoryCreateRaw,
    mutateUpdate: mutateCategoryUpdateRaw,
    mutateDelete: mutateCategoryDeleteRaw,
    refetch: refetchCategories,
  } = cat
  const {
    mutateCreate: mutateObligationCreateRaw,
    mutateUpdate: mutateObligationUpdateRaw,
    mutateDelete: mutateObligationDeleteRaw,
    refetch: refetchObligations,
  } = obl
  const {
    budget: currentBudget,
    mutateSet: mutateBudgetSetRaw,
    mutateDelete: mutateBudgetDeleteRaw,
    refetch: refetchBudget,
  } = bud
  const {
    mutateCreate: mutateIncomeCreateRaw,
    mutateUpdate: mutateIncomeUpdateRaw,
    mutateDelete: mutateIncomeDeleteRaw,
    mutateActiveState: mutateIncomeActiveStateRaw,
    refetch: refetchIncomes,
  } = inc
  const {
    mutateAdd: mutateAlternativeCurrencyAddRaw,
    mutateDelete: mutateAlternativeCurrencyDeleteRaw,
    refetch: refetchAlternativeCurrencies,
  } = pac

  // ─── Project modal state ──────────────────────────────────
  const [editProjectOpen, setEditProjectOpen] = useState(false)
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false)

  // ─── Project header actions ───────────────────────────────
  const mutateProjectEditOpen = useCallback(() => {
    setEditProjectOpen(true)
  }, [])

  const mutateProjectDeleteOpen = useCallback(() => {
    setDeleteProjectOpen(true)
  }, [])

  const mutateProjectUpdate = useCallback(
    async (_id: string, data: UpdateProjectRequest) => {
      await mutateDetailUpdate(data)
    },
    [mutateDetailUpdate],
  )

  const mutateProjectDelete = useCallback(
    async () => {
      const deleted = await mutateDetailDelete()
      if (deleted) router.push("/projects")
    },
    [mutateDetailDelete, router],
  )

  // ─── Cross-tab sync: expense CRUD → refresh obligations + budget ───
  const mutateExpenseCreate = useCallback(
    async (data: CreateExpenseRequest) => {
      await mutateExpenseCreateRaw(data, { refetch: false })
      await Promise.all([
        refetchExpenses(),
        data.obligationId ? refetchObligations() : Promise.resolve(),
        currentBudget ? refetchBudget() : Promise.resolve(),
      ])
    },
    [mutateExpenseCreateRaw, refetchExpenses, refetchObligations, currentBudget, refetchBudget],
  )

  const mutateExpenseUpdate = useCallback(
    async (expenseId: string, data: UpdateExpenseRequest) => {
      await mutateExpenseUpdateRaw(expenseId, data, { refetch: false })
      await Promise.all([
        refetchExpenses(),
        refetchObligations(),
        currentBudget ? refetchBudget() : Promise.resolve(),
      ])
    },
    [mutateExpenseUpdateRaw, refetchExpenses, refetchObligations, currentBudget, refetchBudget],
  )

  const mutateExpenseDelete = useCallback(
    async (expense: ExpenseResponse) => {
      await mutateExpenseDeleteRaw(expense, { refetch: false })
      await Promise.all([
        refetchExpenses(),
        expense.obligationId ? refetchObligations() : Promise.resolve(),
        currentBudget ? refetchBudget() : Promise.resolve(),
      ])
    },
    [mutateExpenseDeleteRaw, refetchExpenses, refetchObligations, currentBudget, refetchBudget],
  )

  const mutateExpenseActiveState = useCallback(
    async (expense: ExpenseResponse, isActive: boolean) => {
      await mutateExpenseActiveStateRaw(expense, isActive, { refetch: false })
      await Promise.all([
        refetchExpenses(),
        expense.obligationId ? refetchObligations() : Promise.resolve(),
        currentBudget ? refetchBudget() : Promise.resolve(),
      ])
    },
    [mutateExpenseActiveStateRaw, refetchExpenses, refetchObligations, currentBudget, refetchBudget],
  )

  // ─── Income CRUD → refresh budget (if configured) ───
  const mutateIncomeCreate = useCallback(
    async (data: CreateIncomeRequest) => {
      await mutateIncomeCreateRaw(data, { refetch: false })
      await Promise.all([
        refetchIncomes(),
        currentBudget ? refetchBudget() : Promise.resolve(),
      ])
    },
    [mutateIncomeCreateRaw, refetchIncomes, currentBudget, refetchBudget],
  )

  const mutateIncomeUpdate = useCallback(
    async (incomeId: string, data: UpdateIncomeRequest) => {
      await mutateIncomeUpdateRaw(incomeId, data, { refetch: false })
      await Promise.all([
        refetchIncomes(),
        currentBudget ? refetchBudget() : Promise.resolve(),
      ])
    },
    [mutateIncomeUpdateRaw, refetchIncomes, currentBudget, refetchBudget],
  )

  const mutateIncomeDelete = useCallback(
    async (income: IncomeResponse) => {
      await mutateIncomeDeleteRaw(income, { refetch: false })
      await Promise.all([
        refetchIncomes(),
        currentBudget ? refetchBudget() : Promise.resolve(),
      ])
    },
    [mutateIncomeDeleteRaw, refetchIncomes, currentBudget, refetchBudget],
  )

  const mutateIncomeActiveState = useCallback(
    async (income: IncomeResponse, isActive: boolean) => {
      await mutateIncomeActiveStateRaw(income, isActive, { refetch: false })
      await Promise.all([
        refetchIncomes(),
        currentBudget ? refetchBudget() : Promise.resolve(),
      ])
    },
    [mutateIncomeActiveStateRaw, refetchIncomes, currentBudget, refetchBudget],
  )

  // ─── Alternative currencies ───
  const mutateAlternativeCurrencyAdd = useCallback(
    async (data: AddAlternativeCurrencyRequest) => {
      await mutateAlternativeCurrencyAddRaw(data)
      await refetchAlternativeCurrencies()
    },
    [mutateAlternativeCurrencyAddRaw, refetchAlternativeCurrencies],
  )

  const mutateAlternativeCurrencyDelete = useCallback(
    async (currency: ProjectAlternativeCurrencyResponse) => {
      const deleted = await mutateAlternativeCurrencyDeleteRaw(currency)
      if (!deleted) return false
      await refetchAlternativeCurrencies()
      return true
    },
    [mutateAlternativeCurrencyDeleteRaw, refetchAlternativeCurrencies],
  )

  // ─── Categories: mutate + orchestrated refresh ───
  const mutateCategoryCreate = useCallback(
    async (data: CreateCategoryRequest) => {
      await mutateCategoryCreateRaw(data, { refetch: false })
      await refetchCategories()
    },
    [mutateCategoryCreateRaw, refetchCategories],
  )

  const mutateCategoryUpdate = useCallback(
    async (categoryId: string, data: UpdateCategoryRequest) => {
      await mutateCategoryUpdateRaw(categoryId, data, { refetch: false })
      await refetchCategories()
    },
    [mutateCategoryUpdateRaw, refetchCategories],
  )

  // ─── Categories cross-tab sync: delete → refresh expenses ───
  const mutateCategoryDelete = useCallback(
    async (category: CategoryResponse) => {
      const deleted = await mutateCategoryDeleteRaw(category, { refetch: false })
      if (!deleted) return false
      await Promise.all([refetchCategories(), refetchExpenses()])
      return true
    },
    [mutateCategoryDeleteRaw, refetchCategories, refetchExpenses],
  )

  // ─── Obligations: mutate + orchestrated refresh ───
  const mutateObligationCreate = useCallback(
    async (data: CreateObligationRequest) => {
      await mutateObligationCreateRaw(data, { refetch: false })
      await refetchObligations()
    },
    [mutateObligationCreateRaw, refetchObligations],
  )

  const mutateObligationUpdate = useCallback(
    async (obligationId: string, data: UpdateObligationRequest) => {
      await mutateObligationUpdateRaw(obligationId, data, { refetch: false })
      await refetchObligations()
    },
    [mutateObligationUpdateRaw, refetchObligations],
  )

  const mutateObligationDelete = useCallback(
    async (obligation: ObligationResponse) => {
      await mutateObligationDeleteRaw(obligation, { refetch: false })
      await refetchObligations()
    },
    [mutateObligationDeleteRaw, refetchObligations],
  )

  // ─── Budget: mutate + orchestrated refresh ───
  const mutateBudgetSet = useCallback(
    async (data: SetProjectBudgetRequest) => {
      await mutateBudgetSetRaw(data, { refetch: false })
      await refetchBudget()
    },
    [mutateBudgetSetRaw, refetchBudget],
  )

  const mutateBudgetDelete = useCallback(
    async (budget: ProjectBudgetResponse) => {
      await mutateBudgetDeleteRaw(budget, { refetch: false })
      await refetchBudget()
    },
    [mutateBudgetDeleteRaw, refetchBudget],
  )

  return {
    // project
    detail,
    editProjectOpen,
    deleteProjectOpen,
    setEditProjectOpen,
    setDeleteProjectOpen,
    mutateProjectEditOpen,
    mutateProjectDeleteOpen,
    mutateProjectUpdate,
    mutateProjectDelete,
    // sub-resources
    exp,
    inc,
    pac,
    cat,
    obl,
    bud,
    ppm,
    ppp,
    // cross-tab sync handlers
    mutateExpenseCreate,
    mutateExpenseUpdate,
    mutateExpenseDelete,
    mutateExpenseActiveState,
    mutateIncomeCreate,
    mutateIncomeUpdate,
    mutateIncomeDelete,
    mutateIncomeActiveState,
    mutateAlternativeCurrencyAdd,
    mutateAlternativeCurrencyDelete,
    mutateCategoryCreate,
    mutateCategoryUpdate,
    mutateCategoryDelete,
    mutateObligationCreate,
    mutateObligationUpdate,
    mutateObligationDelete,
    mutateBudgetSet,
    mutateBudgetDelete,
  }
}
