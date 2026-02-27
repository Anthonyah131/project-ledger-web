"use client"

// hooks/projects/use-project-categories.ts
// State management for categories within a project detail view.

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { toast } from "sonner"
import * as categoryService from "@/services/category-service"
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
  const [debouncedQuery, setDebouncedQuery] = useState("")

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

  // ── Debounce query ────────────────────────────────────────

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

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
        const msg = err instanceof Error ? err.message : "Error al crear categoría"
        toast.error("Error al crear categoría", { description: msg })
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
        const msg = err instanceof Error ? err.message : "Error al actualizar categoría"
        toast.error("Error al actualizar", { description: msg })
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
        const msg = err instanceof Error ? err.message : "Error al eliminar categoría"
        toast.error("Error al eliminar", { description: msg })
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
