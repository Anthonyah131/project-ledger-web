import {
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
  IconShieldCheck,
} from "@tabler/icons-react"

import { DashboardMonthlyAlertsIndicator } from "@/components/dashboard/monthly/dashboard-monthly-alerts-indicator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DashboardAlert } from "@/types/dashboard"

interface DashboardMonthlyHeaderProps {
  userFirstName: string
  isActive: boolean
  monthLabel: string
  generatedAt?: string
  alerts: DashboardAlert[]
  loading: boolean
  canGoNext: boolean
  onGoPreviousMonth: () => void
  onGoNextMonth: () => void
  onReload: () => void
  onOpenAlert?: (alert: DashboardAlert) => void
}

export function DashboardMonthlyHeader({
  userFirstName,
  isActive,
  monthLabel,
  generatedAt,
  alerts,
  loading,
  canGoNext,
  onGoPreviousMonth,
  onGoNextMonth,
  onReload,
  onOpenAlert,
}: DashboardMonthlyHeaderProps) {
  return (
    <section className="rounded-2xl border border-border/70 bg-[linear-gradient(145deg,var(--card),color-mix(in_oklch,var(--card),var(--primary)_10%))] p-5 shadow-sm transition-shadow hover:shadow-md md:p-6 xl:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between xl:gap-6">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Dashboard mensual
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl xl:text-[2rem]">
            Bienvenido, {userFirstName}
          </h1>
          <Badge
            variant="outline"
            className={isActive
              ? "w-fit gap-1.5 border-primary/30 bg-primary/10 text-primary"
              : "w-fit gap-1.5 border-chart-3/40 bg-chart-3/10 text-foreground"}
          >
            {isActive ? <IconShieldCheck className="size-3.5" /> : <IconAlertCircle className="size-3.5" />}
            {isActive ? "Cuenta activa" : "Cuenta pendiente de activacion"}
          </Badge>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Resumen financiero consolidado para {monthLabel.toLowerCase()}.
          </p>
          {generatedAt && (
            <p className="text-xs text-muted-foreground/80">
              Actualizado: {new Date(generatedAt).toLocaleString("es")}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 rounded-xl border border-border/70 bg-background/65 p-2 xl:gap-2.5 xl:p-2.5">
          <DashboardMonthlyAlertsIndicator alerts={alerts} onOpenAlert={onOpenAlert} />

          <Button
            variant="outline"
            size="icon-sm"
            onClick={onGoPreviousMonth}
            disabled={loading}
            aria-label="Mes anterior"
          >
            <IconChevronLeft className="size-4" />
          </Button>

          <Badge variant="outline" className="min-w-40 justify-center bg-primary/10 text-primary">
            {monthLabel}
          </Badge>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={onGoNextMonth}
            disabled={!canGoNext || loading}
            aria-label="Mes siguiente"
          >
            <IconChevronRight className="size-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={onReload} disabled={loading}>
            <IconRefresh className="size-4" />
            Recargar
          </Button>
        </div>
      </div>
    </section>
  )
}
