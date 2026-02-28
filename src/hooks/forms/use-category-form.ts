"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryFormValues,
  type UpdateCategoryFormValues,
} from "@/lib/validations/category"
import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category"

// ─── Create ───────────────────────────────────────────────────────────────────

interface UseCreateCategoryFormOptions {
  onCreate: (data: CreateCategoryRequest) => void
  onClose: () => void
}

export function useCreateCategoryForm({ onCreate, onClose }: UseCreateCategoryFormOptions) {
  const form = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      budgetAmount: "",
    },
  })

  function onSubmit(values: CreateCategoryFormValues) {
    const payload: CreateCategoryRequest = { name: values.name }
    if (values.description) payload.description = values.description
    if (values.budgetAmount !== "") payload.budgetAmount = Number(values.budgetAmount)
    onCreate(payload)
    handleClose()
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), handleClose }
}

// ─── Update ───────────────────────────────────────────────────────────────────

interface UseUpdateCategoryFormOptions {
  category: CategoryResponse | null
  onSave: (id: string, data: UpdateCategoryRequest) => void
  onClose: () => void
}

export function useUpdateCategoryForm({ category, onSave, onClose }: UseUpdateCategoryFormOptions) {
  const form = useForm<UpdateCategoryFormValues>({
    resolver: zodResolver(updateCategorySchema),
    values: category
      ? {
          name: category.name,
          description: category.description ?? "",
          budgetAmount: category.budgetAmount != null ? String(category.budgetAmount) : "",
        }
      : undefined,
  })

  function onSubmit(values: UpdateCategoryFormValues) {
    if (!category) return
    const payload: UpdateCategoryRequest = { name: values.name }
    if (values.description) payload.description = values.description
    payload.budgetAmount = values.budgetAmount !== "" ? Number(values.budgetAmount) : null
    onSave(category.id, payload)
    handleClose()
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), handleClose }
}
