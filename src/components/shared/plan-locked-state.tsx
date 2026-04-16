"use client"

import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/language-context"
import { useRouter } from "next/navigation"

interface PlanLockedStateProps {
  /** Optional override for the title */
  title?: string
  /** Optional override for the description */
  description?: string
}

export function PlanLockedState({ title, description }: PlanLockedStateProps) {
  const { t } = useLanguage()
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-muted/50">
        <Lock className="size-6 text-muted-foreground" />
      </div>
      <div className="max-w-sm">
        <h3 className="text-sm font-semibold text-foreground">
          {title ?? t("common.planLocked.title")}
        </h3>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
          {description ?? t("common.planLocked.description")}
        </p>
      </div>
      <Button size="sm" onClick={() => router.push("/settings/billing")}>
        {t("common.upgrade")}
      </Button>
    </div>
  )
}
