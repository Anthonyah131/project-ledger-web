import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useProjectAlternativeCurrencies } from "@/hooks/projects/use-project-alternative-currencies"
import { ApiClientError } from "@/lib/api-client"
import type { CurrencyResponse } from "@/types/currency"
import type { ProjectAlternativeCurrencyResponse } from "@/types/project-alternative-currency"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock("@/services/alternative-currency-service", () => ({
  getAlternativeCurrencies: vi.fn(),
  addAlternativeCurrency: vi.fn(),
  deleteAlternativeCurrency: vi.fn(),
}))

vi.mock("@/services/currency-service", () => ({
  getCurrencies: vi.fn(),
}))

import * as alternativeCurrencyService from "@/services/alternative-currency-service"
import * as currencyService from "@/services/currency-service"

const existingCurrency: ProjectAlternativeCurrencyResponse = {
  id: "pac-1",
  currencyCode: "USD",
  currencyName: "United States Dollar",
  currencySymbol: "$",
  createdAt: "2026-03-07T00:00:00Z",
}

const addedCurrency: ProjectAlternativeCurrencyResponse = {
  id: "pac-2",
  currencyCode: "EUR",
  currencyName: "Euro",
  currencySymbol: "EUR",
  createdAt: "2026-03-07T00:00:00Z",
}

const catalog: CurrencyResponse[] = [
  { code: "CRC", name: "Costa Rican Colon", symbol: "CRC", decimalPlaces: 2, isActive: true },
  { code: "USD", name: "United States Dollar", symbol: "$", decimalPlaces: 2, isActive: true },
  { code: "EUR", name: "Euro", symbol: "EUR", decimalPlaces: 2, isActive: true },
]

describe("useProjectAlternativeCurrencies", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(alternativeCurrencyService.getAlternativeCurrencies).mockResolvedValue([
      existingCurrency,
    ])
    vi.mocked(alternativeCurrencyService.addAlternativeCurrency).mockResolvedValue(
      addedCurrency
    )
    vi.mocked(alternativeCurrencyService.deleteAlternativeCurrency).mockResolvedValue(
      undefined
    )
    vi.mocked(currencyService.getCurrencies).mockResolvedValue(catalog)
  })

  it("loads project currencies and catalog on mount", async () => {
    const { result } = renderHook(() =>
      useProjectAlternativeCurrencies("project-1")
    )

    await waitFor(() => {
      expect(alternativeCurrencyService.getAlternativeCurrencies).toHaveBeenCalledWith(
        "project-1"
      )
      expect(currencyService.getCurrencies).toHaveBeenCalledTimes(1)
      expect(result.current.currencies).toHaveLength(1)
      expect(result.current.allCurrencies).toHaveLength(3)
    })
  })

  it("adds and removes alternative currencies", async () => {
    const { result } = renderHook(() =>
      useProjectAlternativeCurrencies("project-1")
    )

    await waitFor(() => expect(result.current.currencies).toHaveLength(1))

    await act(async () => {
      await result.current.mutateAdd({ currencyCode: "EUR" })
    })

    expect(alternativeCurrencyService.addAlternativeCurrency).toHaveBeenCalledWith(
      "project-1",
      { currencyCode: "EUR" }
    )
    await waitFor(() => expect(result.current.currencies).toHaveLength(2))

    const eurCurrency = result.current.currencies.find((item) => item.currencyCode === "EUR")
    expect(eurCurrency).toBeDefined()

    await act(async () => {
      await result.current.mutateDelete(eurCurrency!)
    })

    expect(alternativeCurrencyService.deleteAlternativeCurrency).toHaveBeenCalledWith(
      "project-1",
      "EUR"
    )
    await waitFor(() => expect(result.current.currencies).toHaveLength(1))
  })

  it("returns false and keeps currency when delete fails with business error", async () => {
    vi.mocked(alternativeCurrencyService.deleteAlternativeCurrency).mockRejectedValue(
      new ApiClientError(400, {
        message:
          "No se puede eliminar la moneda alternativa porque hay gastos o ingresos activos que la usan en este proyecto.",
      })
    )

    const { result } = renderHook(() =>
      useProjectAlternativeCurrencies("project-1")
    )

    await waitFor(() => expect(result.current.currencies).toHaveLength(1))

    let deleted = true
    await act(async () => {
      deleted = await result.current.mutateDelete(existingCurrency)
    })

    expect(deleted).toBe(false)
    expect(alternativeCurrencyService.deleteAlternativeCurrency).toHaveBeenCalledWith(
      "project-1",
      "USD"
    )
    expect(result.current.currencies).toHaveLength(1)
    expect(result.current.currencies[0]?.id).toBe("pac-1")
  })
})
