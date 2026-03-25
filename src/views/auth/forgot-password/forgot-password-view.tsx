"use client"

import Link from "next/link"
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForgotPassword } from "@/hooks/auth/use-forgot-password"
import { useState } from "react"
import { useLanguage } from "@/context/language-context"

export function ForgotPasswordView() {
  const { t } = useLanguage()
  const {
    currentStep,
    email,
    isLoading,
    serverError,
    successMessage,
    requestForm,
    verifyForm,
    resetForm,
    onRequestSubmit,
    onVerifySubmit,
    onResetSubmit,
    goBack,
  } = useForgotPassword()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      {/* Header with back button (except on first step) */}
      {currentStep !== "request" && (
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={goBack}
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("auth.forgotPasswordFlow.back")}
        </Button>
      )}

      {/* Step 1: Request OTP */}
      {currentStep === "request" && (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {t("auth.forgotPasswordFlow.requestTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("auth.forgotPasswordFlow.requestSubtitle")}
            </p>
          </div>

          <Form {...requestForm}>
            <form onSubmit={onRequestSubmit} className="flex flex-col gap-4">
              <FormField
                control={requestForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.fields.email.label")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        autoComplete="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError && (
                <Alert variant="destructive">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.forgotPasswordFlow.sending")}
                  </>
                ) : (
                  t("auth.forgotPasswordFlow.sendCode")
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              {t("auth.forgotPasswordFlow.backToLogin")}
            </Link>
          </div>
        </>
      )}

      {/* Step 2: Verify OTP */}
      {currentStep === "verify" && (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {t("auth.forgotPasswordFlow.verifyTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("auth.forgotPasswordFlow.verifySubtitle")}{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <Form {...verifyForm}>
            <form onSubmit={onVerifySubmit} className="flex flex-col gap-4">
              <FormField
                control={verifyForm.control}
                name="otpCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.forgotPasswordFlow.code.label")}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder={t("auth.forgotPasswordFlow.code.placeholder")}
                        maxLength={6}
                        autoComplete="one-time-code"
                        disabled={isLoading}
                        className="text-center text-2xl tracking-widest"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("auth.forgotPasswordFlow.codeExpiry")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError && (
                <Alert variant="destructive">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.forgotPasswordFlow.verifying")}
                  </>
                ) : (
                  t("auth.forgotPasswordFlow.verifyCode")
                )}
              </Button>
            </form>
          </Form>
        </>
      )}

      {/* Step 3: Reset Password */}
      {currentStep === "reset" && (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {t("auth.forgotPasswordFlow.resetTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("auth.forgotPasswordFlow.resetSubtitle")}
            </p>
          </div>

          <Form {...resetForm}>
            <form onSubmit={onResetSubmit} className="flex flex-col gap-4">
              <FormField
                control={resetForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.forgotPasswordFlow.newPassword.label")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          disabled={isLoading}
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={resetForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.forgotPasswordFlow.confirmPassword.label")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          disabled={isLoading}
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError && (
                <Alert variant="destructive">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.forgotPasswordFlow.updating")}
                  </>
                ) : (
                  t("auth.forgotPasswordFlow.changePassword")
                )}
              </Button>
            </form>
          </Form>
        </>
      )}
    </div>
  )
}
