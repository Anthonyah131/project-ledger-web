import {
  IconAlertCircle,
  IconShieldCheck,
  IconUserShield,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"

interface DashboardMonthlyStatusBadgesProps {
  isActive: boolean
  isAdmin: boolean
  loading: boolean
}

export function DashboardMonthlyStatusBadges({
  isActive,
  isAdmin,
  loading,
}: DashboardMonthlyStatusBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-border/70 bg-card/55 p-3 shadow-sm transition-shadow hover:shadow-md">
      {isActive ? (
        <Badge
          variant="outline"
          className="gap-1.5 border-primary/30 bg-primary/10 text-primary"
        >
          <IconShieldCheck className="size-3.5" />
          Cuenta activa
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="gap-1.5 border-chart-3/40 bg-chart-3/10 text-foreground"
        >
          <IconAlertCircle className="size-3.5" />
          Cuenta pendiente de activacion
        </Badge>
      )}

      {isAdmin && (
        <Badge
          variant="outline"
          className="gap-1.5 border-chart-4/40 bg-chart-4/10 text-foreground"
        >
          <IconUserShield className="size-3.5" />
          Administrador
        </Badge>
      )}

      {loading && (
        <Badge variant="outline" className="border-border/80 bg-muted/50">
          Actualizando...
        </Badge>
      )}
    </div>
  )
}
