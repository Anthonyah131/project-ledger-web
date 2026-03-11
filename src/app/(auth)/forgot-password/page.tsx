import { Suspense } from "react"
import { ForgotPasswordView } from "@/views/auth/forgot-password/forgot-password-view"

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordView />
    </Suspense>
  )
}
