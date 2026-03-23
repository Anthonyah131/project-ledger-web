"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { ApiClientError } from "@/lib/api-client"
import {
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  type ForgotPasswordFormValues,
  type VerifyOtpFormValues,
  type ResetPasswordFormValues,
} from "@/lib/validations/auth"
import * as authService from "@/services/auth-service"

type ForgotPasswordStep = "request" | "verify" | "reset"

export function useForgotPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromQuery = (searchParams.get("email") ?? "").trim()
  const initialEmail = emailFromQuery.includes("@") ? emailFromQuery : ""
  
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>("request")
  const [email, setEmail] = useState(initialEmail)
  const [otpCode, setOtpCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Step 1: Request OTP
  const requestForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: initialEmail },
  })

  // Step 2: Verify OTP
  const verifyForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otpCode: "" },
  })

  // Step 3: Reset password
  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  // Step 1: Request OTP submission
  const onRequestSubmit = requestForm.handleSubmit(async (data) => {
    setServerError("")
    setSuccessMessage("")
    setIsLoading(true)

    try {
      await authService.forgotPassword({ email: data.email })
      setEmail(data.email)
      setSuccessMessage(
        "Si tu correo está registrado, recibirás un código en breve."
      )
      // Advance to step 2 after a brief delay to show the message
      setTimeout(() => {
        setCurrentStep("verify")
        setSuccessMessage("")
      }, 2000)
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.message || "Error al solicitar el código.")
      } else {
        setServerError("Error de conexión. Intenta de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
  })

  // Step 2: Verify OTP submission
  const onVerifySubmit = verifyForm.handleSubmit(async (data) => {
    setServerError("")
    setSuccessMessage("")
    setIsLoading(true)

    try {
      await authService.verifyOtp({ email, otpCode: data.otpCode })
      setOtpCode(data.otpCode)
      setSuccessMessage("Código verificado correctamente.")
      // Advance to step 3 after brief delay
      setTimeout(() => {
        setCurrentStep("reset")
        setSuccessMessage("")
      }, 1000)
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.message || "Error al verificar el código.")
      } else {
        setServerError("Error de conexión. Intenta de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
  })

  // Step 3: Reset password submission
  const onResetSubmit = resetForm.handleSubmit(async (data) => {
    setServerError("")
    setSuccessMessage("")
    setIsLoading(true)

    try {
      await authService.resetPassword({
        email,
        otpCode,
        newPassword: data.newPassword,
      })
      setSuccessMessage("¡Contraseña actualizada correctamente!")
      // Redirect to login after brief delay
      setTimeout(() => {
        router.push("/login?passwordReset=true")
      }, 2000)
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.message || "Error al actualizar la contraseña.")
        if (err.status === 400) {
          // Restart flow (e.g., OTP expired between step 2 and 3)
          setTimeout(() => {
            resetToStart()
          }, 3000)
        }
      } else {
        setServerError("Error de conexión. Intenta de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
  })

  // Helper: Reset to step 1
  function resetToStart() {
    setCurrentStep("request")
    setEmail("")
    setOtpCode("")
    setServerError("")
    setSuccessMessage("")
    requestForm.reset()
    verifyForm.reset()
    resetForm.reset()
  }

  // Helper: Go back to previous step
  function goBack() {
    setServerError("")
    setSuccessMessage("")
    
    if (currentStep === "verify") {
      setCurrentStep("request")
      verifyForm.reset()
    } else if (currentStep === "reset") {
      setCurrentStep("verify")
      resetForm.reset()
    }
  }

  return {
    // State
    currentStep,
    email,
    isLoading,
    serverError,
    successMessage,
    
    // Forms
    requestForm,
    verifyForm,
    resetForm,
    
    // Actions
    onRequestSubmit,
    onVerifySubmit,
    onResetSubmit,
    resetToStart,
    goBack,
  }
}
