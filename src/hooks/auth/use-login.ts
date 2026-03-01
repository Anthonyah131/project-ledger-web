"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useAuth } from "@/context/auth-context"
import { ApiClientError } from "@/lib/api-client"
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth"

export function useLogin() {
  const router = useRouter()
  const { login, isActionLoading: isLoading } = useAuth()

  const [serverError, setServerError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  function togglePassword() {
    setShowPassword((prev) => !prev)
  }

  const onSubmit = form.handleSubmit(async (data) => {
    setServerError("")
    try {
      const loggedInUser = await login(data.email, data.password)
      router.push(loggedInUser.isAdmin ? "/admin/users" : "/dashboard")
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
    showPassword,
    onSubmit,
    togglePassword,
  }
}
