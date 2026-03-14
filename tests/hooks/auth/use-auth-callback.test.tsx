import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useAuthCallback } from "@/hooks/auth/use-auth-callback"
import { ApiClientError } from "@/lib/api-client"

const replaceMock = vi.fn()
const loginWithAccessTokenMock = vi.fn()
let searchParamsState = new URLSearchParams()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
  useSearchParams: () => ({
    get: (key: string) => searchParamsState.get(key),
  }),
}))

vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    loginWithAccessToken: loginWithAccessTokenMock,
  }),
}))

describe("useAuthCallback", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchParamsState = new URLSearchParams()
  })

  it("redirects to dashboard when token is valid", async () => {
    searchParamsState = new URLSearchParams("token=valid-token")
    loginWithAccessTokenMock.mockResolvedValue({ isAdmin: false })

    renderHook(() => useAuthCallback())

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard")
    })

    expect(loginWithAccessTokenMock).toHaveBeenCalledWith("valid-token")
  })

  it("uses safe redirectTo query when provided", async () => {
    searchParamsState = new URLSearchParams("token=valid-token&redirectTo=/projects")
    loginWithAccessTokenMock.mockResolvedValue({ isAdmin: false })

    renderHook(() => useAuthCallback())

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/projects")
    })
  })

  it("shows mapped error when callback returns error code", async () => {
    searchParamsState = new URLSearchParams("error=google_auth_failed")

    const { result } = renderHook(() => useAuthCallback())

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false)
    })

    expect(result.current.errorMessage).toContain("Google")
    expect(loginWithAccessTokenMock).not.toHaveBeenCalled()
  })

  it("shows auth error message when backend rejects token", async () => {
    searchParamsState = new URLSearchParams("token=expired")
    loginWithAccessTokenMock.mockRejectedValue(
      new ApiClientError(401, { message: "Token invalido" }),
    )

    const { result } = renderHook(() => useAuthCallback())

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false)
    })

    expect(result.current.errorMessage).toContain("no es valida")
  })
})
