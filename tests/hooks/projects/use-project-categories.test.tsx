import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useProjectCategories } from "@/hooks/projects/use-project-categories"
import { ApiClientError } from "@/lib/api-client"
import type { CategoryResponse } from "@/types/category"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock("@/services/category-service", () => ({
  getCategories: vi.fn(),
  deleteCategory: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
}))

import * as categoryService from "@/services/category-service"

const category: CategoryResponse = {
  id: "cat-1",
  projectId: "project-1",
  name: "Comidas",
  description: null,
  isDefault: false,
  budgetAmount: null,
  createdAt: "2026-03-10T00:00:00Z",
  updatedAt: "2026-03-10T00:00:00Z",
}

describe("useProjectCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(categoryService.getCategories).mockResolvedValue([category])
    vi.mocked(categoryService.deleteCategory).mockResolvedValue(undefined)
  })

  it("returns false and keeps the category when delete fails with business error", async () => {
    vi.mocked(categoryService.deleteCategory).mockRejectedValue(
      new ApiClientError(400, {
        message:
          "No se puede eliminar la categoría porque tiene gastos o ingresos activos relacionados.",
      })
    )

    const { result } = renderHook(() => useProjectCategories("project-1"))

    await waitFor(() => {
      expect(result.current.categories).toHaveLength(1)
    })

    let deleted = true
    await act(async () => {
      deleted = await result.current.mutateDelete(category, { refetch: false })
    })

    expect(deleted).toBe(false)
    expect(categoryService.deleteCategory).toHaveBeenCalledWith("project-1", "cat-1")
    expect(result.current.categories).toHaveLength(1)
    expect(result.current.categories[0]?.id).toBe("cat-1")
  })
})
