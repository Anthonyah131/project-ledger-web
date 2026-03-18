"use client"

// hooks/projects/use-project-detail-view.ts
// Orchestrates all state and side-effects for the project-detail page.

import { useCallback, useRef, useState } from "react"
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
import { useProjectPartnerSettlements } from "./use-project-partner-settlements"
import type { UpdateProjectRequest, UpdateProjectSettingsRequest } from "@/types/project"
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
  const partnersEnabled = detail.project?.partnersEnabled ?? false
  const sel = useProjectPartnerSettlements(projectId, partnersEnabled)

  const {
    mutateUpdate: mutateDetailUpdate,
    mutateDelete: mutateDetailDelete,
    mutateUpdateSettings: mutateDetailUpdateSettings,
  } = detail
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
    hasBudget,
    mutateSet: mutateBudgetSetRaw,
    mutateDelete: mutateBudgetDeleteRaw,
    refetch: refetchBudget,
  } = bud

  // Stable refs so expense/income callbacks don't recreate when these change
  const hasBudgetRef = useRef(hasBudget)
  hasBudgetRef.current = hasBudget
  const partnersEnabledRef = useRef(partnersEnabled)
  partnersEnabledRef.current = partnersEnabled
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
  const { refetchBalance: refetchPartnerBalance } = sel

  // ─── Project modal state ──────────────────────────────────
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false)

  // ─── Project header actions ───────────────────────────────
  const mutateProjectDeleteOpen = useCallback(() => {
    setDeleteProjectOpen(true)
  }, [])

  const mutateProjectUpdate = useCallback(
    async (_id: string, data: UpdateProjectRequest) => {
      await mutateDetailUpdate(data)
    },
    [mutateDetailUpdate],
  )

  const mutateProjectSettingsUpdate = useCallback(
    async (data: UpdateProjectSettingsRequest) => {
      return await mutateDetailUpdateSettings(data)
    },
    [mutateDetailUpdateSettings],
  )

  const mutateProjectDelete = useCallback(
    async () => {
      const deleted = await mutateDetailDelete()
      if (deleted) router.push("/projects")
    },
    [mutateDetailDelete, router],
  )

  // ─── Cross-tab sync: expense CRUD → refresh obligations + budget + partner balances ───
  const mutateExpenseCreate = useCallback(
    async (data: CreateExpenseRequest) => {
      await mutateExpenseCreateRaw(data, { refetch: false })
      await Promise.all([
        refetchExpenses(),
        data.obligationId ? refetchObligations() : Promise.resolve(),
        hasBudgetRef.current ? refetchBudget() : Promise.resolve(),
        partnersEnabledRef.current ? refetchPartnerBalance() : Promise.resolve(),
      ])
    },
    [mutateExpenseCreateRaw, refetchExpenses, refetchObligations, refetchBudget, refetchPartnerBalance],
  )

  const mutateExpenseUpdate = useCallback(
    async (expenseId: string, data: UpdateExpenseRequest) => {
      await mutateExpenseUpdateRaw(expenseId, data, { refetch: false })
      await Promise.all([
        refetchExpenses(),
        refetchObligations(),
        hasBudgetRef.current ? refetchBudget() : Promise.resolve(),
        partnersEnabledRef.current ? refetchPartnerBalance() : Promise.resolve(),
      ])
    },
    [mutateExpenseUpdateRaw, refetchExpenses, refetchObligations, refetchBudget, refetchPartnerBalance],
  )

  const mutateExpenseDelete = useCallback(
    async (expense: ExpenseResponse) => {
      await mutateExpenseDeleteRaw(expense, { refetch: false })
      await Promise.all([
        refetchExpenses(),
        expense.obligationId ? refetchObligations() : Promise.resolve(),
        hasBudgetRef.current ? refetchBudget() : Promise.resolve(),
        partnersEnabledRef.current ? refetchPartnerBalance() : Promise.resolve(),
      ])
    },
    [mutateExpenseDeleteRaw, refetchExpenses, refetchObligations, refetchBudget, refetchPartnerBalance],
  )

  const mutateExpenseActiveState = useCallback(
    async (expense: ExpenseResponse, isActive: boolean) => {
      await mutateExpenseActiveStateRaw(expense, isActive, { refetch: false })
      await Promise.all([
        refetchExpenses(),
        expense.obligationId ? refetchObligations() : Promise.resolve(),
        hasBudgetRef.current ? refetchBudget() : Promise.resolve(),
        partnersEnabledRef.current ? refetchPartnerBalance() : Promise.resolve(),
      ])
    },
    [mutateExpenseActiveStateRaw, refetchExpenses, refetchObligations, refetchBudget, refetchPartnerBalance],
  )

  // ─── Income CRUD → refresh budget + partner balances ───
  const mutateIncomeCreate = useCallback(
    async (data: CreateIncomeRequest) => {
      await mutateIncomeCreateRaw(data, { refetch: false })
      await Promise.all([
        refetchIncomes(),
        hasBudgetRef.current ? refetchBudget() : Promise.resolve(),
        partnersEnabledRef.current ? refetchPartnerBalance() : Promise.resolve(),
      ])
    },
    [mutateIncomeCreateRaw, refetchIncomes, refetchBudget, refetchPartnerBalance],
  )

  const mutateIncomeUpdate = useCallback(
    async (incomeId: string, data: UpdateIncomeRequest) => {
      await mutateIncomeUpdateRaw(incomeId, data, { refetch: false })
      await Promise.all([
        refetchIncomes(),
        hasBudgetRef.current ? refetchBudget() : Promise.resolve(),
        partnersEnabledRef.current ? refetchPartnerBalance() : Promise.resolve(),
      ])
    },
    [mutateIncomeUpdateRaw, refetchIncomes, refetchBudget, refetchPartnerBalance],
  )

  const mutateIncomeDelete = useCallback(
    async (income: IncomeResponse) => {
      await mutateIncomeDeleteRaw(income, { refetch: false })
      await Promise.all([
        refetchIncomes(),
        hasBudgetRef.current ? refetchBudget() : Promise.resolve(),
        partnersEnabledRef.current ? refetchPartnerBalance() : Promise.resolve(),
      ])
    },
    [mutateIncomeDeleteRaw, refetchIncomes, refetchBudget, refetchPartnerBalance],
  )

  const mutateIncomeActiveState = useCallback(
    async (income: IncomeResponse, isActive: boolean) => {
      await mutateIncomeActiveStateRaw(income, isActive, { refetch: false })
      await Promise.all([
        refetchIncomes(),
        hasBudgetRef.current ? refetchBudget() : Promise.resolve(),
        partnersEnabledRef.current ? refetchPartnerBalance() : Promise.resolve(),
      ])
    },
    [mutateIncomeActiveStateRaw, refetchIncomes, refetchBudget, refetchPartnerBalance],
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
      if (!deleted) return
      await refetchAlternativeCurrencies()
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
    deleteProjectOpen,
    setDeleteProjectOpen,
    mutateProjectDeleteOpen,
    mutateProjectUpdate,
    mutateProjectDelete,
    mutateProjectSettingsUpdate,
    // sub-resources
    exp,
    inc,
    pac,
    cat,
    obl,
    bud,
    ppm,
    ppp,
    sel,
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
    mutateSettlementCreate: sel.mutateCreate,
    mutateSettlementUpdate: sel.mutateUpdate,
    mutateSettlementDelete: sel.mutateDelete,
  }
}
