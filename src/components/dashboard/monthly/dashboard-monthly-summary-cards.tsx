import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconCoins,
  IconReceipt,
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
  const previousMonthLabel = formatMonthLabel(comparison.previous_month)

  const cards: SummaryCardItem[] = [
    {
      label: "Gastos del mes",
      value: formatCurrency(summary.total_spent, currencyCode),
      footer: `Vs ${previousMonthLabel}: ${formatSignedCurrency(comparison.spent_delta, currencyCode)} (${formatSignedPercent(comparison.spent_delta_percentage)})`,
      icon: IconReceipt,
      footerIcon: comparison.spent_delta >= 0 ? IconArrowUpRight : IconArrowDownRight,
      tone: comparison.spent_delta <= 0 ? "positive" : "warning",
    },
    {
      label: "Ingresos del mes",
      value: formatCurrency(summary.total_income, currencyCode),
      footer: `Vs ${previousMonthLabel}: ${formatSignedCurrency(comparison.income_delta, currencyCode)} (${formatSignedPercent(comparison.income_delta_percentage)})`,
      icon: IconCoins,
      footerIcon: comparison.income_delta >= 0 ? IconArrowUpRight : IconArrowDownRight,
      tone: comparison.income_delta >= 0 ? "positive" : "warning",
    },
    {
      label: "Balance neto",
      value: formatCurrency(summary.net_balance, currencyCode),
      footer: `Cambio neto mensual: ${formatSignedCurrency(comparison.net_delta, currencyCode)}`,
      icon: summary.net_balance >= 0 ? IconArrowUpRight : IconArrowDownRight,
      footerIcon: comparison.net_delta >= 0 ? IconArrowUpRight : IconArrowDownRight,
      tone: summary.net_balance >= 0 ? "positive" : "warning",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 xl:gap-3.5">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="group relative min-w-0 overflow-hidden border-border/70 bg-card/80 shadow-[0_4px_20px_0_rgba(140,92,255,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_8px_32px_0_rgba(140,92,255,0.2)]"
        >
          {/* Purple top accent bar */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />

          <CardHeader className="min-w-0 pb-2 px-4 pt-4 xl:pb-2.5">
            <CardDescription className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {card.label}
            </CardDescription>
            <CardTitle className="min-w-0 wrap-break-word text-[1.35rem] font-semibold leading-tight tabular-nums lg:text-2xl">
              {card.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className={`${getToneClasses(card.tone)} transition-colors group-hover:bg-background/70`}>
                <card.icon className="size-3.5 shrink-0" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 border-t border-border/60 px-4 pt-2 text-xs xl:pt-2.5">
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
