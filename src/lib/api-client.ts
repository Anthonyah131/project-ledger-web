// lib/api-client.ts
// Centralized API client with:
//   - Automatic base URL from env
//   - Automatic Authorization header injection
//   - Development-only request/response logging (interceptor)
//   - Automatic token refresh on 401
//   - Typed helper methods (get, post, put, patch, delete)

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

// ─── Refresh lock ──────────────────────────────────────────────────────────────
// Prevents multiple concurrent refresh requests
let refreshPromise: Promise<boolean> | null = null;

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

  /**
   * True when a 403 is caused by plan limits (PlanLimitExceededException).
   * The backend message will contain "plan" (e.g. "Your plan does not allow …").
   * Use this to show "upgrade" prompts instead of generic forbidden errors.
   */
  get isPlanError(): boolean {
    return this.status === 403 && this.message.toLowerCase().includes("plan");
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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const currentAccessToken = getAccessToken();
  if (!options.skipAuth && currentAccessToken) {
    headers["Authorization"] = `Bearer ${currentAccessToken}`;
  }

  logRequest(method, url, body);
  const start = performance.now();

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: options.signal,
    });
  } catch (error) {
    logError(method, url, error);
    throw getNetworkError();
  }

  // ── Handle 401 — attempt token refresh once then retry ───────────────────
  if (res.status === 401 && !options.skipAuth) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      // Retry original request with new token
      const newAccessToken = getAccessToken();
      headers["Authorization"] = `Bearer ${newAccessToken}`;
      try {
        res = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: options.signal,
        });
      } catch (error) {
        logError(method, url, error);
        throw getNetworkError();
      }
    }
  }

  const duration = Math.round(performance.now() - start);

  // ── Parse response ──────────────────────────────────────────────────────
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
}

// ─── Public helpers ────────────────────────────────────────────────────────────

export const api = {
  get<T>(path: string, options?: ApiRequestOptions) {
    return request<T>("GET", path, undefined, options);
  },

  post<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
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
