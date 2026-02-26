"use client";

// components/providers/auth-provider.tsx
// Auth provider — provides authentication context to the app
// Wraps session management (NextAuth SessionProvider or custom)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return children;
}
