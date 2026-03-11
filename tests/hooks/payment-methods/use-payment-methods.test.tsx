import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { usePaymentMethods } from "@/hooks/payment-methods/use-payment-methods"
import { ApiClientError } from "@/lib/api-client"
import type { PaymentMethodResponse } from "@/types/payment-method"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock("@/services/payment-method-service", () => ({
  getPaymentMethods: vi.fn(),
  createPaymentMethod: vi.fn(),
  updatePaymentMethod: vi.fn(),
  deletePaymentMethod: vi.fn(),
}))

import * as paymentMethodService from "@/services/payment-method-service"

const paymentMethod: PaymentMethodResponse = {
  id: "pm-1",
  name: "BAC Cuenta USD",
  type: "bank",
  currency: "USD",
  bankName: "BAC",
  accountNumber: "****1234",
  description: null,
  createdAt: "2026-03-10T00:00:00Z",
  updatedAt: "2026-03-10T00:00:00Z",
}

describe("usePaymentMethods", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(paymentMethodService.getPaymentMethods).mockResolvedValue([paymentMethod])
    vi.mocked(paymentMethodService.deletePaymentMethod).mockResolvedValue(undefined)
  })

  it("returns false and keeps payment method when delete fails with business error", async () => {
    vi.mocked(paymentMethodService.deletePaymentMethod).mockRejectedValue(
      new ApiClientError(400, {
        message:
          "No se puede eliminar el metodo de pago porque tiene gastos o ingresos activos relacionados.",
      })
    )

    const { result } = renderHook(() => usePaymentMethods())

    await waitFor(() => {
      expect(result.current.paymentMethods).toHaveLength(1)
    })

    let deleted = true
    await act(async () => {
      deleted = await result.current.mutateDelete(paymentMethod, { refetch: false })
    })

    expect(deleted).toBe(false)
    expect(paymentMethodService.deletePaymentMethod).toHaveBeenCalledWith("pm-1")
    expect(result.current.paymentMethods).toHaveLength(1)
    expect(result.current.paymentMethods[0]?.id).toBe("pm-1")
  })
})
