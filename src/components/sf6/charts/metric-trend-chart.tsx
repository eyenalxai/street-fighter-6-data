import type { ComponentProps, ReactNode } from "react"

import { useMemo } from "react"
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/chart-container"
import type { ChartValueFormat } from "@/lib/sf6/charts/format"
import type { MetricTrendPoint, MetricTrendSeries } from "@/lib/sf6/charts/series"

import {
  AnalyticsChart,
  ANALYTICS_ANGLED_X_AXIS_HEIGHT,
  ANALYTICS_AXIS_PROPS,
  ANALYTICS_AXIS_TICK,
  ANALYTICS_CHART_MARGIN,
  ANALYTICS_LINE_CHART_LEGEND_PROPS,
  ANALYTICS_X_AXIS_MIN_TICK_GAP,
  ANALYTICS_X_AXIS_TICK_MARGIN,
  ANALYTICS_X_AXIS_TICK,
  ANALYTICS_Y_AXIS_TICK_MARGIN,
  ANALYTICS_Y_AXIS_TICK_WIDTH,
} from "@/components/sf6/charts/analytics-chart"
import { ChartLegendContent } from "@/components/ui/chart-legend"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart-tooltip"
import { collectRecordValues, computeAxisDomain } from "@/lib/sf6/charts/axis-domain"
import { CHART_TICK_FORMATTERS } from "@/lib/sf6/charts/format"
import { getChartSeriesColor } from "@/lib/sf6/charts/palette"

const MetricTrendChart = ({
  data,
  series,
  xAxisName,
  valueFormat,
  yAxisName,
  referenceValue,
  referenceLabel,
  emptyLabel,
  size = "compact",
  xTickFormatter,
}: {
  data: readonly MetricTrendPoint[]
  series: readonly MetricTrendSeries[]
  xAxisName: string
  valueFormat: ChartValueFormat
  yAxisName: string
  referenceValue?: number
  referenceLabel?: string
  emptyLabel?: ReactNode
  size?: ComponentProps<typeof AnalyticsChart>["size"]
  xTickFormatter?: (value: string) => string
}): ReactNode => {
  const config = useMemo(
    () =>
      Object.fromEntries(
        series.map((item, index) => [
          item.key,
          { label: item.label, color: item.color ?? getChartSeriesColor(index) },
        ]),
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
      <LineChart accessibilityLayer data={data} margin={ANALYTICS_CHART_MARGIN}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          {...ANALYTICS_AXIS_PROPS}
          dataKey="label"
          name={xAxisName}
          tick={ANALYTICS_X_AXIS_TICK}
          angle={-40}
          textAnchor="end"
          height={ANALYTICS_ANGLED_X_AXIS_HEIGHT}
          interval="preserveStartEnd"
          minTickGap={ANALYTICS_X_AXIS_MIN_TICK_GAP}
          tickMargin={ANALYTICS_X_AXIS_TICK_MARGIN}
          tickFormatter={xTickFormatter}
        />
        <YAxis
          {...ANALYTICS_AXIS_PROPS}
          domain={yDomain}
          name={yAxisName}
          width={ANALYTICS_Y_AXIS_TICK_WIDTH}
          tick={ANALYTICS_AXIS_TICK}
          tickFormatter={tickFormatter}
          tickMargin={ANALYTICS_Y_AXIS_TICK_MARGIN}
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
          content={<ChartLegendContent verticalAlign="top" className="gap-x-2 gap-y-1 pb-1" />}
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

export { MetricTrendChart }
