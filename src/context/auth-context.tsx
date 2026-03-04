"use client"

// context/auth-context.tsx
// Global authentication context.
// Provides: user, tokens, login, register, logout, loading state.
// Both tokens persist in localStorage (survives browser restarts).
// On mount, verifies existing session or refreshes if access token is missing.

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
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/api-client";
import * as authService from "@/services/auth-service";
import * as userService from "@/services/user-service";
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
  login: (email: string, password: string) => Promise<User>;
  /** Register and persist session */
  register: (email: string, password: string, fullName: string) => Promise<User>;
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
  // Check if tokens exist. With access token in sessionStorage, it persists
  // across page reloads but not browser restarts. This prevents unnecessary
  // refresh token rotation on every page reload.
  useEffect(() => {
    async function hydrate() {
      const refresh = getRefreshToken();
      const access = getAccessToken();
      
      if (!refresh) {
        setIsLoading(false);
        return;
      }

      // If we have both tokens in storage, try to verify the session
      if (access) {
        try {
          // Validate session by fetching the full user profile
          const profile = await userService.getUserProfile();
          setUser(profile as unknown as User);
          setIsLoading(false);
          return;
        } catch {
          // Access token expired or invalid, fall through to refresh
        }
      }

      // No access token or it's invalid — refresh the session
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
    async (email: string, password: string): Promise<User> => {
      setIsActionLoading(true);
      try {
        const res = await authService.login({ email, password });
        persistSession(res);
        return res.user;
      } finally {
        setIsActionLoading(false);
      }
    },
    [persistSession],
  );

  const register = useCallback(
    async (email: string, password: string, fullName: string): Promise<User> => {
      setIsActionLoading(true);
      try {
        const res = await authService.register({ email, password, fullName });
        persistSession(res);
        return res.user;
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
