import { IconChevronLeft, IconChevronRight, IconRefresh } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DashboardMonthlyHeaderProps {
  userFirstName: string
  monthLabel: string
  generatedAt?: string
  loading: boolean
  canGoNext: boolean
  onGoPreviousMonth: () => void
  onGoNextMonth: () => void
  onReload: () => void
}

export function DashboardMonthlyHeader({
  userFirstName,
  monthLabel,
  generatedAt,
  loading,
  canGoNext,
  onGoPreviousMonth,
  onGoNextMonth,
  onReload,
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
          <p className="max-w-2xl text-sm text-muted-foreground">
            Resumen financiero consolidado para {monthLabel.toLowerCase()}.
          </p>
          {generatedAt && (
            <p className="text-xs text-muted-foreground/80">
              Actualizado: {new Date(generatedAt).toLocaleString("es")}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-background/65 p-2 xl:gap-2.5 xl:p-2.5">
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
