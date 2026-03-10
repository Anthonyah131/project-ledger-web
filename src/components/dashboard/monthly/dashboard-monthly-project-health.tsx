import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatAmount } from "@/lib/format-utils"
import type { DashboardProjectHealth } from "@/types/dashboard"

import { formatCurrency } from "@/components/dashboard/monthly/dashboard-monthly-format"

interface DashboardMonthlyProjectHealthProps {
  projectHealth: DashboardProjectHealth[]
  currencyCode: string
  onOpenProject?: (projectId: string) => void
}

function getBudgetBarTone(percentage: number): string {
  if (percentage >= 90) return "bg-destructive"
  if (percentage >= 70) return "bg-chart-3"
  return "bg-primary"
}

function isDefinedNumber(value: number | null): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

export function DashboardMonthlyProjectHealth({
  projectHealth,
  currencyCode,
  onOpenProject,
}: DashboardMonthlyProjectHealthProps) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Salud por proyecto</CardTitle>
        <CardDescription>
          Resultado mensual por proyecto con control de presupuesto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {projectHealth.length === 0 ? (
          <p className="rounded-lg border border-border/60 bg-muted/40 p-3 text-sm text-muted-foreground">
            No hay proyectos con actividad para este mes.
          </p>
        ) : (
          <div className="space-y-3">
            {projectHealth.map((project) => (
              <article
                key={project.projectId}
                className={`rounded-xl border border-border/70 bg-background/55 p-4 transition-all duration-200 ${
                  onOpenProject ? "cursor-pointer hover:-translate-y-0.5 hover:border-primary/25 hover:bg-muted/35 hover:shadow-sm" : ""
                }`}
                role={onOpenProject ? "button" : undefined}
                tabIndex={onOpenProject ? 0 : undefined}
                onClick={() => onOpenProject?.(project.projectId)}
                onKeyDown={(event) => {
                  if (!onOpenProject) return
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    onOpenProject(project.projectId)
                  }
                }}
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="min-w-0 truncate text-[15px] font-semibold text-foreground">{project.projectName}</h3>
                  <Badge
                    variant="outline"
                    className={
                      project.net >= 0
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-chart-3/45 bg-chart-3/10 text-foreground"
                    }
                  >
                    {project.net >= 0 ? "Neto positivo" : "Neto negativo"}
                  </Badge>
                </div>

                {onOpenProject && (
                  <p className="mt-1 text-[11px] text-muted-foreground">Click para abrir el proyecto</p>
                )}

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-lg border border-border/60 bg-muted/35 p-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Gastos</p>
                    <p className="mt-1 text-sm font-semibold tabular-nums">{formatCurrency(project.spent, currencyCode)}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/35 p-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ingresos</p>
                    <p className="mt-1 text-sm font-semibold tabular-nums">{formatCurrency(project.income, currencyCode)}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/35 p-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Neto</p>
                    <p className="mt-1 text-sm font-semibold tabular-nums">{formatCurrency(project.net, currencyCode)}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/35 p-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Presupuesto</p>
                    <p className="mt-1 text-sm font-semibold tabular-nums">
                      {isDefinedNumber(project.budget)
                        ? formatCurrency(project.budget, currencyCode)
                        : "Sin presupuesto"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5">
                  {isDefinedNumber(project.budgetUsedPercentage) ? (
                    <>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full ${getBudgetBarTone(project.budgetUsedPercentage)}`}
                          style={{ width: `${Math.min(100, Math.max(0, project.budgetUsedPercentage))}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Uso de presupuesto: {formatAmount(project.budgetUsedPercentage, "0.00")}%
                      </p>
                    </>
                  ) : (
                    <p className="rounded-md border border-dashed border-border/60 px-2 py-1 text-xs text-muted-foreground">
                      Sin meta de presupuesto para este proyecto.
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
