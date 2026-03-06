// app/(dashboard)/reports/layout.tsx
// Blocks admin-only users from accessing report routes.

import { AuthGuard } from "@/components/auth/auth-guard"

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard requireUser>{children}</AuthGuard>
}
