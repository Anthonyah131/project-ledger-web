"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { OnboardingChecklist } from "@/components/onboarding/onboarding-checklist"
import { useOnboardingProgress } from "@/hooks/onboarding/use-onboarding-progress"

const DISMISSED_KEY = "pl:onboarding_dismissed"

interface OnboardingContextValue {
  openWizard: () => void
  refreshProgress: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function useOnboardingContext() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error("useOnboardingContext must be used inside OnboardingProvider")
  return ctx
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const { progress, refresh } = useOnboardingProgress()

  // Auto-show on first visit (no dismissed flag)
  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY) !== "1") {
      setVisible(true)
    }
  }, [])

  const openWizard = useCallback(() => setVisible(true), [])

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, "1")
    setVisible(false)
  }, [])

  const refreshProgress = useCallback(() => {
    if (visible) refresh()
  }, [visible, refresh])

  return (
    <OnboardingContext.Provider value={{ openWizard, refreshProgress }}>
      {children}
      {visible && (
        <OnboardingChecklist
          onDismiss={dismiss}
          progress={progress}
          onRefresh={refresh}
        />
      )}
    </OnboardingContext.Provider>
  )
}
