// lib/api-client.ts
// Centralized API client with:
//   - Automatic base URL from env
//   - Automatic Authorization header injection
//   - Development-only request/response logging (interceptor)
//   - Automatic token refresh on 401
//   - Typed helper methods (get, post, postForm, put, patch, delete)

// ─── Constants ─────────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5192/api";
const IS_DEV = process.env.NEXT_PUBLIC_ENV === "development";

// ─── Token storage ────────────────────────────────────────────────────────────
// Both tokens stored in localStorage for persistence across browser sessions.
// Trade-off: slightly less secure than sessionStorage, but much better UX.
// Access token expires in 24h, refresh token in 7 days.

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

export function setRefreshToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("refreshToken", token);
  } else {
    localStorage.removeItem("refreshToken");
  }
}

export function clearTokens() {
  setAccessToken(null);
  setRefreshToken(null);
}

// ─── Language preference ──────────────────────────────────────────────────────
// Stores the user's preferred API language in localStorage.
// Used to send Accept-Language on every request.
// Default: "es" (Spanish). Supported: "en", "es".

const DEFAULT_LANGUAGE = "es";

export function getLanguage(): string {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  return localStorage.getItem("language") ?? DEFAULT_LANGUAGE;
}

export function setLanguage(lang: string | null) {
  if (typeof window === "undefined") return;
  if (lang) {
    localStorage.setItem("language", lang);
  } else {
    localStorage.removeItem("language");
  }
}

// ─── Dev logger (interceptor) ──────────────────────────────────────────────────

function logRequest(method: string, url: string, body?: unknown) {
  if (!IS_DEV) return;

  console.groupCollapsed(
    `%c→ ${method.toUpperCase()} %c${url}`,
    "color: #22c55e; font-weight: bold",
    "color: #a1a1aa",
  );
  if (body) console.log("Body:", body);
  console.groupEnd();
}

function logResponse(method: string, url: string, status: number, data: unknown, durationMs: number) {
  if (!IS_DEV) return;

  const color = status >= 400 ? "#ef4444" : "#3b82f6";
  console.groupCollapsed(
    `%c← ${status} %c${method.toUpperCase()} %c${url} %c(${durationMs}ms)`,
    `color: ${color}; font-weight: bold`,
    "color: #22c55e; font-weight: bold",
    "color: #a1a1aa",
    "color: #6b7280; font-style: italic",
  );
  console.log("Data:", data);
  console.groupEnd();
}

function logError(method: string, url: string, error: unknown) {
  if (!IS_DEV) return;

  console.groupCollapsed(
    `%c✖ NETWORK ERROR %c${method.toUpperCase()} %c${url}`,
    "color: #ef4444; font-weight: bold",
    "color: #22c55e; font-weight: bold",
    "color: #a1a1aa",
  );
  console.warn(error);
  console.groupEnd();
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

// ─── Refresh lock ──────────────────────────────────────────────────────────────
// Prevents multiple concurrent refresh requests
let refreshPromise: Promise<boolean> | null = null;
const pendingGetRequests = new Map<string, Promise<unknown>>();

function getPendingGetKey(url: string, headers: Record<string, string>) {
  return JSON.stringify({
    url,
    authorization: headers.Authorization ?? null,
    headers,
  });
}

async function attemptTokenRefresh(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  // If a refresh is already in-flight, wait for it
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });

      if (!res.ok) {
        clearTokens();
        return false;
      }

      const data = await res.json();
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      return true;
    } catch {
      clearTokens();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Core fetch wrapper ────────────────────────────────────────────────────────

export interface ApiRequestOptions {
  /** Skip the Authorization header (for public endpoints like login/register) */
  skipAuth?: boolean;
  /** Additional headers */
  headers?: Record<string, string>;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public data: unknown,
  ) {
    super(typeof data === "object" && data !== null && "message" in data
      ? (data as { message: string }).message
      : `Request failed with status ${status}`);
    this.name = "ApiClientError";
  }

  /** Machine-readable error code from the API (e.g. "PAYMENT_METHOD_NOT_FOUND") */
  get code(): string | undefined {
    if (typeof this.data === "object" && this.data !== null && "code" in this.data) {
      return (this.data as { code: string }).code;
    }
    return undefined;
  }

  /** Feature name from plan errors — `PLAN_LIMIT_EXCEEDED` or `PLAN_DENIED` (e.g. "MaxProjects", "CanShareProjects") */
  get feature(): string | undefined {
    if (typeof this.data === "object" && this.data !== null && "feature" in this.data) {
      return (this.data as { feature: string }).feature;
    }
    return undefined;
  }

  /**
   * True when a 403 is caused by a plan restriction:
   * - `PLAN_LIMIT_EXCEEDED` — user hit a count limit (e.g. max projects)
   * - `PLAN_DENIED`         — feature is not available on the user's plan
   * Both should trigger upgrade prompts instead of generic error toasts.
   */
  get isPlanError(): boolean {
    return this.code === "PLAN_LIMIT_EXCEEDED" || this.code === "PLAN_DENIED";
  }

  /**
   * True when a 400 carries a business-rule message (e.g. obligation overpayment,
   * invalid OTP, validation error). Show as informational warning, not a generic error toast.
   */
  get isBusinessError(): boolean {
    return this.status === 400;
  }
}

function getNetworkError() {
  return new ApiClientError(0, {
    message: "No se pudo conectar con el servidor. Verifica que el backend esté levantado y la URL de API sea correcta.",
  });
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: ApiRequestOptions = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const isFormDataBody = typeof FormData !== "undefined" && body instanceof FormData;

  const headers: Record<string, string> = { ...options.headers };
  headers["Accept-Language"] = headers["Accept-Language"] ?? getLanguage();
  if (!isFormDataBody) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  const currentAccessToken = getAccessToken();
  if (!options.skipAuth && currentAccessToken) {
    headers["Authorization"] = `Bearer ${currentAccessToken}`;
  }

  const executeRequest = async (): Promise<T> => {
    logRequest(method, url, body);
    const start = performance.now();

    let res: Response;
    try {
      const requestBody = body === undefined
        ? undefined
        : isFormDataBody
          ? body
          : JSON.stringify(body);

      res = await fetch(url, {
        method,
        headers,
        body: requestBody,
        signal: options.signal,
      });
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      logError(method, url, error);
      throw getNetworkError();
    }

    if (res.status === 401 && !options.skipAuth) {
      const refreshed = await attemptTokenRefresh();
      if (refreshed) {
        const newAccessToken = getAccessToken();
        headers["Authorization"] = `Bearer ${newAccessToken}`;
        try {
          const retryBody = body === undefined
            ? undefined
            : isFormDataBody
              ? body
              : JSON.stringify(body);

          res = await fetch(url, {
            method,
            headers,
            body: retryBody,
            signal: options.signal,
          });
        } catch (error) {
          if (isAbortError(error)) {
            throw error;
          }

          logError(method, url, error);
          throw getNetworkError();
        }
      }
    }

    const duration = Math.round(performance.now() - start);

    let data: unknown;
    const contentType = res.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    logResponse(method, url, res.status, data, duration);

    if (!res.ok) {
      throw new ApiClientError(res.status, data);
    }

    return data as T;
  };

  if (method === "GET" && !options.signal) {
    const pendingKey = getPendingGetKey(url, headers);
    const pendingRequest = pendingGetRequests.get(pendingKey);

    if (pendingRequest) {
      return pendingRequest as Promise<T>;
    }

    const requestPromise = executeRequest().finally(() => {
      pendingGetRequests.delete(pendingKey);
    });

    pendingGetRequests.set(pendingKey, requestPromise);
    return requestPromise;
  }

  return executeRequest();
}

// ─── Public helpers ────────────────────────────────────────────────────────────

export const api = {
  get<T>(path: string, options?: ApiRequestOptions) {
    return request<T>("GET", path, undefined, options);
  },

  post<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>("POST", path, body, options);
  },

  postForm<T>(path: string, body: FormData, options?: ApiRequestOptions) {
    return request<T>("POST", path, body, options);
  },

  put<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>("PUT", path, body, options);
  },

  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>("PATCH", path, body, options);
  },

  delete<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>("DELETE", path, body, options);
  },
};
