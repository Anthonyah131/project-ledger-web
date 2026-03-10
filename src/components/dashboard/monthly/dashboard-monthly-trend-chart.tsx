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
import {
  formatCompactCurrency,
  formatCurrency,
  formatDateLabel,
} from "@/components/dashboard/monthly/dashboard-monthly-format"
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

const chartConfig = {
  spent: {
    label: "Gastos",
    color: "var(--chart-1)",
  },
  income: {
    label: "Ingresos",
    color: "var(--chart-2)",
  },
  net: {
    label: "Balance neto",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

interface DashboardMonthlyTrendChartProps {
  trendByDay: DashboardTrendDay[]
  currencyCode: string
  onOpenDayDetail?: (day: DashboardTrendDay) => void
}

interface TrendTooltipItem {
  name?: string
  value?: number | string
  color?: string
  payload?: DashboardTrendDay
}

function formatAxisCompactNumber(value: number) {
  return new Intl.NumberFormat("es", {
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
  onOpenDayDetail,
}: DashboardMonthlyTrendChartProps) {
  const isMobile = useIsMobile()

  const chartData = useMemo(
    () => trendByDay.map((day) => ({ ...day, shortDate: formatDateLabel(day.date) })),
    [trendByDay],
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
    const expenseCount = day?.expenseCount ?? 0
    const incomeCount = day?.incomeCount ?? 0
    const movementCount = expenseCount + incomeCount
    const projectCount = day?.projectIds?.length ?? 0

    return (
      <div className="grid min-w-44 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-2 text-xs shadow-xl">
        <div className="font-medium text-foreground">Dia {String(label ?? "")}</div>

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
            Movimientos: {movementCount} ({expenseCount} gastos, {incomeCount} ingresos)
          </p>
          <p>Proyectos: {projectCount}</p>
        </div>
      </div>
    )
  }, [currencyCode, isMobile])

  const resolvedChartConfig = useMemo<ChartConfig>(
    () => {
      if (!isMobile) return chartConfig

      return {
        spent: {
          label: "Gast.",
          color: "var(--chart-1)",
        },
        income: {
          label: "Ingr.",
          color: "var(--chart-2)",
        },
        net: {
          label: "Neto",
          color: "var(--chart-4)",
        },
      }
    },
    [isMobile],
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
    <Card className="border-border/70 bg-card/75 shadow-sm">
      <CardHeader className="pb-2 xl:pb-3">
        <CardTitle>Tendencia diaria del mes</CardTitle>
        <CardDescription>
          Gastos, ingresos y balance neto en una sola vista para comparar comportamiento diario.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Este mes no tiene movimientos. Cuando registres gastos o ingresos, veras la tendencia aqui.
          </p>
        ) : (
          <ChartContainer
            config={resolvedChartConfig}
            className="h-68 w-full min-w-0 xl:h-76 2xl:h-80"
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
                name="Gastos"
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="var(--color-income)"
                fill="url(#fillIncome)"
                fillOpacity={1}
                strokeWidth={2}
                dot={false}
                name="Ingresos"
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="var(--color-net)"
                strokeWidth={2.25}
                dot={false}
                activeDot={{ r: 5 }}
                name="Balance neto"
              />
            </AreaChart>
          </ChartContainer>
        )}

        {onOpenDayDetail && chartData.length > 0 && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Tip: toca o haz click en un punto para abrir el detalle diario filtrado.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
