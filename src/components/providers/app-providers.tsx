"use client";

// components/providers/app-providers.tsx
// Root provider composition — combines all providers in correct nesting order
// Import and wrap: QueryProvider > AuthProvider > ThemeProvider

export function AppProviders({ children }: { children: React.ReactNode }) {
  return children;
}
