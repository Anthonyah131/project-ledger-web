import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useProjectPaymentMethods } from "@/hooks/projects/use-project-payment-methods"
import { ApiClientError } from "@/lib/api-client"
import type { ProjectPaymentMethodResponse } from "@/types/project-payment-method"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock("@/services/project-payment-method-service", () => ({
  getProjectPaymentMethods: vi.fn(),
  linkPaymentMethod: vi.fn(),
  unlinkPaymentMethod: vi.fn(),
}))

vi.mock("@/services/payment-method-service", () => ({
  getPaymentMethods: vi.fn(),
}))

import * as projectPaymentMethodService from "@/services/project-payment-method-service"

const linkedMethod: ProjectPaymentMethodResponse = {
  id: "ppm-1",
  paymentMethodId: "pm-1",
  paymentMethodName: "BAC Cuenta USD",
  type: "bank",
  currency: "USD",
  bankName: "BAC",
  accountNumber: "****1234",
  ownerUserName: "Owner",
  linkedAt: "2026-03-10T00:00:00Z",
}

describe("useProjectPaymentMethods", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectPaymentMethodService.getProjectPaymentMethods).mockResolvedValue([
      linkedMethod,
    ])
    vi.mocked(projectPaymentMethodService.unlinkPaymentMethod).mockResolvedValue(undefined)
  })

  it("returns false and keeps linked method when unlink fails with business error", async () => {
    vi.mocked(projectPaymentMethodService.unlinkPaymentMethod).mockRejectedValue(
      new ApiClientError(400, {
        message:
          "No se puede desvincular el metodo de pago del proyecto porque tiene gastos o ingresos activos relacionados en este proyecto.",
      })
    )

    const { result } = renderHook(() => useProjectPaymentMethods("project-1"))

    await waitFor(() => {
      expect(result.current.linkedMethods).toHaveLength(1)
    })

    let unlinked = true
    await act(async () => {
      unlinked = await result.current.handleUnlink(linkedMethod)
    })

    expect(unlinked).toBe(false)
    expect(projectPaymentMethodService.unlinkPaymentMethod).toHaveBeenCalledWith(
      "project-1",
      "pm-1"
    )
    expect(result.current.linkedMethods).toHaveLength(1)
    expect(result.current.linkedMethods[0]?.id).toBe("ppm-1")
  })
})
