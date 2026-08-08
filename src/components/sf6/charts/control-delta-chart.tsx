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

type ControlDeltaPoint = {
  name: string
  performanceDelta: number
  usageDelta: number
}
const CONTROL_DELTA_CONFIG = {
  performanceDelta: { label: "Performance change", color: "var(--chart-1)" },
} satisfies ChartConfig

const ControlDeltaChart = ({ data }: { data: readonly ControlDeltaPoint[] }) => (
  <AnalyticsChart config={CONTROL_DELTA_CONFIG} className="h-[340px]">
    <ScatterChart accessibilityLayer margin={ANALYTICS_CHART_MARGIN}>
      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
      <XAxis
        type="number"
        dataKey="usageDelta"
        tick={ANALYTICS_AXIS_TICK}
        tickFormatter={(value) => `${value} pp`}
        label="Modern minus Classic usage"
      />
      <YAxis
        type="number"
        dataKey="performanceDelta"
        tick={ANALYTICS_AXIS_TICK}
        tickFormatter={(value) => `${value} pp`}
        label="Modern minus Classic performance"
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
      <Scatter name="Control differences" data={data} fill="var(--color-performanceDelta)" />
    </ScatterChart>
  </AnalyticsChart>
)

export { ControlDeltaChart, type ControlDeltaPoint }
