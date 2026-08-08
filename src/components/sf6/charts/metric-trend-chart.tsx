import type { ComponentProps, ReactNode } from "react"

import { useMemo } from "react"
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/chart-container"
import type { ChartValueFormat } from "@/lib/sf6/charts/format"

import {
  AnalyticsChart,
  ANALYTICS_ANGLED_X_AXIS_HEIGHT,
  ANALYTICS_AXIS_TICK,
  ANALYTICS_LINE_CHART_LEGEND_PROPS,
  ANALYTICS_LINE_CHART_MARGIN,
  ANALYTICS_X_AXIS_TICK,
  ANALYTICS_Y_AXIS_WIDTH,
  analyticsAngledXAxisLabel,
  analyticsYAxisLabel,
} from "@/components/sf6/charts/analytics-chart"
import { ChartLegendContent } from "@/components/ui/chart-legend"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart-tooltip"
import { collectRecordValues, computeAxisDomain } from "@/lib/sf6/charts/axis-domain"
import { CHART_TICK_FORMATTERS } from "@/lib/sf6/charts/format"

type MetricTrendSeries = {
  key: string
  label: string
  color: string
}
type MetricTrendPoint = {
  label: string
  [key: string]: number | string | null
}

const MetricTrendChart = ({
  data,
  series,
  xAxisLabel,
  valueFormat,
  valueLabel,
  referenceValue,
  referenceLabel,
  emptyLabel,
  size = "compact",
}: {
  data: readonly MetricTrendPoint[]
  series: readonly MetricTrendSeries[]
  xAxisLabel: string
  valueFormat: ChartValueFormat
  valueLabel: string
  referenceValue?: number
  referenceLabel?: string
  emptyLabel?: ReactNode
  size?: ComponentProps<typeof AnalyticsChart>["size"]
}): ReactNode => {
  const config = useMemo(
    () =>
      Object.fromEntries(
        series.map((item) => [item.key, { label: item.label, color: item.color }]),
      ) satisfies ChartConfig,
    [series],
  )
  const yDomain = useMemo(
    () =>
      computeAxisDomain(
        collectRecordValues(
          data,
          series.map((item) => item.key),
        ),
        {
          anchors: referenceValue === undefined ? [] : [referenceValue],
        },
      ),
    [data, referenceValue, series],
  )
  const tickFormatter = CHART_TICK_FORMATTERS[valueFormat]
  if (data.length === 0 || series.length === 0) {
    return emptyLabel ?? null
  }
  return (
    <AnalyticsChart config={config} size={size}>
      <LineChart accessibilityLayer data={data} margin={ANALYTICS_LINE_CHART_MARGIN}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={ANALYTICS_X_AXIS_TICK}
          angle={-40}
          textAnchor="end"
          height={ANALYTICS_ANGLED_X_AXIS_HEIGHT}
          interval={0}
          tickMargin={8}
          label={analyticsAngledXAxisLabel(xAxisLabel)}
        />
        <YAxis
          domain={yDomain}
          width={ANALYTICS_Y_AXIS_WIDTH}
          tick={ANALYTICS_AXIS_TICK}
          tickFormatter={tickFormatter}
          tickMargin={4}
          label={analyticsYAxisLabel(valueLabel)}
        />
        {referenceValue === undefined ? null : (
          <ReferenceLine
            y={referenceValue}
            stroke="var(--muted-foreground)"
            strokeDasharray="2 2"
            label={referenceLabel}
          />
        )}
        <ChartTooltip content={<ChartTooltipContent valueFormat={valueFormat} />} />
        <Legend
          {...ANALYTICS_LINE_CHART_LEGEND_PROPS}
          content={<ChartLegendContent verticalAlign="top" />}
        />
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

export { MetricTrendChart, type MetricTrendPoint, type MetricTrendSeries }
