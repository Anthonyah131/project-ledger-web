import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconChartBar,
  IconCoins,
  IconFolder,
  IconReceipt,
  IconShieldDollar,
} from "@tabler/icons-react"
import type { Icon } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardComparison, DashboardSummary } from "@/types/dashboard"

import {
  formatCurrency,
  formatMonthLabel,
  formatSignedCurrency,
  formatSignedPercent,
} from "@/components/dashboard/monthly/dashboard-monthly-format"

interface DashboardMonthlySummaryCardsProps {
  summary: DashboardSummary
  comparison: DashboardComparison
  currencyCode: string
}

interface SummaryCardItem {
  label: string
  value: string
  footer: string
  icon: Icon
  footerIcon: Icon
  tone: "positive" | "warning" | "neutral"
}

function getToneClasses(tone: SummaryCardItem["tone"]) {
  if (tone === "positive") {
    return "border-primary/30 bg-primary/10 text-primary"
  }

  if (tone === "warning") {
    return "border-chart-3/40 bg-chart-3/10 text-foreground"
  }

  return "border-border/80 bg-muted/40 text-muted-foreground"
}

export function DashboardMonthlySummaryCards({
  summary,
  comparison,
  currencyCode,
}: DashboardMonthlySummaryCardsProps) {
  const previousMonthLabel = formatMonthLabel(comparison.previousMonth)

  const cards: SummaryCardItem[] = [
    {
      label: "Gastos del mes",
      value: formatCurrency(summary.totalSpent, currencyCode),
      footer: `Vs ${previousMonthLabel}: ${formatSignedCurrency(comparison.spentDelta, currencyCode)} (${formatSignedPercent(comparison.spentDeltaPercentage)})`,
      icon: IconReceipt,
      footerIcon: comparison.spentDelta >= 0 ? IconArrowUpRight : IconArrowDownRight,
      tone: comparison.spentDelta <= 0 ? "positive" : "warning",
    },
    {
      label: "Ingresos del mes",
      value: formatCurrency(summary.totalIncome, currencyCode),
      footer: `Vs ${previousMonthLabel}: ${formatSignedCurrency(comparison.incomeDelta, currencyCode)} (${formatSignedPercent(comparison.incomeDeltaPercentage)})`,
      icon: IconCoins,
      footerIcon: comparison.incomeDelta >= 0 ? IconArrowUpRight : IconArrowDownRight,
      tone: comparison.incomeDelta >= 0 ? "positive" : "warning",
    },
    {
      label: "Balance neto",
      value: formatCurrency(summary.netBalance, currencyCode),
      footer: `Cambio neto mensual: ${formatSignedCurrency(comparison.netDelta, currencyCode)}`,
      icon: summary.netBalance >= 0 ? IconArrowUpRight : IconArrowDownRight,
      footerIcon: comparison.netDelta >= 0 ? IconArrowUpRight : IconArrowDownRight,
      tone: summary.netBalance >= 0 ? "positive" : "warning",
    },
    {
      label: "Proyectos activos",
      value: String(summary.activeProjects),
      footer:
        summary.activeProjects > 0
          ? "Con actividad en el mes seleccionado"
          : "Sin actividad para este mes",
      icon: IconFolder,
      footerIcon: IconFolder,
      tone: "neutral",
    },
    {
      label: "Obligaciones pendientes",
      value: String(summary.pendingObligationsCount),
      footer: `Monto pendiente: ${formatCurrency(summary.pendingObligationsAmount, currencyCode)}`,
      icon: IconShieldDollar,
      footerIcon: IconShieldDollar,
      tone: summary.pendingObligationsCount === 0 ? "positive" : "warning",
    },
    {
      label: "Presupuesto utilizado",
      value: `${summary.budgetUsedPercentage.toFixed(2)}%`,
      footer: "Porcentaje global consumido este mes",
      icon: IconChartBar,
      footerIcon: IconChartBar,
      tone:
        summary.budgetUsedPercentage >= 85
          ? "warning"
          : summary.budgetUsedPercentage >= 60
            ? "neutral"
            : "positive",
    },
  ]

  return (
    <div className="flex flex-wrap gap-3.5 xl:gap-4 2xl:gap-5">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="group min-w-55 flex-1 basis-65 border-border/70 bg-card/80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md xl:basis-[24rem]"
        >
          <CardHeader className="min-w-0 pb-2.5 xl:pb-3">
            <CardDescription className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {card.label}
            </CardDescription>
            <CardTitle className="min-w-0 wrap-break-word text-[1.65rem] font-semibold leading-tight tabular-nums lg:text-3xl">
              {card.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className={`${getToneClasses(card.tone)} transition-colors group-hover:bg-background/70`}>
                <card.icon className="size-3.5 shrink-0" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 border-t border-border/60 pt-2.5 text-sm xl:pt-3">
            <div className="line-clamp-2 flex min-w-0 gap-2 text-muted-foreground">
              <card.footerIcon className="size-4 shrink-0" />
              <span className="min-w-0 wrap-break-word">{card.footer}</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
