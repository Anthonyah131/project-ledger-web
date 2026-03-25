"use client"

// hooks/projects/use-project-categories.ts
// State management for categories within a project detail view.

import { useState, useCallback, useEffect, useMemo } from "react"
import { toast } from "sonner"
import * as categoryService from "@/services/category-service"
import { toastApiError } from "@/lib/error-utils"
import { useLanguage } from "@/context/language-context"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category"
import type { MutationOptions } from "@/types/common"

export function useProjectCategories(projectId: string) {
  const { t } = useLanguage()
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [loading, setLoading] = useState(true)

  // Client-side search
  const [query, setQuery] = useState("")

  // Modals
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<CategoryResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null)

  // ── Fetch ─────────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const data = await categoryService.getCategories(projectId)
      setCategories(data)
    } catch (err) {
      toastApiError(err, t("categories.errors.load"))
    } finally {
      setLoading(false)
    }
  }, [projectId, t])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // ── Debounced query ────────────────────────────────────────────

  const debouncedQuery = useDebouncedValue(query, 300)

  // ── Filtered ──────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!debouncedQuery) return categories
    const lower = debouncedQuery.toLowerCase()
    return categories.filter((c) => c.name.toLowerCase().includes(lower))
  }, [categories, debouncedQuery])

  const hasSearch = !!debouncedQuery

  // ── CRUD ──────────────────────────────────────────────────

  const mutateCreate = useCallback(
    async (data: CreateCategoryRequest, options?: MutationOptions) => {
      try {
        const created = await categoryService.createCategory(projectId, data)
        if (options?.refetch ?? true) {
          await fetchCategories()
        } else {
          setCategories((prev) => [...prev, created])
        }
        toast.success(t("categories.toast.created"), {
          description: t("categories.toast.createdDesc", { name: created.name }),
        })
      } catch (err) {
        toastApiError(err, t("categories.errors.create"))
      }
    },
    [projectId, fetchCategories, t]
  )

  const mutateUpdate = useCallback(
    async (
      categoryId: string,
      data: UpdateCategoryRequest,
      options?: MutationOptions
    ) => {
      try {
        const updated = await categoryService.updateCategory(projectId, categoryId, data)
        if (options?.refetch ?? true) {
          await fetchCategories()
        } else {
          setCategories((prev) => prev.map((c) => (c.id === categoryId ? updated : c)))
        }
        toast.success(t("categories.toast.updated"), {
          description: t("categories.toast.updatedDesc", { name: updated.name }),
        })
      } catch (err) {
        toastApiError(err, t("categories.errors.update"))
      }
    },
    [projectId, fetchCategories, t]
  )

  const mutateDelete = useCallback(
    async (category: CategoryResponse, options?: MutationOptions) => {
      try {
        await categoryService.deleteCategory(projectId, category.id)
        if (options?.refetch ?? true) {
          await fetchCategories()
        } else {
          setCategories((prev) => prev.filter((c) => c.id !== category.id))
        }
        toast.success(t("categories.toast.deleted"), {
          description: t("categories.toast.deletedDesc", { name: category.name }),
        })
        return true
      } catch (err) {
        toastApiError(err, t("categories.errors.delete"))
        return false
      }
    },
    [projectId, fetchCategories, t]
  )

  return {
    categories: filtered,
    total: categories.length,
    loading,
    hasSearch,
    query, setQuery,
    createOpen, setCreateOpen,
    editTarget, setEditTarget,
    deleteTarget, setDeleteTarget,
    mutateCreate,
    mutateUpdate,
    mutateDelete,
    refetch: fetchCategories,
  }
}
