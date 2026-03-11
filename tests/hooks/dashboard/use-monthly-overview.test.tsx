import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useMonthlyOverview } from "@/hooks/dashboard/use-monthly-overview"

vi.mock("@/lib/error-utils", () => ({
  toastApiError: vi.fn((err: unknown) => err instanceof Error ? err.message : "Error inesperado"),
}))

vi.mock("@/services/dashboard-service", () => ({
  getDashboardMonthlySummary: vi.fn(),
  getDashboardMonthlyTrend: vi.fn(),
  getDashboardMonthlyTopCategories: vi.fn(),
  getDashboardMonthlyPaymentMethods: vi.fn(),
}))

vi.mock("@/services/project-service", () => ({
  getProjects: vi.fn(),
}))

import { toastApiError } from "@/lib/error-utils"
import {
  getDashboardMonthlyPaymentMethods,
  getDashboardMonthlySummary,
  getDashboardMonthlyTopCategories,
  getDashboardMonthlyTrend,
} from "@/services/dashboard-service"
import { getProjects } from "@/services/project-service"

const summaryResponse = {
  month: "2026-03",
  navigation: {
    previousMonth: "2026-02",
    currentMonth: "2026-03",
    nextMonth: "2026-04",
    isCurrentMonth: true,
    hasPreviousData: true,
    hasNextData: false,
  },
  currencyCode: "USD",
  generatedAt: "2026-03-10T00:00:00Z",
  summary: {
    totalSpent: 100,
    totalIncome: 200,
    netBalance: 100,
  },
  comparison: {
    previousMonth: "2026-02",
    spentDelta: 10,
    spentDeltaPercentage: 5,
    incomeDelta: 20,
    incomeDeltaPercentage: 10,
    netDelta: 10,
  },
  alerts: [],
}

const trendResponse = {
  month: "2026-03",
  currencyCode: "USD",
  trendByDay: [
    {
      date: "2026-03-10",
      spent: 100,
      income: 200,
      net: 100,
      projectIds: ["project-1"],
      expenseCount: 1,
      incomeCount: 1,
    },
  ],
}

const categoriesResponse = {
  month: "2026-03",
  currencyCode: "USD",
  topCategories: [
    {
      categoryId: "cat-1",
      categoryName: "Operativo",
      totalAmount: 100,
      expenseCount: 1,
      percentage: 100,
      projectIds: ["project-1"],
    },
  ],
}

const paymentMethodsResponse = {
  month: "2026-03",
  currencyCode: "USD",
  paymentMethodSplit: [
    {
      paymentMethodId: "pm-1",
      paymentMethodName: "Tarjeta",
      totalAmount: 100,
      expenseCount: 1,
      percentage: 100,
    },
  ],
}

describe("useMonthlyOverview", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(getDashboardMonthlySummary).mockResolvedValue(summaryResponse)
    vi.mocked(getDashboardMonthlyTrend).mockResolvedValue(trendResponse)
    vi.mocked(getDashboardMonthlyTopCategories).mockResolvedValue(categoriesResponse)
    vi.mocked(getDashboardMonthlyPaymentMethods).mockResolvedValue(paymentMethodsResponse)
    vi.mocked(getProjects).mockResolvedValue([
      {
        id: "project-1",
        ownerUserId: "user-1",
        name: "Proyecto 1",
        description: null,
        currencyCode: "USD",
        userRole: "owner",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    ])
  })

  it("keeps dashboard data when projects request fails", async () => {
    vi.mocked(getProjects).mockRejectedValue(new Error("Forbidden"))

    const { result } = renderHook(() => useMonthlyOverview())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.data).not.toBeNull()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.projects).toEqual([])
    expect(toastApiError).not.toHaveBeenCalled()
  })

  it("shows error when a core dashboard endpoint fails", async () => {
    vi.mocked(getDashboardMonthlySummary).mockRejectedValue(new Error("Dashboard summary failed"))

    const { result } = renderHook(() => useMonthlyOverview())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe("Dashboard summary failed")
    })

    expect(result.current.data).toBeNull()
    expect(toastApiError).toHaveBeenCalledTimes(1)
  })
})
