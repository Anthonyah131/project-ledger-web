"use client";

// context/auth-context.tsx
// Global authentication context.
// Provides: user, tokens, login, register, logout, loading state.
// Persists refresh token in localStorage; access token stays in memory.
// On mount, if a refresh token exists, silently refreshes the session.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import {
  clearTokens,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/api-client";
import * as authService from "@/services/auth-service";
import type { User } from "@/types/user";

// ─── Context shape ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** The currently authenticated user, or null */
  user: User | null;
  /** True while the initial session check is in progress */
  isLoading: boolean;
  /** True when a login/register/logout action is in progress */
  isActionLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;

  /** Log in and persist session */
  login: (email: string, password: string) => Promise<void>;
  /** Register and persist session */
  register: (email: string, password: string, fullName: string) => Promise<void>;
  /** Log out (revoke current device) */
  logout: () => Promise<void>;
  /** Log out from all devices */
  logoutAll: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // ── Hydrate session on mount ──────────────────────────────────────────────
  useEffect(() => {
    async function hydrate() {
      const refresh = getRefreshToken();
      if (!refresh) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await authService.refreshTokens({ refreshToken: refresh });
        setAccessToken(res.accessToken);
        setRefreshToken(res.refreshToken);
        setUser(res.user);
      } catch {
        // Refresh token is invalid/expired — clear everything
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    hydrate();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Store tokens + user after a successful auth response */
  const persistSession = useCallback(
    (res: { accessToken: string; refreshToken: string; user: User }) => {
      setAccessToken(res.accessToken);
      setRefreshToken(res.refreshToken);
      setUser(res.user);
    },
    [],
  );

  // ── Actions ───────────────────────────────────────────────────────────────

  const login = useCallback(
    async (email: string, password: string) => {
      setIsActionLoading(true);
      try {
        const res = await authService.login({ email, password });
        persistSession(res);
      } finally {
        setIsActionLoading(false);
      }
    },
    [persistSession],
  );

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      setIsActionLoading(true);
      try {
        const res = await authService.register({ email, password, fullName });
        persistSession(res);
      } finally {
        setIsActionLoading(false);
      }
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    try {
      if (refresh) {
        await authService.revokeToken({ refreshToken: refresh });
      }
    } catch {
      // Even if revocation fails, clear locally
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await authService.revokeAllTokens();
    } catch {
      // Even if revocation fails, clear locally
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  // ── Memoized value ────────────────────────────────────────────────────────

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isActionLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      logoutAll,
    }),
    [user, isLoading, isActionLoading, login, register, logout, logoutAll],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
