import { beforeEach, describe, expect, it, vi } from "vitest"

describe("api client GET deduplication", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it("does not reuse an aborted signal-bound GET request", async () => {
    const fetchMock = vi.fn()
    let callCount = 0

    fetchMock.mockImplementation((_input: RequestInfo | URL, init?: RequestInit) => {
      callCount += 1

      if (callCount === 1) {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"))
          })
        })
      }

      return Promise.resolve(new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }))
    })

    vi.stubGlobal("fetch", fetchMock)

    const { api } = await import("@/lib/api-client")

    const firstController = new AbortController()
    const secondController = new AbortController()

    const firstPromise = api.get<{ ok: boolean }>("/dashboard/monthly-summary?month=2026-03", {
      skipAuth: true,
      signal: firstController.signal,
    })

    firstController.abort()

    const secondPromise = api.get<{ ok: boolean }>("/dashboard/monthly-summary?month=2026-03", {
      skipAuth: true,
      signal: secondController.signal,
    })

    await expect(firstPromise).rejects.toMatchObject({ name: "AbortError" })
    await expect(secondPromise).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})