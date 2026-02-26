"use client";

// app/error.tsx
// Global error boundary — catches unhandled errors in the app
// Must be a Client Component

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return null;
}
