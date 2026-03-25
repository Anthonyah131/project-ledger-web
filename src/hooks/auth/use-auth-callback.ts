"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { ApiClientError } from "@/lib/api-client"
import { getGoogleLoginUrl } from "@/services/auth-service"

function resolveRedirect(redirectTo: string | null, fallbackRoute: string) {
  if (!redirectTo) return fallbackRoute
  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) return fallbackRoute
  return redirectTo
}

export function useAuthCallback() {
  const router = useRouter()
  const { t } = useLanguage()
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
        setErrorMessage(
          errorCode === "google_auth_failed"
            ? t("auth.callback.errorGoogle")
            : t("auth.callback.errorGeneric")
        )
        setIsProcessing(false)
        return
      }

      if (!token) {
        setErrorMessage(t("auth.callback.errorNoToken"))
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
            setErrorMessage(t("auth.callback.errorInvalidSession"))
          } else if (err.status === 403) {
            setErrorMessage(t("auth.callback.errorNoAccess"))
          } else {
            setErrorMessage(err.message || t("auth.callback.errorValidation"))
          }
        } else {
          setErrorMessage(t("auth.callback.errorConnection"))
        }

        setIsProcessing(false)
      }
    }

    void completeOAuthFlow()

    return () => {
      cancelled = true
    }
  }, [errorCode, loginWithAccessToken, redirectTo, router, token, t])

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
