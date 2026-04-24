"use client"

import { useCallback, useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/context/language-context"
import { useDateFormat } from "@/hooks/use-date-format"
import { formatCompactCurrency, formatCurrency } from "@/lib/format-utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import type { DashboardTrendDay } from "@/types/dashboard"
import { cn } from "@/lib/utils"

interface DashboardMonthlyTrendChartProps {
  trendByDay: DashboardTrendDay[]
  currencyCode: string
  scopeLabel: string
  onOpenDayDetail?: (day: DashboardTrendDay) => void
  dailyBudgetRate?: number | null
}

interface TrendTooltipItem {
  name?: string
  value?: number | string
  color?: string
  payload?: DashboardTrendDay
}

function formatAxisCompactNumber(value: number) {
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function formatTooltipAmount(value: number, currencyCode: string, isMobile: boolean) {
  return isMobile
    ? formatCompactCurrency(value, currencyCode)
    : formatCurrency(value, currencyCode)
}

export function DashboardMonthlyTrendChart({
  trendByDay,
  currencyCode,
  scopeLabel,
  onOpenDayDetail,
  dailyBudgetRate,
}: DashboardMonthlyTrendChartProps) {
  const isMobile = useIsMobile()
  const { t } = useLanguage()
  const { formatDateLabel } = useDateFormat()

  const chartData = useMemo(
    () => trendByDay.map((day) => ({ ...day, shortDate: formatDateLabel(day.date) })),
    [trendByDay, formatDateLabel],
  )

  const renderTrendTooltip = useCallback((args: unknown) => {
    if (typeof args !== "object" || args === null) return null

    const active = "active" in args ? Boolean((args as { active?: boolean }).active) : false
    const payload = "payload" in args
      ? ((args as { payload?: ReadonlyArray<TrendTooltipItem> }).payload ?? [])
      : []
    const label = "label" in args
      ? (args as { label?: string | number }).label
      : undefined

    if (!active || payload.length === 0) return null

    const day = payload[0]?.payload
    const expenseCount = day?.expense_count ?? 0
    const incomeCount = day?.income_count ?? 0
    const movementCount = expenseCount + incomeCount
    const projectCount = day?.project_ids?.length ?? 0

    return (
      <div className="grid min-w-44 items-start gap-1.5 rounded-lg border px-2.5 py-2 text-xs shadow-xl" style={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", color: "var(--popover-foreground)", backdropFilter: "none" }}>
        <div className="font-medium text-foreground">{t("dashboard.monthly.trendChart.dayLabel", { day: String(label ?? "") })}</div>

        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const numericValue = Number(item.value ?? 0)
            const color = item.color ?? "var(--muted-foreground)"
            return (
              <div key={`${item.name ?? "serie"}-${index}`} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-[2px]")} style={{ backgroundColor: color }} aria-hidden />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium tabular-nums text-foreground">
                  {formatTooltipAmount(numericValue, currencyCode, isMobile)}
                </span>
              </div>
            )
          })}
        </div>

        <div className="border-t border-border/60 pt-1.5 text-[11px] text-muted-foreground">
          <p>
            {t("dashboard.monthly.trendChart.movements", {
              total: movementCount,
              expenses: expenseCount,
              incomes: incomeCount,
            })}
          </p>
          <p>{t("dashboard.monthly.trendChart.projects", { count: projectCount })}</p>
        </div>
      </div>
    )
  }, [currencyCode, isMobile, t])

  const resolvedChartConfig = useMemo<ChartConfig>(
    () => {
      if (!isMobile) {
        return {
          spent: {
            label: t("dashboard.monthly.trendChart.spentLabel"),
            color: "var(--chart-1)",
          },
          income: {
            label: t("dashboard.monthly.trendChart.incomeLabel"),
            color: "var(--chart-2)",
          },
          net: {
            label: t("dashboard.monthly.trendChart.netLabel"),
            color: "var(--chart-4)",
          },
        }
      }

      return {
        spent: {
          label: t("dashboard.monthly.trendChart.spentShort"),
          color: "var(--chart-1)",
        },
        income: {
          label: t("dashboard.monthly.trendChart.incomeShort"),
          color: "var(--chart-2)",
        },
        net: {
          label: t("dashboard.monthly.trendChart.netShort"),
          color: "var(--chart-4)",
        },
      }
    },
    [isMobile, t],
  )

  const handleChartClick = useCallback((state: unknown) => {
    if (!onOpenDayDetail) return

    const activePayload =
      typeof state === "object" &&
      state !== null &&
      "activePayload" in state
        ? (state as { activePayload?: Array<{ payload?: { date?: string } }> }).activePayload
        : undefined

    const clickedDate = activePayload?.[0]?.payload?.date
    if (!clickedDate) return

    const selectedDay = trendByDay.find((day) => day.date === clickedDate)
    if (!selectedDay) return

    onOpenDayDetail(selectedDay)
  }, [onOpenDayDetail, trendByDay])

  return (
    <Card className="border-border/70 bg-card/75 shadow-[0_4px_20px_0_rgba(140,92,255,0.1)] transition-all hover:shadow-[0_8px_32px_0_rgba(140,92,255,0.18)]">
      <CardHeader className="pb-2 xl:pb-3">
        <CardTitle>{t("dashboard.monthly.trendChart.title")}</CardTitle>
        <CardDescription>
          {t("dashboard.monthly.trendChart.description", { scope: scopeLabel.toLowerCase() })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("dashboard.monthly.trendChart.empty")}
          </p>
        ) : (
          <ChartContainer
            config={resolvedChartConfig}
            className="h-72 w-full min-w-0 xl:h-80 2xl:h-96"
          >
            <AreaChart
              data={chartData}
              margin={{ left: 16, right: 10, top: 8, bottom: 8 }}
              onClick={handleChartClick}
              className={onOpenDayDetail ? "cursor-pointer" : undefined}
            >
              <defs>
                <linearGradient id="fillSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-spent)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-spent)" stopOpacity={0.06} />
                </linearGradient>
                <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.06} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="shortDate"
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tickMargin={8}
                tick={{ fill: "var(--foreground)", fontSize: 12, opacity: 0.88 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                width={94}
                tickMargin={8}
                tick={{ fill: "var(--foreground)", fontSize: 12, opacity: 0.88 }}
                tickFormatter={(value: number) => formatAxisCompactNumber(value)}
              />
              <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="4 4" />
              {dailyBudgetRate && dailyBudgetRate > 0 ? (
                <ReferenceLine
                  y={dailyBudgetRate}
                  stroke="var(--chart-4)"
                  strokeDasharray="6 4"
                  strokeOpacity={0.7}
                  label={{
                    value: t("dashboard.monthly.trendChart.budgetLineLabel", {
                      amount: isMobile
                        ? formatCompactCurrency(dailyBudgetRate, currencyCode)
                        : formatCurrency(dailyBudgetRate, currencyCode),
                    }),
                    fill: "var(--chart-4)",
                    fontSize: 10,
                    position: "insideTopRight",
                  }}
                />
              ) : null}

              <ChartTooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={renderTrendTooltip}
              />

              <ChartLegend content={<ChartLegendContent className="justify-start pt-1 md:pt-2 [&_span]:text-foreground/90" />} />

              <Area
                type="monotone"
                dataKey="spent"
                stroke="var(--color-spent)"
                fill="url(#fillSpent)"
                fillOpacity={1}
                strokeWidth={2}
                dot={false}
                name={t("dashboard.monthly.trendChart.spentLabel")}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="var(--color-income)"
                fill="url(#fillIncome)"
                fillOpacity={1}
                strokeWidth={2}
                dot={false}
                name={t("dashboard.monthly.trendChart.incomeLabel")}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="var(--color-net)"
                strokeWidth={2.25}
                dot={false}
                activeDot={{ r: 5 }}
                name={t("dashboard.monthly.trendChart.netLabel")}
              />
            </AreaChart>
          </ChartContainer>
        )}

        {onOpenDayDetail && chartData.length > 0 && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            {t("dashboard.monthly.trendChart.tip")}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
