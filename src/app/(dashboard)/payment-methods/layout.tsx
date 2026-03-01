// app/(dashboard)/payment-methods/layout.tsx
// Blocks admin-only users from accessing payment method routes.

import { AuthGuard } from "@/components/auth/auth-guard"

export default function PaymentMethodsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard requireUser>{children}</AuthGuard>
}
