"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useAuth } from "@/context/auth-context"
import { ApiClientError } from "@/lib/api-client"
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth"

export function useRegister() {
  const router = useRouter()
  const { register: registerUser, isActionLoading: isLoading } = useAuth()

  const [serverError, setServerError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  })

  function togglePassword() {
    setShowPassword((prev) => !prev)
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
        if (err.status === 409) {
          setServerError("Ya existe una cuenta con ese correo.")
        } else if (err.status === 429) {
          setServerError("Demasiados intentos. Espera un momento.")
        } else {
          setServerError(err.message || "No se pudo crear la cuenta.")
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
    showPassword,
    onSubmit,
    togglePassword,
  }
}
