import { Suspense } from "react"

import { AuthCallbackView } from "@/views/auth/callback/auth-callback-view"

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackView />
    </Suspense>
  )
}
