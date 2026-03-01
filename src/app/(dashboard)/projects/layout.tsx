// app/(dashboard)/projects/layout.tsx
// Blocks admin-only users from accessing project routes.

import { AuthGuard } from "@/components/auth/auth-guard"

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard requireUser>{children}</AuthGuard>
}
