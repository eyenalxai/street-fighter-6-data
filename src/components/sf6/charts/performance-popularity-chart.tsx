import { CartesianGrid, ReferenceLine, Scatter, ScatterChart, XAxis, YAxis, ZAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/chart-container"

import {
  AnalyticsChart,
  ANALYTICS_AXIS_TICK,
  ANALYTICS_CHART_MARGIN,
} from "@/components/sf6/charts/analytics-chart"
import {
  ChartTooltip,
  ChartTooltipContent,
  formatChartTooltipLabel,
  safeTooltipName,
} from "@/components/ui/chart-tooltip"

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
}) => (
  <AnalyticsChart config={PERFORMANCE_POPULARITY_CONFIG} className="h-[380px]">
    <ScatterChart accessibilityLayer margin={ANALYTICS_CHART_MARGIN}>
      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
      <XAxis
        type="number"
        dataKey="performance"
        domain={[0, 100]}
        tick={ANALYTICS_AXIS_TICK}
        tickFormatter={(value) => `${value}%`}
        name="Average win rate"
        label="Average win rate"
      />
      <YAxis
        type="number"
        dataKey="usage"
        domain={[0, "auto"]}
        tick={ANALYTICS_AXIS_TICK}
        tickFormatter={(value) => `${value}%`}
        name="Usage share"
        label="Usage share"
      />
      <ZAxis type="number" dataKey="usage" range={[48, 160]} />
      <ReferenceLine x={50} stroke="var(--muted-foreground)" strokeDasharray="2 2" />
      {usageReference === null ? null : (
        <ReferenceLine y={usageReference} stroke="var(--muted-foreground)" strokeDasharray="2 2" />
      )}
      <ChartTooltip
        content={
          <ChartTooltipContent
            labelFormatter={formatChartTooltipLabel}
            formatter={(value, name) => [
              typeof value === "number" ? `${value.toFixed(1)}%` : "—",
              safeTooltipName(name),
            ]}
          />
        }
      />
      <Scatter name="Characters" data={data} fill="var(--color-performance)" />
    </ScatterChart>
  </AnalyticsChart>
)

export { PerformancePopularityChart, type PerformancePopularityPoint }
