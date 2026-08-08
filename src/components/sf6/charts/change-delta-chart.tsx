import { CartesianGrid, ReferenceLine, Scatter, ScatterChart, XAxis, YAxis } from "recharts"

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

type ChangeDeltaPoint = {
  name: string
  usageDelta: number
  performanceDelta: number
  weightedPerformanceDelta: number | null
  debut: boolean
}
const CHANGE_DELTA_CONFIG = {
  performanceDelta: { label: "Performance change", color: "var(--chart-1)" },
} satisfies ChartConfig

const ChangeDeltaChart = ({ data }: { data: readonly ChangeDeltaPoint[] }) => (
  <AnalyticsChart config={CHANGE_DELTA_CONFIG} className="h-[380px]">
    <ScatterChart accessibilityLayer margin={ANALYTICS_CHART_MARGIN}>
      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
      <XAxis
        type="number"
        dataKey="usageDelta"
        tick={ANALYTICS_AXIS_TICK}
        tickFormatter={(value) => `${value} pp`}
        label="Usage change (percentage points)"
      />
      <YAxis
        type="number"
        dataKey="performanceDelta"
        tick={ANALYTICS_AXIS_TICK}
        tickFormatter={(value) => `${value} pp`}
        label="Performance change (percentage points)"
      />
      <ReferenceLine x={0} stroke="var(--muted-foreground)" />
      <ReferenceLine y={0} stroke="var(--muted-foreground)" />
      <ChartTooltip
        content={
          <ChartTooltipContent
            labelFormatter={formatChartTooltipLabel}
            formatter={(value, name) => [
              typeof value === "number" ? `${value.toFixed(1)} pp` : "—",
              safeTooltipName(name),
            ]}
          />
        }
      />
      <Scatter name="Character changes" data={data} fill="var(--color-performanceDelta)" />
    </ScatterChart>
  </AnalyticsChart>
)

export { ChangeDeltaChart, type ChangeDeltaPoint }
