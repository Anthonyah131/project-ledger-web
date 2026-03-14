"use client"

import { AlertCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuthCallback } from "@/hooks/auth/use-auth-callback"

export function AuthCallbackView() {
  const { isProcessing, errorMessage, retryWithGoogle, goToLogin } = useAuthCallback()

  if (isProcessing) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-border/70 bg-card/70 p-6 text-center shadow-sm">
        <Loader2 className="size-5 animate-spin text-primary" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Validando inicio de sesion con Google...</p>
          <p className="text-xs text-muted-foreground">Un momento, te estamos redirigiendo.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-5 rounded-2xl border border-destructive/35 bg-card/70 p-6 text-center shadow-sm">
      <div className="flex size-10 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertCircle className="size-5" />
      </div>

      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">No se pudo completar el acceso</h1>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
      </div>

      <div className="grid w-full gap-2 sm:grid-cols-2">
        <Button onClick={retryWithGoogle}>Reintentar con Google</Button>
        <Button variant="outline" onClick={goToLogin}>
          Volver al login
        </Button>
      </div>
    </div>
  )
}
