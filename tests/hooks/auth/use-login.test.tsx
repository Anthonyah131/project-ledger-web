import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useLogin } from "@/hooks/auth/use-login"

const replaceMock = vi.fn()
const pushMock = vi.fn()

const authState = {
  user: null as null | { isAdmin: boolean },
  login: vi.fn(),
  isActionLoading: false,
  isAuthenticated: false,
  isLoading: false,
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
}))

vi.mock("@/context/auth-context", () => ({
  useAuth: () => authState,
}))

describe("useLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.user = null
    authState.isAuthenticated = false
    authState.isLoading = false
    authState.isActionLoading = false
    authState.login.mockReset()
    window.history.pushState({}, "", "/login")
  })

  it("redirects authenticated sessions away from login", async () => {
    authState.user = { isAdmin: false }
    authState.isAuthenticated = true

    renderHook(() => useLogin())

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard")
    })

    expect(pushMock).not.toHaveBeenCalled()
  })

  it("redirects authenticated admins to admin users", async () => {
    authState.user = { isAdmin: true }
    authState.isAuthenticated = true

    renderHook(() => useLogin())

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/admin/users")
    })

    expect(pushMock).not.toHaveBeenCalled()
  })

  it("navigates only once after a successful login", async () => {
    authState.login.mockImplementation(async () => {
      authState.user = { isAdmin: false }
      authState.isAuthenticated = true
      return {
        id: "user-1",
        email: "usuario@ejemplo.com",
        fullName: "Usuario Demo",
        isAdmin: false,
        isActive: true,
        createdAt: "2026-03-10T00:00:00Z",
        updatedAt: "2026-03-10T00:00:00Z",
      }
    })

    const { result, rerender } = renderHook(() => useLogin())

    act(() => {
      result.current.form.setValue("email", "usuario@ejemplo.com")
      result.current.form.setValue("password", "Password123*")
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    rerender()

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledTimes(1)
      expect(replaceMock).toHaveBeenCalledWith("/dashboard")
    })

    expect(pushMock).not.toHaveBeenCalled()
    expect(authState.login).toHaveBeenCalledWith("usuario@ejemplo.com", "Password123*")
  })
})