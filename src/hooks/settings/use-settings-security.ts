"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { ApiClientError } from "@/lib/api-client"
import * as userService from "@/services/user-service"

function getDeleteAccountErrorMessage(err: unknown, t: (key: string) => string): string {
  if (err instanceof ApiClientError) {
    if (err.status === 401) return t("settings.errors.sessionExpired")
    if (err.status === 403) return t("settings.errors.accountForbidden")
    if (err.status === 404) return t("settings.errors.accountNotFound")
    return err.message
  }
  if (err instanceof Error) return err.message
  return t("settings.errors.accountDeleteFailed")
}

export function useSettingsSecurity() {
  const router = useRouter()
  const { user, logout, logoutAll } = useAuth()
  const { t } = useLanguage()

  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const confirmWord = t("settings.security.deleteAccountConfirmWord")

  function handleStartPasswordResetFlow() {
    const email = user?.email?.trim() ?? ""
    const target =
      email.length > 0
        ? `/forgot-password?email=${encodeURIComponent(email)}&from=settings`
        : "/forgot-password?from=settings"

    router.push(target)
  }

  async function handleLogoutAllDevices() {
    setIsLoggingOutAll(true)
    try {
      await logoutAll()
      toast.success(t("settings.security.sessionsClosed"))
      router.replace("/login")
    } catch {
      toast.error(t("settings.security.sessionsClosedError"))
    } finally {
      setIsLoggingOutAll(false)
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation.trim().toUpperCase() !== confirmWord) return

    setIsDeletingAccount(true)
    try {
      await userService.deleteAccount()
      await logout()
      toast.success(t("settings.security.accountDeleted"))
      router.replace("/register")
    } catch (err) {
      toast.error(t("settings.security.accountDeleteError"), {
        description: getDeleteAccountErrorMessage(err, t),
      })
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return {
    t,
    isLoggingOutAll,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteConfirmation,
    setDeleteConfirmation,
    isDeletingAccount,
    confirmWord,
    handleStartPasswordResetFlow,
    handleLogoutAllDevices,
    handleDeleteAccount,
  }
}
