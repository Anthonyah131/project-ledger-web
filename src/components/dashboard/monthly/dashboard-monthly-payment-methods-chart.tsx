"use client"

import { useMemo } from "react"
import { Cell, Label, Pie, PieChart } from "recharts"

import { formatCompactCurrency, formatCurrency, formatPercent } from "@/lib/format-utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/context/language-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import type { DashboardPaymentMethodSplit } from "@/types/dashboard"
import { cn } from "@/lib/utils"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

interface DashboardMonthlyPaymentMethodsChartProps {
  paymentMethodSplit: DashboardPaymentMethodSplit[]
  currencyCode: string
  onOpenPaymentMethod?: (paymentMethodId: string) => void
}

export function DashboardMonthlyPaymentMethodsChart({
  paymentMethodSplit,
  currencyCode,
  onOpenPaymentMethod,
}: DashboardMonthlyPaymentMethodsChartProps) {
  const isMobile = useIsMobile()
  const { t } = useLanguage()

  const chartData = useMemo(
    () => paymentMethodSplit.map((method, index) => ({
      id: method.payment_method_id,
      name: method.payment_method_name,
      totalAmount: method.total_amount,
      expenseCount: method.expense_count,
      percentage: method.percentage,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    })),
    [paymentMethodSplit],
  )

  const totalAmount = useMemo(
    () => chartData.reduce((sum, item) => sum + item.totalAmount, 0),
    [chartData],
  )

  const totalOperations = useMemo(
    () => chartData.reduce((sum, item) => sum + item.expenseCount, 0),
    [chartData],
  )

  const chartConfig: ChartConfig = chartData.reduce<ChartConfig>((acc, method) => {
    acc[method.id] = {
      label: method.name,
      color: method.fill,
    }
    return acc
  }, {})

  const renderPaymentMethodTooltip = (args: unknown) => {
    if (typeof args !== "object" || args === null) return null

    const active = "active" in args ? Boolean((args as { active?: boolean }).active) : false
    const payload = "payload" in args
      ? ((args as { payload?: ReadonlyArray<{ payload?: { name?: string; totalAmount?: number; percentage?: number; expenseCount?: number }; value?: number | string; color?: string }> }).payload ?? [])
      : []

    if (!active || payload.length === 0) return null

    const point = payload[0]?.payload
    if (!point) return null

    return (
      <div className="grid min-w-44 items-start gap-1.5 rounded-lg border px-2.5 py-2 text-xs shadow-xl" style={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", color: "var(--popover-foreground)" }}>
        <div className="font-medium text-foreground">{point.name}</div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={cn("size-2 rounded-[2px]")}
              style={{ backgroundColor: payload[0]?.color ?? "var(--chart-1)" }}
              aria-hidden
            />
            <span className="text-muted-foreground">{t("dashboard.monthly.paymentMethodsChart.amountLabel")}</span>
          </div>
          <span className="font-medium tabular-nums text-foreground">
            {isMobile
              ? formatCompactCurrency(point.totalAmount ?? 0, currencyCode)
              : formatCurrency(point.totalAmount ?? 0, currencyCode)}
          </span>
        </div>
        <div className="border-t border-border/60 pt-1.5 text-[11px] text-muted-foreground">
          <p>{t("dashboard.monthly.paymentMethodsChart.operationsCount", { count: point.expenseCount ?? 0 })}</p>
          <p>{t("dashboard.monthly.paymentMethodsChart.percentOfTotal", { value: formatPercent(point.percentage ?? 0) })}</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-border/70 bg-card/80 shadow-[0_4px_20px_0_rgba(140,92,255,0.1)] transition-all hover:shadow-[0_8px_32px_0_rgba(140,92,255,0.18)]">
      <CardHeader className="pb-2 xl:pb-3">
        <CardTitle className="text-base font-semibold tracking-tight">{t("dashboard.monthly.paymentMethodsChart.title")}</CardTitle>
        <CardDescription>
          {t("dashboard.monthly.paymentMethodsChart.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.monthly.paymentMethodsChart.empty")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.9fr] lg:items-start">
            <div className="space-y-2 order-2 lg:order-1">
              {chartData.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  disabled={!onOpenPaymentMethod}
                  onClick={() => onOpenPaymentMethod?.(method.id)}
                  className="flex w-full items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/35 px-2 py-2 text-left text-xs transition-all hover:-translate-y-0.5 hover:bg-muted/55 hover:shadow-sm disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:bg-muted/35 disabled:hover:shadow-none"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="size-2 rounded-[2px] shrink-0" style={{ backgroundColor: method.fill }} aria-hidden />
                    <div className="min-w-0">
                      <p className="truncate text-foreground">{method.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("dashboard.monthly.paymentMethodsChart.registeredExpenses", { count: method.expenseCount })}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold tabular-nums text-foreground">{formatPercent(method.percentage)}</p>
                    <p className="text-[11px] tabular-nums text-muted-foreground">
                      {isMobile
                        ? formatCompactCurrency(method.totalAmount, currencyCode)
                        : formatCurrency(method.totalAmount, currencyCode)}
                    </p>
                  </div>
                </button>
              ))}

              <div className="rounded-md border border-border/60 bg-muted/25 px-3 py-2 text-xs text-muted-foreground">
                {t("dashboard.monthly.paymentMethodsChart.methodsSummary", {
                  methods: chartData.length,
                  expenses: totalOperations,
                })}
              </div>
            </div>

            <ChartContainer
              config={chartConfig}
              className="order-1 h-64 w-full min-w-0 lg:order-2 xl:h-72 2xl:h-80"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={renderPaymentMethodTooltip}
                />
                <Pie
                  data={chartData}
                  dataKey="totalAmount"
                  nameKey="name"
                  innerRadius={56}
                  outerRadius={90}
                  paddingAngle={3}
                  strokeWidth={4}
                  onClick={(_, index) => {
                    const item = typeof index === "number" ? chartData[index] : undefined
                    if (!item) return
                    if (!onOpenPaymentMethod) return
                    onOpenPaymentMethod(item.id)
                  }}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null

                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy - 6} className="fill-foreground text-xs font-semibold">
                            {t("dashboard.monthly.paymentMethodsChart.totalSpent")}
                          </tspan>
                          <tspan x={viewBox.cx} y={viewBox.cy + 13} className="fill-foreground text-lg font-semibold tabular-nums">
                            {isMobile
                              ? formatCompactCurrency(totalAmount, currencyCode)
                              : formatCurrency(totalAmount, currencyCode)}
                          </tspan>
                          <tspan x={viewBox.cx} y={viewBox.cy + 30} className="fill-muted-foreground text-[10px]">
                            {t("dashboard.monthly.paymentMethodsChart.totalExpenses", { count: totalOperations })}
                          </tspan>
                        </text>
                      )
                    }}
                  />

                  {chartData.map((entry) => (
                    <Cell key={entry.id} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
      {chartData.length > 0 && (
        <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span>{t("dashboard.monthly.paymentMethodsChart.footerMethods", { count: chartData.length })}</span>
          <span className="font-medium tabular-nums text-foreground">
            {t("dashboard.monthly.paymentMethodsChart.footerExpenses", { count: totalOperations })}
          </span>
        </CardFooter>
      )}
    </Card>
  )
}
