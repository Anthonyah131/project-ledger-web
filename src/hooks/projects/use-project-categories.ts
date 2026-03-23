"use client"

// hooks/projects/use-project-categories.ts
// State management for categories within a project detail view.

import { useState, useCallback, useEffect, useMemo } from "react"
import { toast } from "sonner"
import * as categoryService from "@/services/category-service"
import { toastApiError } from "@/lib/error-utils"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category"
import type { MutationOptions } from "@/types/common"

export function useProjectCategories(projectId: string) {
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
      toastApiError(err, "Error al cargar categorías");
    } finally {
      setLoading(false)
    }
  }, [projectId])

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
        toast.success("Categoría creada", {
          description: `"${created.name}" se agregó correctamente.`,
        })
      } catch (err) {
        toastApiError(err, "Error al crear categoría")
      }
    },
    [projectId, fetchCategories]
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
        toast.success("Categoría actualizada", {
          description: `"${updated.name}" se guardó correctamente.`,
        })
      } catch (err) {
        toastApiError(err, "Error al actualizar categoría")
      }
    },
    [projectId, fetchCategories]
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
        toast.success("Categoría eliminada", {
          description: `"${category.name}" fue eliminada.`,
        })
        return true
      } catch (err) {
        toastApiError(err, "Error al eliminar categoría")
        return false
      }
    },
    [projectId, fetchCategories]
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
