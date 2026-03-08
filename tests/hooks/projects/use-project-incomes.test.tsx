import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useProjectIncomes } from "@/hooks/projects/use-project-incomes"
import type { CreateIncomeRequest, IncomeResponse, UpdateIncomeRequest } from "@/types/income"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock("@/services/income-service", () => ({
  getIncomes: vi.fn(),
  createIncome: vi.fn(),
  updateIncome: vi.fn(),
  deleteIncome: vi.fn(),
}))

import * as incomeService from "@/services/income-service"

const sampleIncome: IncomeResponse = {
  id: "income-1",
  projectId: "project-1",
  categoryId: "category-1",
  categoryName: "Ventas",
  paymentMethodId: "payment-1",
  createdByUserId: "user-1",
  originalAmount: 100,
  originalCurrency: "USD",
  exchangeRate: 1,
  convertedAmount: 100,
  title: "Ingreso de prueba",
  description: null,
  incomeDate: "2026-03-07",
  receiptNumber: null,
  notes: null,
  createdAt: "2026-03-07T00:00:00Z",
  updatedAt: "2026-03-07T00:00:00Z",
  isDeleted: false,
  deletedAt: null,
  deletedByUserId: null,
  currencyExchanges: [],
}

const pageResponse = {
  items: [sampleIncome],
  totalCount: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

describe("useProjectIncomes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(incomeService.getIncomes).mockResolvedValue(pageResponse)
    vi.mocked(incomeService.createIncome).mockResolvedValue(sampleIncome)
    vi.mocked(incomeService.updateIncome).mockResolvedValue(sampleIncome)
    vi.mocked(incomeService.deleteIncome).mockResolvedValue(undefined)
  })

  it("fetches incomes on mount", async () => {
    const { result } = renderHook(() => useProjectIncomes("project-1"))

    await waitFor(() => {
      expect(incomeService.getIncomes).toHaveBeenCalledTimes(1)
      expect(result.current.incomes).toHaveLength(1)
    })
  })

  it("creates an income and refetches list", async () => {
    const createPayload: CreateIncomeRequest = {
      title: "Nuevo ingreso",
      categoryId: "category-1",
      paymentMethodId: "payment-1",
      originalAmount: 500,
      originalCurrency: "USD",
      exchangeRate: 1,
      convertedAmount: 500,
      incomeDate: "2026-03-07",
    }

    const { result } = renderHook(() => useProjectIncomes("project-1"))

    await waitFor(() => expect(incomeService.getIncomes).toHaveBeenCalledTimes(1))

    await act(async () => {
      await result.current.mutateCreate(createPayload)
    })

    expect(incomeService.createIncome).toHaveBeenCalledWith("project-1", createPayload)
    await waitFor(() => expect(incomeService.getIncomes).toHaveBeenCalledTimes(2))
  })

  it("updates and deletes an income then refetches list", async () => {
    const updatePayload: UpdateIncomeRequest = {
      title: "Ingreso actualizado",
      categoryId: "category-1",
      paymentMethodId: "payment-1",
      originalAmount: 700,
      originalCurrency: "USD",
      exchangeRate: 1,
      convertedAmount: 700,
      incomeDate: "2026-03-08",
    }

    const { result } = renderHook(() => useProjectIncomes("project-1"))
    await waitFor(() => expect(incomeService.getIncomes).toHaveBeenCalledTimes(1))

    await act(async () => {
      await result.current.mutateUpdate(sampleIncome.id, updatePayload)
    })

    expect(incomeService.updateIncome).toHaveBeenCalledWith(
      "project-1",
      sampleIncome.id,
      updatePayload
    )

    await act(async () => {
      await result.current.mutateDelete(sampleIncome)
    })

    expect(incomeService.deleteIncome).toHaveBeenCalledWith("project-1", sampleIncome.id)
    await waitFor(() => expect(incomeService.getIncomes).toHaveBeenCalledTimes(3))
  })
})
