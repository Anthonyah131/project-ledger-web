"use client"

// components/auth/auth-guard.tsx
// Wrapper component that protects routes by verifying authentication and roles.
// Usage:
//   <AuthGuard>...</AuthGuard>                  — requires authenticated user
//   <AuthGuard requireAdmin>...</AuthGuard>      — also requires isAdmin === true
//
// Place in route group layouts, never in individual pages.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";

interface AuthGuardProps {
  children: ReactNode;
  /**
   * When true, also verifies the user has isAdmin === true.
   * Non-admin authenticated users are redirected to /dashboard.
   */
  requireAdmin?: boolean;
  /**
   * When true, blocks admin-only users from accessing user routes.
   * Admin users are redirected to /admin/users.
   */
  requireUser?: boolean;
}

export function AuthGuard({ children, requireAdmin = false, requireUser = false }: AuthGuardProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (requireAdmin && !user?.isAdmin) {
      router.replace("/dashboard");
      return;
    }

    if (requireUser && user?.isAdmin) {
      router.replace("/admin/users");
    }
  }, [isLoading, isAuthenticated, requireAdmin, requireUser, user, router]);

  // ── While hydrating or pending redirect, show a neutral spinner ──────────
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="text-sm">{t("auth.verifyingSession")}</span>
        </div>
      </div>
    );
  }

  // ── Admin check pending redirect ──────────────────────────────────────────
  if (requireAdmin && !user?.isAdmin) {
    return null;
  }

  // ── User-only check pending redirect ────────────────────────────────────
  if (requireUser && user?.isAdmin) {
    return null;
  }

  return <>{children}</>;
}
