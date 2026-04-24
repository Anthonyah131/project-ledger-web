import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { api, ApiClientError, setAccessToken, getAccessToken, setRefreshToken, getRefreshToken, clearTokens, getLanguage, setLanguage } from "@/lib/api-client";

const API_BASE = "http://localhost:5192/api";

function createFetchMock(response: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: new Map([["content-type", "application/json"]]),
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response)),
  });
}

describe("api-client", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    fetchMock = createFetchMock({ data: "success" });
    global.fetch = fetchMock;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("token management", () => {
    it("should store and retrieve access token", () => {
      setAccessToken("test-access-token");
      expect(getAccessToken()).toBe("test-access-token");
    });

    it("should return null when no access token exists", () => {
      expect(getAccessToken()).toBeNull();
    });

    it("should remove access token when set to null", () => {
      setAccessToken("test-token");
      setAccessToken(null);
      expect(getAccessToken()).toBeNull();
    });

    it("should store and retrieve refresh token", () => {
      setRefreshToken("test-refresh-token");
      expect(getRefreshToken()).toBe("test-refresh-token");
    });

    it("should return null when no refresh token exists", () => {
      expect(getRefreshToken()).toBeNull();
    });

    it("should clear both tokens", () => {
      setAccessToken("access");
      setRefreshToken("refresh");
      clearTokens();
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe("language management", () => {
    it("should get default language as es", () => {
      expect(getLanguage()).toBe("es");
    });

    it("should store and retrieve language", () => {
      setLanguage("en");
      expect(getLanguage()).toBe("en");
    });

    it("should return default when language is null", () => {
      setLanguage("en");
      setLanguage(null);
      expect(getLanguage()).toBe("es");
    });
  });

  describe("api.get", () => {
    it("should call GET with correct URL", async () => {
      fetchMock = createFetchMock({ id: 1 });
      global.fetch = fetchMock;

      await api.get("/projects");

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/projects`,
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should include Authorization header when token exists", async () => {
      setAccessToken("bearer-token");
      fetchMock = createFetchMock({});
      global.fetch = fetchMock;

      await api.get("/projects");

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: "Bearer bearer-token" }),
        })
      );
    });

    it("should skip Authorization header when skipAuth is true", async () => {
      setAccessToken("bearer-token");
      fetchMock = createFetchMock({});
      global.fetch = fetchMock;

      await api.get("/auth/login", { skipAuth: true });

      const call = fetchMock.mock.calls[0];
      const headers = call[1].headers as Record<string, string>;
      expect(headers.Authorization).toBeUndefined();
    });

    it("should include Accept-Language header", async () => {
      setLanguage("en");
      fetchMock = createFetchMock({});
      global.fetch = fetchMock;

      await api.get("/projects");

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ "Accept-Language": "en" }),
        })
      );
    });

    it("should deduplicate concurrent GET requests to same URL", async () => {
      fetchMock = createFetchMock({ data: "test" });
      global.fetch = fetchMock;

      const promise1 = api.get("/projects");
      const promise2 = api.get("/projects");

      const results = await Promise.all([promise1, promise2]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(results[0]).toEqual(results[1]);
    });

    it("should not deduplicate GET requests with different URLs", async () => {
      fetchMock = createFetchMock({});
      global.fetch = fetchMock;

      await Promise.all([
        api.get("/projects"),
        api.get("/expenses"),
      ]);

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("api.post", () => {
    it("should call POST with body as JSON", async () => {
      fetchMock = createFetchMock({ id: 1 });
      global.fetch = fetchMock;

      await api.post("/projects", { name: "Test Project" });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/projects`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Test Project" }),
        })
      );
    });

    it("should include Content-Type application/json", async () => {
      fetchMock = createFetchMock({});
      global.fetch = fetchMock;

      await api.post("/projects", {});

      const call = fetchMock.mock.calls[0];
      const headers = call[1].headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
    });

    it("should send FormData without Content-Type header", async () => {
      fetchMock = createFetchMock({});
      global.fetch = fetchMock;

      const formData = new FormData();
      formData.append("file", new Blob(["test"]));

      await api.postForm("/upload", formData);

      const call = fetchMock.mock.calls[0];
      const headers = call[1].headers as Record<string, string>;
      expect(headers["Content-Type"]).toBeUndefined();
    });
  });

  describe("api.put", () => {
    it("should call PUT with body", async () => {
      fetchMock = createFetchMock({ updated: true });
      global.fetch = fetchMock;

      await api.put("/projects/1", { name: "Updated" });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/projects/1`,
        expect.objectContaining({ method: "PUT" })
      );
    });
  });

  describe("api.patch", () => {
    it("should call PATCH with body", async () => {
      fetchMock = createFetchMock({ updated: true });
      global.fetch = fetchMock;

      await api.patch("/projects/1", { name: "Patched" });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/projects/1`,
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  describe("api.delete", () => {
    it("should call DELETE", async () => {
      fetchMock = createFetchMock({ deleted: true });
      global.fetch = fetchMock;

      await api.delete("/projects/1");

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/projects/1`,
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("should call DELETE with body", async () => {
      fetchMock = createFetchMock({});
      global.fetch = fetchMock;

      await api.delete("/projects/1", { reason: "cleanup" });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/projects/1`,
        expect.objectContaining({
          method: "DELETE",
          body: JSON.stringify({ reason: "cleanup" }),
        })
      );
    });
  });

  describe("error handling", () => {
    it("should throw ApiClientError on non-ok response", async () => {
      fetchMock = createFetchMock({ message: "Not Found" }, 404);
      global.fetch = fetchMock;

      await expect(api.get("/projects/999")).rejects.toThrow(ApiClientError);
    });

    it("should include status in ApiClientError", async () => {
      fetchMock = createFetchMock({ message: "Unauthorized" }, 401);
      global.fetch = fetchMock;

      await expect(api.get("/projects")).rejects.toMatchObject({ status: 401 });
    });

    it("should include data in ApiClientError", async () => {
      const errorData = { message: "Validation failed", code: "VALIDATION_ERROR" };
      fetchMock = createFetchMock(errorData, 400);
      global.fetch = fetchMock;

      try {
        await api.get("/projects");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError);
        expect((error as ApiClientError).data).toEqual(errorData);
      }
    });

    it("should extract code from error data", async () => {
      const errorData = { message: "Error", code: "PROJECT_NOT_FOUND" };
      fetchMock = createFetchMock(errorData, 404);
      global.fetch = fetchMock;

      try {
        await api.get("/projects/999");
      } catch (error) {
        expect((error as ApiClientError).code).toBe("PROJECT_NOT_FOUND");
      }
    });

    it("should extract feature from plan error", async () => {
      const errorData = { message: "Limit reached", code: "PLAN_LIMIT_EXCEEDED", feature: "MaxProjects" };
      fetchMock = createFetchMock(errorData, 403);
      global.fetch = fetchMock;

      try {
        await api.get("/projects");
      } catch (error) {
        expect((error as ApiClientError).feature).toBe("MaxProjects");
      }
    });

    it("should return true for isPlanError on PLAN_LIMIT_EXCEEDED", async () => {
      const errorData = { message: "Limit reached", code: "PLAN_LIMIT_EXCEEDED" };
      fetchMock = createFetchMock(errorData, 403);
      global.fetch = fetchMock;

      try {
        await api.get("/projects");
      } catch (error) {
        expect((error as ApiClientError).isPlanError).toBe(true);
      }
    });

    it("should return true for isPlanError on PLAN_DENIED", async () => {
      const errorData = { message: "Feature not available", code: "PLAN_DENIED" };
      fetchMock = createFetchMock(errorData, 403);
      global.fetch = fetchMock;

      try {
        await api.get("/projects");
      } catch (error) {
        expect((error as ApiClientError).isPlanError).toBe(true);
      }
    });

    it("should return true for isBusinessError on 400", async () => {
      const errorData = { message: "Invalid operation" };
      fetchMock = createFetchMock(errorData, 400);
      global.fetch = fetchMock;

      try {
        await api.post("/obligations", {});
      } catch (error) {
        expect((error as ApiClientError).isBusinessError).toBe(true);
      }
    });

    it("should return false for isBusinessError on non-400", async () => {
      const errorData = { message: "Server error" };
      fetchMock = createFetchMock(errorData, 500);
      global.fetch = fetchMock;

      try {
        await api.get("/projects");
      } catch (error) {
        expect((error as ApiClientError).isBusinessError).toBe(false);
      }
    });

    it("should throw network error when fetch fails", async () => {
      fetchMock = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
      global.fetch = fetchMock;

      try {
        await api.get("/projects");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError);
        expect((error as ApiClientError).status).toBe(0);
        expect((error as ApiClientError).data).toEqual({
          message: "No se pudo conectar con el servidor. Verifica que el backend esté levantado y la URL de API sea correcta.",
        });
      }
    });
  });

  describe("token refresh on 401", () => {
    it("should attempt token refresh on 401", async () => {
      setRefreshToken("valid-refresh-token");

      const refreshFetch = createFetchMock({ accessToken: "new-access", refreshToken: "new-refresh" });
      const mainFetch = vi.fn()
        .mockResolvedValueOnce({ ok: false, status: 401, headers: new Map([["content-type", "application/json"]]), json: vi.fn().mockResolvedValue({}), text: vi.fn().mockResolvedValue("") })
        .mockResolvedValueOnce({ ok: true, status: 200, headers: new Map([["content-type", "application/json"]]), json: vi.fn().mockResolvedValue({ data: "success" }), text: vi.fn().mockResolvedValue("") });

      global.fetch = (url: string, options?: RequestInit) => {
        if (url.includes("/auth/refresh")) return refreshFetch(url, options);
        return mainFetch(url, options);
      };

      const result = await api.get("/projects");

      expect(result).toEqual({ data: "success" });
    });

    it("should retry request after successful token refresh", async () => {
      setAccessToken("expired-token");
      setRefreshToken("valid-refresh");

      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 401,
            headers: new Map([["content-type", "application/json"]]),
            json: vi.fn().mockResolvedValue({}),
            text: vi.fn().mockResolvedValue(""),
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Map([["content-type", "application/json"]]),
          json: vi.fn().mockResolvedValue({ data: "retry-success" }),
          text: vi.fn().mockResolvedValue(""),
        });
      });

      const refreshMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([["content-type", "application/json"]]),
        json: vi.fn().mockResolvedValue({ accessToken: "new-token", refreshToken: "new-refresh" }),
        text: vi.fn().mockResolvedValue(""),
      });

      const originalFetch = global.fetch;
      global.fetch = (url: string, options?: RequestInit) => {
        if (url.includes("/auth/refresh")) return refreshMock(url, options);
        return originalFetch(url, options);
      };

      const result = await api.get("/projects");
      expect(result).toEqual({ data: "retry-success" });
    });

    it("should not refresh if skipAuth is true", async () => {
      setRefreshToken("refresh-token");

      const fetchWith401 = createFetchMock({}, 401);
      global.fetch = fetchWith401;

      await expect(api.get("/auth/login", { skipAuth: true })).rejects.toMatchObject({ status: 401 });
    });

    it("should not refresh if no refresh token exists", async () => {
      clearTokens();
      global.fetch = createFetchMock({}, 401);

      await expect(api.get("/projects")).rejects.toMatchObject({ status: 401 });
    });
  });

  describe("api.postForm", () => {
    it("should send FormData without Content-Type header", async () => {
      fetchMock = createFetchMock({ uploaded: true });
      global.fetch = fetchMock;

      const formData = new FormData();
      formData.append("name", "test");
      formData.append("file", new Blob(["content"], { type: "image/png" }), "test.png");

      await api.postForm("/upload", formData);

      const call = fetchMock.mock.calls[0];
      const headers = call[1].headers as Record<string, string>;
      expect(headers["Content-Type"]).toBeUndefined();
      expect(call[1].body).toBeInstanceOf(FormData);
    });
  });

  describe("custom headers", () => {
    it("should merge custom headers with default headers", async () => {
      fetchMock = createFetchMock({});
      global.fetch = fetchMock;

      await api.get("/projects", {
        headers: { "X-Custom-Header": "custom-value" },
      });

      const call = fetchMock.mock.calls[0];
      const headers = call[1].headers as Record<string, string>;
      expect(headers["X-Custom-Header"]).toBe("custom-value");
      expect(headers["Accept-Language"]).toBe("es");
    });

    it("should allow overriding Accept-Language via headers", async () => {
      fetchMock = createFetchMock({});
      global.fetch = fetchMock;

      await api.get("/projects", {
        headers: { "Accept-Language": "fr" },
      });

      const call = fetchMock.mock.calls[0];
      const headers = call[1].headers as Record<string, string>;
      expect(headers["Accept-Language"]).toBe("fr");
    });
  });

  describe("AbortSignal", () => {
    it("should pass signal to fetch", async () => {
      fetchMock = createFetchMock({});
      global.fetch = fetchMock;

      const controller = new AbortController();
      await api.get("/projects", { signal: controller.signal });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal: controller.signal })
      );
    });

    it("should not deduplicate requests with signal", async () => {
      fetchMock = createFetchMock({});
      global.fetch = fetchMock;

      const controller = new AbortController();
      await Promise.all([
        api.get("/projects", { signal: controller.signal }),
        api.get("/projects", { signal: controller.signal }),
      ]);

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
