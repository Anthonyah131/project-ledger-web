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
      const msg = err instanceof Error ? err.message : "Error al cargar categorías"
      toast.error("Error al cargar categorías", { description: msg })
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

  const handleCreate = useCallback(
    async (data: CreateCategoryRequest) => {
      try {
        const created = await categoryService.createCategory(projectId, data)
        setCategories((prev) => [...prev, created])
        toast.success("Categoría creada", {
          description: `"${created.name}" se agregó correctamente.`,
        })
      } catch (err) {
        toastApiError(err, "Error al crear categoría")
      }
    },
    [projectId]
  )

  const handleEdit = useCallback(
    async (categoryId: string, data: UpdateCategoryRequest) => {
      try {
        const updated = await categoryService.updateCategory(projectId, categoryId, data)
        setCategories((prev) => prev.map((c) => (c.id === categoryId ? updated : c)))
        toast.success("Categoría actualizada", {
          description: `"${updated.name}" se guardó correctamente.`,
        })
      } catch (err) {
        toastApiError(err, "Error al actualizar categoría")
      }
    },
    [projectId]
  )

  const handleDelete = useCallback(
    async (category: CategoryResponse) => {
      try {
        await categoryService.deleteCategory(projectId, category.id)
        setCategories((prev) => prev.filter((c) => c.id !== category.id))
        toast.success("Categoría eliminada", {
          description: `"${category.name}" fue eliminada.`,
        })
      } catch (err) {
        toastApiError(err, "Error al eliminar categoría")
      }
    },
    [projectId]
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
    handleCreate,
    handleEdit,
    handleDelete,
    refetch: fetchCategories,
  }
}
