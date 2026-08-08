import type { ReactNode } from "react"

import { useMemo } from "react"
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/chart-container"

import {
  AnalyticsChart,
  ANALYTICS_AXIS_TICK,
  ANALYTICS_CHART_MARGIN,
  ANALYTICS_X_AXIS_TICK,
} from "@/components/sf6/charts/analytics-chart"
import { ChartLegendContent } from "@/components/ui/chart-legend"
import { ChartTooltip, ChartTooltipContent, safeTooltipName } from "@/components/ui/chart-tooltip"

type MetricTrendSeries = {
  key: string
  label: string
  color: string
}
type MetricTrendPoint = {
  label: string
  [key: string]: number | string | null
}
type MetricTrendDomain = [number | "auto", number | "auto"]

const MetricTrendChart = ({
  data,
  series,
  xAxisLabel,
  yDomain,
  tickFormatter,
  valueLabel,
  formatter,
  referenceValue,
  referenceLabel,
  referencePeriods,
  emptyLabel,
}: {
  data: readonly MetricTrendPoint[]
  series: readonly MetricTrendSeries[]
  xAxisLabel: string
  yDomain: MetricTrendDomain
  tickFormatter: (value: number) => string
  valueLabel: string
  formatter: (value: number | null) => string
  referenceValue?: number
  referenceLabel?: string
  referencePeriods?: readonly string[]
  emptyLabel?: ReactNode
}): ReactNode => {
  const config = useMemo(
    () =>
      Object.fromEntries(
        series.map((item) => [item.key, { label: item.label, color: item.color }]),
      ) satisfies ChartConfig,
    [series],
  )
  if (data.length === 0 || series.length === 0) {
    return emptyLabel ?? null
  }
  return (
    <AnalyticsChart config={config} className="h-90">
      <LineChart accessibilityLayer data={data} margin={ANALYTICS_CHART_MARGIN}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={ANALYTICS_X_AXIS_TICK}
          angle={-40}
          textAnchor="end"
          height={50}
          interval={0}
          label={xAxisLabel}
        />
        <YAxis
          domain={yDomain}
          tick={ANALYTICS_AXIS_TICK}
          tickFormatter={tickFormatter}
          label={valueLabel}
        />
        {referenceValue === undefined ? null : (
          <ReferenceLine
            y={referenceValue}
            stroke="var(--muted-foreground)"
            strokeDasharray="2 2"
            label={referenceLabel}
          />
        )}
        {referencePeriods?.map((period) => (
          <ReferenceLine
            key={period}
            x={period}
            stroke="var(--muted-foreground)"
            strokeDasharray="2 2"
            label={period}
          />
        ))}
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => [
                formatter(typeof value === "number" ? value : null),
                safeTooltipName(name),
              ]}
            />
          }
        />
        <Legend content={<ChartLegendContent />} />
        {series.map((item) => (
          <Line
            key={item.key}
            type="linear"
            dataKey={item.key}
            name={item.label}
            stroke={`var(--color-${item.key})`}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </AnalyticsChart>
  )
}

export { MetricTrendChart, type MetricTrendDomain, type MetricTrendPoint, type MetricTrendSeries }
