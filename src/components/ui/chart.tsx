"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label?: string
    color?: string
  }
>

interface ChartContextValue {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

function useChart() {
  const ctx = React.useContext(ChartContext)
  if (!ctx) {
    throw new Error("Chart components must be used inside <ChartContainer />")
  }
  return ctx
}

interface ChartContainerProps extends React.ComponentProps<"div"> {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}

function buildChartVars(config: ChartConfig): React.CSSProperties {
  const vars: Record<string, string> = {}
  let idx = 1

  for (const [key, value] of Object.entries(config)) {
    vars[`--color-${key}`] = value.color ?? `var(--chart-${idx})`
    idx += 1
  }

  return vars as React.CSSProperties
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ config, children, className, style, ...props }, ref) => {
    const chartVars = React.useMemo(() => buildChartVars(config), [config])

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          ref={ref}
          style={{ ...chartVars, ...style }}
          className={cn(
            "min-w-0 min-h-0 [&_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border [&_.recharts-pie-label-text]:fill-foreground [&_.recharts-sector[stroke='#fff']]:stroke-transparent",
            className,
          )}
          {...props}
        >
          <RechartsPrimitive.ResponsiveContainer width="100%" height="100%" minWidth={0}>
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    )
  },
)
ChartContainer.displayName = "ChartContainer"

type TooltipPayloadItem = {
  dataKey?: string | number
  name?: string
  value?: number | string
  color?: string
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string | number
  hideLabel?: boolean
  valueFormatter?: (value: number | string, item: TooltipPayloadItem) => string
  labelFormatter?: (label: string | number) => string
  className?: string
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  (
    {
      active,
      payload,
      label,
      hideLabel = false,
      className,
      valueFormatter,
      labelFormatter,
    },
    ref,
  ) => {
    const { config } = useChart()

    if (!active || !payload || payload.length === 0) return null

    return (
      <div
        ref={ref}
        className={cn(
          "min-w-40 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md",
          className,
        )}
      >
        {!hideLabel && label !== undefined && (
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {labelFormatter ? labelFormatter(label) : String(label)}
          </p>
        )}

        <div className="space-y-1.5">
          {payload.map((item, index) => {
            const key = String(item.dataKey ?? item.name ?? index)
            const itemConfig = config[key]
            const itemLabel = itemConfig?.label ?? item.name ?? key
            const itemColor = itemConfig?.color ?? item.color ?? `var(--color-${key})`
            const rawValue = item.value ?? 0
            const displayValue = valueFormatter
              ? valueFormatter(rawValue, item)
              : String(rawValue)

            return (
              <div key={key} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-[2px]"
                    style={{ backgroundColor: itemColor }}
                    aria-hidden
                  />
                  <span className="text-muted-foreground">{itemLabel}</span>
                </div>
                <span className="font-medium tabular-nums">{displayValue}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

type LegendPayloadItem = {
  dataKey?: string | number
  value?: string
  color?: string
}

interface ChartLegendContentProps {
  payload?: LegendPayloadItem[]
  className?: string
}

const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendContentProps>(
  ({ payload, className }, ref) => {
    const { config } = useChart()

    if (!payload || payload.length === 0) return null

    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap items-center justify-center gap-3 pt-2", className)}
      >
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? item.value ?? index)
          const itemConfig = config[key]
          const itemLabel = itemConfig?.label ?? item.value ?? key
          const itemColor = itemConfig?.color ?? item.color ?? `var(--color-${key})`

          return (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <span className="size-2 rounded-[2px]" style={{ backgroundColor: itemColor }} aria-hidden />
              <span className="text-muted-foreground">{itemLabel}</span>
            </div>
          )
        })}
      </div>
    )
  },
)
ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}
