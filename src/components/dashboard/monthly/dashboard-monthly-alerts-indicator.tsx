import {
  IconAlertTriangle,
  IconBell,
  IconCircleCheck,
  IconInfoCircle,
} from "@tabler/icons-react"

import type { DashboardAlert } from "@/types/dashboard"

interface DashboardMonthlyAlertsIndicatorProps {
  alerts: DashboardAlert[]
  onOpenAlert?: (alert: DashboardAlert) => void
}

function getAlertTone(type: DashboardAlert["type"]) {
  if (type === "warning") {
    return {
      icon: IconAlertTriangle,
      badge: "border-chart-3/40 bg-chart-3/12 text-foreground",
      dot: "bg-chart-3",
    }
  }

  return {
    icon: IconInfoCircle,
    badge: "border-primary/35 bg-primary/12 text-primary",
    dot: "bg-primary",
  }
}

export function DashboardMonthlyAlertsIndicator({
  alerts,
  onOpenAlert,
}: DashboardMonthlyAlertsIndicatorProps) {
  const orderedAlerts = [...alerts].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
  const visibleAlerts = orderedAlerts.slice(0, 5)
  const hiddenAlertsCount = Math.max(0, orderedAlerts.length - visibleAlerts.length)
  const hasAlerts = orderedAlerts.length > 0

  return (
    <div className="group relative">
      <button
        type="button"
        className={`relative flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium shadow-sm transition-all ${
          hasAlerts
            ? "border-destructive/30 bg-destructive/10 text-foreground hover:border-destructive/45 hover:bg-destructive/14"
            : "border-primary/30 bg-primary/10 text-primary hover:border-primary/45 hover:bg-primary/14"
        }`}
        aria-label={hasAlerts ? `Ver alertas del mes (${orderedAlerts.length})` : "No hay alertas del mes"}
      >
        {hasAlerts ? <IconBell className="size-4" /> : <IconCircleCheck className="size-4" />}
        <span>{hasAlerts ? "Alertas del mes" : "Sin alertas"}</span>
        {hasAlerts && (
          <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold leading-none text-destructive-foreground shadow-sm">
            {orderedAlerts.length > 99 ? "99+" : orderedAlerts.length}
          </span>
        )}
      </button>

      <div className="invisible pointer-events-none absolute right-0 top-[calc(100%+0.75rem)] z-30 w-88 translate-y-1 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="rounded-2xl border border-border/70 bg-popover/98 p-3 shadow-xl backdrop-blur">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Alertas del mes</p>
              <p className="text-[11px] text-muted-foreground">
                {hasAlerts ? `${orderedAlerts.length} alerta${orderedAlerts.length === 1 ? "" : "s"} activa${orderedAlerts.length === 1 ? "" : "s"}` : "No se detectaron alertas en este mes."}
              </p>
            </div>
            <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${hasAlerts ? "border-destructive/35 bg-destructive/10 text-destructive" : "border-primary/35 bg-primary/10 text-primary"}`}>
              {hasAlerts ? "Activo" : "Estable"}
            </span>
          </div>

          {visibleAlerts.length === 0 ? (
            <div className="rounded-xl border border-primary/25 bg-primary/8 px-3 py-4 text-sm text-primary">
              Todo esta en orden para el mes seleccionado.
            </div>
          ) : (
            <div className="space-y-2">
              {visibleAlerts.map((alert) => {
                const tone = getAlertTone(alert.type)
                const Icon = tone.icon

                return (
                  <button
                    key={`${alert.code}-${alert.message}`}
                    type="button"
                    disabled={!onOpenAlert}
                    onClick={() => onOpenAlert?.(alert)}
                    className={`w-full rounded-xl border px-3 py-2 text-left transition-all ${tone.badge} ${
                      onOpenAlert ? "hover:-translate-y-0.5 hover:shadow-sm" : ""
                    } disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:shadow-none`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon className="mt-0.5 size-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`size-2 shrink-0 rounded-full ${tone.dot}`} aria-hidden />
                          <p className="truncate text-[11px] font-semibold uppercase tracking-wide">{alert.code}</p>
                        </div>
                        <p className="mt-1 text-sm text-foreground">{alert.message}</p>
                      </div>
                    </div>
                  </button>
                )
              })}

              {hiddenAlertsCount > 0 && (
                <p className="px-1 text-[11px] text-muted-foreground">
                  Se muestran 5 alertas como maximo. Hay {hiddenAlertsCount} alerta{hiddenAlertsCount === 1 ? "" : "s"} adicional{hiddenAlertsCount === 1 ? "" : "es"}.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
