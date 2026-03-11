import { AuthGuard } from "@/components/auth/auth-guard"

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard requireUser>{children}</AuthGuard>
}
