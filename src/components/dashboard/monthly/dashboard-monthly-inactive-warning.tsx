"use client"

import { useLanguage } from "@/context/language-context"

export function DashboardMonthlyInactiveWarning() {
  const { t } = useLanguage()

  return (
    <div className="rounded-xl border border-chart-3/45 bg-chart-3/10 p-4">
      <p className="text-sm font-medium text-foreground">
        {t("dashboard.monthly.inactiveWarning.title")}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("dashboard.monthly.inactiveWarning.description")}
      </p>
    </div>
  )
}
