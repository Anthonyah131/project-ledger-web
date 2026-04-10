"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Loader2,
  Rocket,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/context/language-context"
import type { OnboardingProgress } from "@/hooks/onboarding/use-onboarding-progress"

interface OnboardingChecklistProps {
  onDismiss: () => void
  progress: OnboardingProgress
  onRefresh: () => void
}

export function OnboardingChecklist({ onDismiss, progress, onRefresh }: OnboardingChecklistProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const { steps, firstProjectId, firstPaymentMethodId, loading } = progress

  // Refresh on mount and on window focus
  useEffect(() => {
    onRefresh()
  }, [onRefresh])

  useEffect(() => {
    function handleFocus() { onRefresh() }
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [onRefresh])

  const completedCount = steps.filter(Boolean).length
  const allDone = completedCount === steps.length

  const handleStep = useCallback(
    (stepIndex: number) => {
      switch (stepIndex) {
        case 0:
          router.push("/partners?onboarding=1")
          break
        case 1:
          router.push("/payment-methods?onboarding=1")
          break
        case 2:
          if (firstPaymentMethodId) {
            router.push(`/payment-methods/${firstPaymentMethodId}?onboarding=1`)
          }
          break
        case 3:
          router.push("/projects?onboarding=1")
          break
        case 4:
          if (firstProjectId) {
            router.push(
              `/projects/${firstProjectId}?tab=settings&section=partners&onboarding=1`
            )
          }
          break
        case 5:
          if (firstProjectId) {
            router.push(
              `/projects/${firstProjectId}?tab=settings&section=payment-methods&onboarding=1`
            )
          }
          break
      }
    },
    [router, firstProjectId, firstPaymentMethodId]
  )

  const STEPS = [
    t("onboarding.steps.partner.title"),
    t("onboarding.steps.paymentMethod.title"),
    t("onboarding.steps.linkPMToPartner.title"),
    t("onboarding.steps.project.title"),
    t("onboarding.steps.assignPartner.title"),
    t("onboarding.steps.linkPaymentMethod.title"),
  ]

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-xl border border-border bg-card shadow-lg shadow-black/10">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Rocket className="size-4 text-primary shrink-0" />
        <span className="flex-1 text-sm font-semibold">
          {t("onboarding.setupGuide")}
        </span>
        {loading ? (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        ) : (
          <span className="text-xs text-muted-foreground tabular-nums">
            {completedCount}/{steps.length}
          </span>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="size-6 text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-6 text-muted-foreground hover:text-foreground"
          onClick={onDismiss}
        >
          <X className="size-3.5" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      {/* Steps */}
      {!collapsed && (
        <ul className="flex flex-col p-2">
          {STEPS.map((label, i) => {
            const done = steps[i]
            const blocked =
              (!done && i === 2 && !firstPaymentMethodId) ||
              (!done && i >= 4 && !firstProjectId)
            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={blocked}
                  onClick={() => !blocked && handleStep(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    done
                      ? "text-muted-foreground hover:bg-muted cursor-pointer"
                      : blocked
                      ? "text-muted-foreground/50 cursor-not-allowed"
                      : "hover:bg-muted cursor-pointer font-medium"
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted-foreground/50" />
                  )}
                  <span className={cn(done && "line-through")}>{label}</span>
                </button>
              </li>
            )
          })}

          {allDone && (
            <li className="px-3 pt-1 pb-2">
              <p className="text-xs text-muted-foreground text-center">
                {t("onboarding.allDone")}
              </p>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
