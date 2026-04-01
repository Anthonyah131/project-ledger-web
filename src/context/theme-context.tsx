"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type ThemePreference = "light" | "dark" | "cosmic";
export type ResolvedTheme = "light" | "dark" | "cosmic";

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}

const STORAGE_KEY = "theme-preference";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "cosmic";
}

function applyThemeToDom(resolvedTheme: ResolvedTheme) {
  if (typeof document === "undefined") return;

  const html = document.documentElement;
  html.classList.remove("light", "dark", "cosmic");
  html.classList.add(resolvedTheme);
  html.style.colorScheme = resolvedTheme === "cosmic" ? "dark" : resolvedTheme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") return "cosmic";
    const stored = localStorage.getItem(STORAGE_KEY);
    return isThemePreference(stored) ? stored : "cosmic";
  });

  const resolvedTheme: ResolvedTheme = pathname === "/" ? "cosmic" : theme;

  useEffect(() => {
    applyThemeToDom(resolvedTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme, resolvedTheme]);

  const setTheme = useCallback((nextTheme: ThemePreference) => {
    setThemeState(nextTheme);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return ctx;
}
