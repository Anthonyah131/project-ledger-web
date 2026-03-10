import {
  IconAlertTriangle,
  IconChevronRight,
  IconCircleX,
  IconInfoCircle,
} from "@tabler/icons-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardAlert } from "@/types/dashboard"

interface DashboardMonthlyAlertsPanelProps {
  alerts: DashboardAlert[]
  onOpenAlert?: (alert: DashboardAlert) => void
}

function getAlertTone(type: DashboardAlert["type"]) {
  if (type === "error") {
    return {
      container: "border-destructive/40 bg-destructive/10",
      icon: IconCircleX,
      label: "text-destructive",
    }
  }

  if (type === "warning") {
    return {
      container: "border-chart-3/45 bg-chart-3/10",
      icon: IconAlertTriangle,
      label: "text-foreground",
    }
  }

  return {
    container: "border-primary/35 bg-primary/10",
    icon: IconInfoCircle,
    label: "text-primary",
  }
}

export function DashboardMonthlyAlertsPanel({
  alerts,
  onOpenAlert,
}: DashboardMonthlyAlertsPanelProps) {
  const orderedAlerts = [...alerts].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

  return (
    <Card className="border-border/70 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Alertas del mes</CardTitle>
        <CardDescription>
          Senales importantes detectadas por el overview consolidado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {orderedAlerts.length === 0 ? (
          <p className="rounded-lg border border-border/60 bg-muted/40 p-3 text-sm text-muted-foreground">
            No hay alertas para este mes.
          </p>
        ) : (
          orderedAlerts.map((alert) => {
            const tone = getAlertTone(alert.type)
            const Icon = tone.icon

            return (
              <button
                key={`${alert.code}-${alert.message}`}
                type="button"
                disabled={!onOpenAlert}
                onClick={() => onOpenAlert?.(alert)}
                className={`rounded-lg border p-3 text-left transition-all duration-200 ${tone.container} ${
                  onOpenAlert ? "hover:-translate-y-0.5 hover:shadow-sm" : ""
                } disabled:cursor-default disabled:opacity-90 disabled:hover:translate-y-0 disabled:hover:shadow-none`}
              >
                <p className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${tone.label}`}>
                  <Icon className="size-3.5" />
                  {alert.type}
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{alert.code}</p>
                  <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </div>
                <p className="mt-0.5 text-left text-sm text-muted-foreground">{alert.message}</p>
                {(alert.count || alert.priority) && (
                  <p className="mt-1 text-[11px] text-muted-foreground/90">
                    {alert.count ? `${alert.count} evento${alert.count === 1 ? "" : "s"}` : ""}
                    {alert.count && alert.priority ? " • " : ""}
                    {alert.priority ? `Prioridad ${alert.priority}` : ""}
                  </p>
                )}
              </button>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
