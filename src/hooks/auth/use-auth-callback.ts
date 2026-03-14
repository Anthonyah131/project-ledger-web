"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { useAuth } from "@/context/auth-context"
import { ApiClientError } from "@/lib/api-client"
import { getGoogleLoginUrl } from "@/services/auth-service"

function resolveOAuthErrorMessage(errorCode: string) {
  switch (errorCode) {
    case "google_auth_failed":
      return "No se pudo completar el inicio de sesion con Google. Intenta otra vez."
    default:
      return "No se pudo completar la autenticacion. Intenta nuevamente."
  }
}

function resolveRedirect(redirectTo: string | null, fallbackRoute: string) {
  if (!redirectTo) return fallbackRoute
  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) return fallbackRoute
  return redirectTo
}

export function useAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithAccessToken } = useAuth()

  const [isProcessing, setIsProcessing] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const token = (searchParams.get("token") ?? "").trim()
  const errorCode = (searchParams.get("error") ?? "").trim()
  const redirectTo = searchParams.get("redirectTo")

  useEffect(() => {
    let cancelled = false

    async function completeOAuthFlow() {
      if (errorCode) {
        setErrorMessage(resolveOAuthErrorMessage(errorCode))
        setIsProcessing(false)
        return
      }

      if (!token) {
        setErrorMessage("No se recibio el token de autenticacion. Intenta iniciar sesion de nuevo.")
        setIsProcessing(false)
        return
      }

      try {
        const nextUser = await loginWithAccessToken(token)
        if (cancelled) return

        const fallbackRoute = nextUser.isAdmin ? "/admin/users" : "/dashboard"
        router.replace(resolveRedirect(redirectTo, fallbackRoute))
      } catch (err) {
        if (cancelled) return

        if (err instanceof ApiClientError) {
          if (err.status === 401) {
            setErrorMessage("Tu sesion de Google no es valida o ya expiro. Intenta nuevamente.")
          } else if (err.status === 403) {
            setErrorMessage("Tu cuenta no tiene acceso en este momento. Contacta a soporte.")
          } else {
            setErrorMessage(err.message || "No pudimos validar tu sesion de Google.")
          }
        } else {
          setErrorMessage("Error de conexion al validar tu sesion. Intenta nuevamente.")
        }

        setIsProcessing(false)
      }
    }

    void completeOAuthFlow()

    return () => {
      cancelled = true
    }
  }, [errorCode, loginWithAccessToken, redirectTo, router, token])

  function retryWithGoogle() {
    if (typeof window === "undefined") return
    window.location.assign(getGoogleLoginUrl())
  }

  function goToLogin() {
    router.replace("/login")
  }

  return {
    isProcessing,
    errorMessage,
    retryWithGoogle,
    goToLogin,
  }
}
