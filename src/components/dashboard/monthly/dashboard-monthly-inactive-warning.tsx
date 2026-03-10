export function DashboardMonthlyInactiveWarning() {
  return (
    <div className="rounded-xl border border-chart-3/45 bg-chart-3/10 p-4">
      <p className="text-sm font-medium text-foreground">
        Acceso limitado
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Un administrador debe activar tu cuenta para que puedas crear proyectos y registrar gastos.
      </p>
    </div>
  )
}
