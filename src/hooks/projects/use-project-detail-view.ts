"use client"

// hooks/projects/use-project-detail-view.ts
// Orchestrates all state and side-effects for the project-detail page.

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useProjectDetail } from "./use-project-detail"
import { useProjectExpenses } from "./use-project-expenses"
import { useProjectCategories } from "./use-project-categories"
import { useProjectObligations } from "./use-project-obligations"
import * as paymentMethodService from "@/services/payment-method-service"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { UpdateProjectRequest } from "@/types/project"
import type { CreateExpenseRequest, UpdateExpenseRequest, ExpenseResponse } from "@/types/expense"

export function useProjectDetailView(projectId: string) {
  const router = useRouter()

  // ─── Sub-hooks ────────────────────────────────────────────
  const detail = useProjectDetail(projectId)
  const exp = useProjectExpenses(projectId)
  const cat = useProjectCategories(projectId)
  const obl = useProjectObligations(projectId)

  // ─── Payment methods (global, for expense selects) ────────
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([])

  useEffect(() => {
    paymentMethodService
      .getPaymentMethods()
      .then(setPaymentMethods)
      .catch(() => {})
  }, [])

  // ─── Project modal state ──────────────────────────────────
  const [editProjectOpen, setEditProjectOpen] = useState(false)
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false)

  // ─── Project header actions ───────────────────────────────
  const handleProjectEdit = useCallback(() => {
    setEditProjectOpen(true)
  }, [])

  const handleProjectDelete = useCallback(() => {
    setDeleteProjectOpen(true)
  }, [])

  const handleProjectEditSave = useCallback(
    (_id: string, data: UpdateProjectRequest) => {
      detail.handleEdit(data)
    },
    [detail],
  )

  const handleProjectDeleteConfirm = useCallback(
    async () => {
      const deleted = await detail.handleDelete()
      if (deleted) router.push("/projects")
    },
    [detail, router],
  )

  // ─── Cross-tab sync: expense CRUD → refresh obligations ───
  const handleExpenseCreate = useCallback(
    async (data: CreateExpenseRequest) => {
      await exp.handleCreate(data)
      if (data.obligationId) obl.refetch()
    },
    [exp, obl],
  )

  const handleExpenseEdit = useCallback(
    async (expenseId: string, data: UpdateExpenseRequest) => {
      await exp.handleEdit(expenseId, data)
      obl.refetch()
    },
    [exp, obl],
  )

  const handleExpenseDelete = useCallback(
    async (expense: ExpenseResponse) => {
      await exp.handleDelete(expense)
      if (expense.obligationId) obl.refetch()
    },
    [exp, obl],
  )

  // ─── Cross-tab sync: category delete → refresh expenses ───
  const handleCategoryDelete = useCallback(
    async (category: Parameters<typeof cat.handleDelete>[0]) => {
      await cat.handleDelete(category)
      exp.refetch()
    },
    [cat, exp],
  )

  return {
    // project
    detail,
    editProjectOpen,
    deleteProjectOpen,
    setEditProjectOpen,
    setDeleteProjectOpen,
    handleProjectEdit,
    handleProjectDelete,
    handleProjectEditSave,
    handleProjectDeleteConfirm,
    // sub-resources
    exp,
    cat,
    obl,
    paymentMethods,
    // cross-tab sync handlers
    handleExpenseCreate,
    handleExpenseEdit,
    handleExpenseDelete,
    handleCategoryDelete,
  }
}
