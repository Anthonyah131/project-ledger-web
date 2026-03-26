"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { formatCompactCurrency, formatCurrency } from "@/lib/format-utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/context/language-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartLegend,
  ChartLegendContent,
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import type { DashboardTopCategory } from "@/types/dashboard"
import { cn } from "@/lib/utils"

interface DashboardMonthlyCategoriesChartProps {
  topCategories: DashboardTopCategory[]
  currencyCode: string
  scopeLabel: string
}

function truncateLabel(value: string, max = 18) {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1)}...`
}

export function DashboardMonthlyCategoriesChart({
  topCategories,
  currencyCode,
  scopeLabel,
}: DashboardMonthlyCategoriesChartProps) {
  const isMobile = useIsMobile()
  const { t } = useLanguage()

  const categoriesChartConfig = {
    totalAmount: {
      label: t("dashboard.monthly.categoriesChart.totalAmountLabel"),
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig

  const chartData = topCategories.map((category) => ({
    categoryId: category.category_id,
    categoryName: category.category_name,
    totalAmount: category.total_amount,
    expenseCount: category.expense_count,
    percentage: category.percentage,
  }))

  const totalAmount = chartData.reduce((sum, category) => sum + category.totalAmount, 0)

  const renderCategoriesTooltip = (args: unknown) => {
    if (typeof args !== "object" || args === null) return null

    const active = "active" in args ? Boolean((args as { active?: boolean }).active) : false
    const payload = "payload" in args
      ? ((args as { payload?: ReadonlyArray<{ payload?: { categoryName?: string; totalAmount?: number; expenseCount?: number; percentage?: number }; value?: number | string; color?: string }> }).payload ?? [])
      : []

    if (!active || payload.length === 0) return null

    const point = payload[0]?.payload
    if (!point) return null

    return (
      <div className="grid min-w-44 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-2 text-xs shadow-xl">
        <div className="font-medium text-foreground">{point.categoryName}</div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={cn("size-2 rounded-[2px]")}
              style={{ backgroundColor: payload[0]?.color ?? "var(--chart-2)" }}
              aria-hidden
            />
            <span className="text-muted-foreground">{t("dashboard.monthly.categoriesChart.amountLabel")}</span>
          </div>
          <span className="font-medium tabular-nums text-foreground">
            {isMobile
              ? formatCompactCurrency(point.totalAmount ?? 0, currencyCode)
              : formatCurrency(point.totalAmount ?? 0, currencyCode)}
          </span>
        </div>
        <div className="border-t border-border/60 pt-1.5 text-[11px] text-muted-foreground">
          <p>{t("dashboard.monthly.categoriesChart.percentOfTotal", { value: (point.percentage ?? 0).toFixed(2) })}</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-border/70 bg-card/80 shadow-sm">
      <CardHeader className="pb-2 xl:pb-3">
        <CardTitle className="text-base font-semibold tracking-tight">{t("dashboard.monthly.categoriesChart.title")}</CardTitle>
        <CardDescription>
          {t("dashboard.monthly.categoriesChart.description", { scope: scopeLabel.toLowerCase() })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.monthly.categoriesChart.empty")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.9fr] lg:items-start">
            <div className="space-y-1.5 order-2 lg:order-1">
              {chartData.map((category, index) => (
                <div
                  key={category.categoryId}
                  className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/35 px-2 py-2 text-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/55 hover:shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-foreground">{category.categoryName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("dashboard.monthly.categoriesChart.categoryRow", { rank: index + 1, count: category.expenseCount })}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium tabular-nums">
                    {isMobile
                      ? formatCompactCurrency(category.totalAmount, currencyCode)
                      : formatCurrency(category.totalAmount, currencyCode)}
                  </span>
                </div>
              ))}

              <div className="rounded-md border border-border/60 bg-muted/25 px-3 py-2 text-xs text-muted-foreground">
                {t("dashboard.monthly.categoriesChart.categorySummary", { count: chartData.length })}
              </div>
            </div>

            <ChartContainer
              config={categoriesChartConfig}
              className="order-1 h-72 w-full min-w-0 lg:order-2 xl:h-80 2xl:h-96"
            >
              <BarChart
                accessibilityLayer
                data={chartData}
                layout="vertical"
                margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: number) => formatCompactCurrency(value, currencyCode)}
                />
                <YAxis
                  dataKey="categoryName"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={126}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value: string) => truncateLabel(value)}
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                  content={renderCategoriesTooltip}
                />
                <ChartLegend content={<ChartLegendContent className="justify-start pt-1 md:pt-2" />} />
                <Bar
                  dataKey="totalAmount"
                  fill="var(--color-totalAmount)"
                  radius={8}
                  background={{ fill: "var(--muted)", opacity: 0.25, radius: 8 }}
                />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
      {chartData.length > 0 && (
        <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span>{t("dashboard.monthly.categoriesChart.footerCategories", { count: chartData.length })}</span>
          <span className="font-medium tabular-nums text-foreground">
            {isMobile
              ? formatCompactCurrency(totalAmount, currencyCode)
              : formatCurrency(totalAmount, currencyCode)}
          </span>
        </CardFooter>
      )}
    </Card>
  )
}
