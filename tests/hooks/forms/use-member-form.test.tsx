import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useAddMemberForm } from "@/hooks/forms/use-member-form"

describe("useAddMemberForm", () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("cierra y resetea el formulario cuando el alta es exitosa", async () => {
    const onAdd = vi.fn().mockResolvedValue(true)
    const { result } = renderHook(() => useAddMemberForm({ onAdd, onClose }))

    act(() => {
      result.current.form.setValue("email", "miembro@ejemplo.com")
      result.current.form.setValue("role", "viewer")
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(onAdd).toHaveBeenCalledWith({
      email: "miembro@ejemplo.com",
      role: "viewer",
    })
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(result.current.form.getValues()).toEqual({
      email: "",
      role: "editor",
    })
  })

  it("mantiene el formulario abierto cuando el alta falla", async () => {
    const onAdd = vi.fn().mockResolvedValue(false)
    const { result } = renderHook(() => useAddMemberForm({ onAdd, onClose }))

    act(() => {
      result.current.form.setValue("email", "owner@ejemplo.com")
      result.current.form.setValue("role", "editor")
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(onAdd).toHaveBeenCalledWith({
      email: "owner@ejemplo.com",
      role: "editor",
    })
    expect(onClose).not.toHaveBeenCalled()
    expect(result.current.form.getValues()).toEqual({
      email: "owner@ejemplo.com",
      role: "editor",
    })
  })
})