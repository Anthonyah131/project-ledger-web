// app/(dashboard)/dashboard/layout.tsx
// Blocks admin-only users from accessing the user dashboard.

import { AuthGuard } from "@/components/auth/auth-guard"

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard requireUser>{children}</AuthGuard>
}
