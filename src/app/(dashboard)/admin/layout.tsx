// app/(dashboard)/admin/layout.tsx
// Nested layout that restricts ALL /admin/* routes to admin users.

import { AuthGuard } from "@/components/auth/auth-guard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard requireAdmin>{children}</AuthGuard>
}
