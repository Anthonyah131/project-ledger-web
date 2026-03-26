"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { ApiClientError } from "@/lib/api-client"
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth"
import { getGoogleLoginUrl } from "@/services/auth-service"

export function useRegister() {
  const router = useRouter()
  const { t } = useLanguage()
  const { register: registerUser, isActionLoading: isLoading } = useAuth()

  const [serverError, setServerError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema(t)),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
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

  const onSubmit = form.handleSubmit(async (data) => {
    setServerError("")
    try {
      await registerUser(data.email, data.password, data.name)
      router.push(resolveRedirect("/dashboard"))
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.message || t("auth.errors.register"))
      } else {
        setServerError(t("common.errors.connection"))
      }
    }
  })

  return {
    form,
    serverError,
    isLoading,
    showPassword,
    onSubmit,
    togglePassword,
    continueWithGoogle,
  }
}
