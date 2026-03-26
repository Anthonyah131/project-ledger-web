"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLanguage } from "@/context/language-context"
import {
  setProjectBudgetSchema,
  type SetProjectBudgetFormValues,
} from "@/lib/validations/project-budget"
import type {
  ProjectBudgetResponse,
  SetProjectBudgetRequest,
} from "@/types/project-budget"

interface UseSetProjectBudgetFormOptions {
  budget: ProjectBudgetResponse | null
  onSave: (data: SetProjectBudgetRequest) => void
  onClose: () => void
}

function toFormValues(budget: ProjectBudgetResponse | null): SetProjectBudgetFormValues {
  if (!budget) {
    return {
      totalBudget: "",
      alertPercentage: "80",
    }
  }

  return {
    totalBudget: String(budget.totalBudget),
    alertPercentage: String(budget.alertPercentage),
  }
}

export function useSetProjectBudgetForm({ budget, onSave, onClose }: UseSetProjectBudgetFormOptions) {
  const { t } = useLanguage()
  const form = useForm<SetProjectBudgetFormValues>({
    resolver: zodResolver(setProjectBudgetSchema(t)),
    defaultValues: toFormValues(budget),
  })

  useEffect(() => {
    form.reset(toFormValues(budget))
  }, [budget, form])

  function onSubmit(values: SetProjectBudgetFormValues) {
    const payload: SetProjectBudgetRequest = {
      totalBudget: Number(values.totalBudget),
      alertPercentage: Number(values.alertPercentage),
    }

    onSave(payload)
    handleClose()
  }

  function handleClose() {
    form.reset(toFormValues(budget))
    onClose()
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    handleClose,
  }
}
