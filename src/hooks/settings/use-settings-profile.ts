"use client"

import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { ApiClientError, getLanguage, setLanguage } from "@/lib/api-client"
import { updateProfileSchema, type UpdateProfileFormValues } from "@/lib/validations/auth"
import * as userService from "@/services/user-service"
import type { UpdateProfileRequest } from "@/types/user"

function getProfileErrorMessage(err: unknown, t: (key: string) => string): string {
  if (err instanceof ApiClientError) return err.message
  if (err instanceof Error) return err.message
  return t("settings.errors.profileUpdateFailed")
}

export function useSettingsProfile() {
  const { user, refreshUser } = useAuth()
  const { t, setLocale } = useLanguage()
  const [isSaving, setIsSaving] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState(() => getLanguage())

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: "",
      avatarUrl: "",
    },
  })

  useEffect(() => {
    if (!user) return
    form.reset({
      fullName: user.fullName,
      avatarUrl: user.avatarUrl ?? "",
    })
  }, [form, user])

  const previewName = form.watch("fullName") || user?.fullName || "Usuario"
  const previewAvatar = form.watch("avatarUrl") || user?.avatarUrl || ""

  const initials = useMemo(
    () =>
      previewName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((segment) => segment[0])
        .join("")
        .toUpperCase() || "U",
    [previewName],
  )

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true)
    try {
      const payload: UpdateProfileRequest = {
        fullName: values.fullName.trim(),
      }

      const normalizedAvatar = values.avatarUrl.trim()
      payload.avatarUrl = normalizedAvatar.length > 0 ? normalizedAvatar : null

      await userService.updateUserProfile(payload)
      await refreshUser()

      toast.success(t("settings.profileUpdated"), {
        description: t("settings.profileUpdatedDescription"),
      })
    } catch (err) {
      toast.error(t("settings.profileUpdateError"), {
        description: getProfileErrorMessage(err, t),
      })
    } finally {
      setIsSaving(false)
    }
  })

  function handleLanguageChange(locale: string) {
    setLanguage(locale)
    setLocale(locale as "es" | "en")
    setCurrentLanguage(locale)
    toast.success(t("settings.languageUpdated"), {
      description: t("settings.languageUpdatedDescription"),
    })
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return {
    user,
    t,
    form,
    isSaving,
    currentLanguage,
    previewName,
    previewAvatar,
    initials,
    onSubmit,
    handleLanguageChange,
  }
}
