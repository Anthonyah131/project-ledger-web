"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useAuth } from "@/context/auth-context"
import { ApiClientError } from "@/lib/api-client"
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth"
import { getGoogleLoginUrl } from "@/services/auth-service"

export function useLogin() {
  const router = useRouter()
  const {
    user,
    login,
    isActionLoading: isLoading,
    isAuthenticated,
    isLoading: isSessionLoading,
  } = useAuth()

  const [serverError, setServerError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  function togglePassword() {
    setShowPassword((prev) => !prev)
  }

  function continueWithGoogle() {
    if (typeof window === "undefined") return
    window.location.assign(getGoogleLoginUrl())
  }

  function resolveRedirect(defaultRoute: string) {
    if (typeof window === "undefined") return defaultRoute
    const redirectTo = new URLSearchParams(window.location.search).get("redirectTo")
    if (!redirectTo) return defaultRoute
    if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) return defaultRoute
    return redirectTo
  }

  const homeRoute = resolveRedirect(user?.isAdmin ? "/admin/users" : "/dashboard")

  useEffect(() => {
    if (isSessionLoading || !isAuthenticated) return

    router.replace(homeRoute)
  }, [homeRoute, isAuthenticated, isSessionLoading, router])

  const onSubmit = form.handleSubmit(async (data) => {
    setServerError("")
    try {
      await login(data.email, data.password)
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setServerError("Correo o contraseña incorrectos.")
        } else if (err.status === 429) {
          setServerError("Demasiados intentos. Espera un momento.")
        } else {
          setServerError(err.message || "Error al iniciar sesión.")
        }
      } else {
        setServerError("Error de conexión. Intenta de nuevo.")
      }
    }
  })

  return {
    form,
    serverError,
    isLoading,
    isSessionLoading,
    showPassword,
    shouldHideForm: isSessionLoading || isAuthenticated,
    onSubmit,
    togglePassword,
    continueWithGoogle,
  }
}
