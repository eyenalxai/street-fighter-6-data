import { useMemo } from "react"
import { CartesianGrid, ReferenceLine, Scatter, ScatterChart, XAxis, YAxis, ZAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/chart-container"

import {
  AnalyticsChart,
  ANALYTICS_AXIS_TICK,
  ANALYTICS_SCATTER_CHART_MARGIN,
  ANALYTICS_Y_AXIS_WIDTH,
  analyticsXAxisLabel,
  analyticsYAxisLabel,
} from "@/components/sf6/charts/analytics-chart"
import {
  ChartTooltip,
  ChartTooltipContent,
  formatChartTooltipLabel,
  safeTooltipName,
} from "@/components/ui/chart-tooltip"
import { collectRecordValues, computeAxisDomain } from "@/lib/sf6/charts/axis-domain"
import { CHART_TICK_FORMATTERS, CHART_TOOLTIP_VALUE_FORMATTERS } from "@/lib/sf6/charts/format"

type PerformancePopularityPoint = {
  characterId: string
  name: string
  performance: number
  usage: number
  weightedPerformance: number | null
  floor: number | null
}
const PERFORMANCE_POPULARITY_CONFIG = {
  performance: { label: "Average win rate", color: "var(--chart-1)" },
} satisfies ChartConfig

const PerformancePopularityChart = ({
  data,
  usageReference,
}: {
  data: readonly PerformancePopularityPoint[]
  usageReference: number | null
}) => {
  const xDomain = useMemo(
    () => computeAxisDomain(collectRecordValues(data, ["performance"]), { anchors: [50] }),
    [data],
  )
  const yDomain = useMemo(
    () =>
      computeAxisDomain(collectRecordValues(data, ["usage"]), {
        anchors: usageReference === null ? [] : [usageReference],
      }),
    [data, usageReference],
  )

  return (
    <AnalyticsChart config={PERFORMANCE_POPULARITY_CONFIG} size="default">
      <ScatterChart accessibilityLayer margin={ANALYTICS_SCATTER_CHART_MARGIN}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="performance"
          domain={xDomain}
          tick={ANALYTICS_AXIS_TICK}
          tickFormatter={CHART_TICK_FORMATTERS.percent}
          tickMargin={8}
          name="Average win rate"
          label={analyticsXAxisLabel("Average win rate")}
        />
        <YAxis
          type="number"
          dataKey="usage"
          domain={yDomain}
          width={ANALYTICS_Y_AXIS_WIDTH}
          tick={ANALYTICS_AXIS_TICK}
          tickFormatter={CHART_TICK_FORMATTERS.percent}
          tickMargin={4}
          name="Usage share"
          label={analyticsYAxisLabel("Usage share")}
        />
        <ZAxis type="number" dataKey="usage" range={[48, 160]} />
        <ReferenceLine x={50} stroke="var(--muted-foreground)" strokeDasharray="2 2" />
        {usageReference === null ? null : (
          <ReferenceLine
            y={usageReference}
            stroke="var(--muted-foreground)"
            strokeDasharray="2 2"
          />
        )}
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={formatChartTooltipLabel}
              formatter={(value, name) => [
                typeof value === "number" ? CHART_TOOLTIP_VALUE_FORMATTERS.percent(value) : "—",
                safeTooltipName(name),
              ]}
            />
          }
        />
        <Scatter name="Characters" data={data} fill="var(--color-performance)" />
      </ScatterChart>
    </AnalyticsChart>
  )
}

export { PerformancePopularityChart, type PerformancePopularityPoint }
