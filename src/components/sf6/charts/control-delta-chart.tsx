import { useMemo } from "react"
import { CartesianGrid, ReferenceLine, Scatter, ScatterChart, XAxis, YAxis } from "recharts"

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

type ControlDeltaPoint = {
  name: string
  performanceDelta: number
  usageDelta: number
}
const CONTROL_DELTA_CONFIG = {
  performanceDelta: { label: "Performance change", color: "var(--chart-1)" },
} satisfies ChartConfig

const ControlDeltaChart = ({ data }: { data: readonly ControlDeltaPoint[] }) => {
  const xDomain = useMemo(
    () => computeAxisDomain(collectRecordValues(data, ["usageDelta"]), { anchors: [0] }),
    [data],
  )
  const yDomain = useMemo(
    () => computeAxisDomain(collectRecordValues(data, ["performanceDelta"]), { anchors: [0] }),
    [data],
  )

  return (
    <AnalyticsChart config={CONTROL_DELTA_CONFIG} size="default">
      <ScatterChart accessibilityLayer margin={ANALYTICS_SCATTER_CHART_MARGIN}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="usageDelta"
          domain={xDomain}
          tick={ANALYTICS_AXIS_TICK}
          tickFormatter={CHART_TICK_FORMATTERS.percentagePoints}
          tickMargin={8}
          label={analyticsXAxisLabel("Modern minus Classic usage")}
        />
        <YAxis
          type="number"
          dataKey="performanceDelta"
          domain={yDomain}
          width={ANALYTICS_Y_AXIS_WIDTH}
          tick={ANALYTICS_AXIS_TICK}
          tickFormatter={CHART_TICK_FORMATTERS.percentagePoints}
          tickMargin={4}
          label={analyticsYAxisLabel("Modern minus Classic performance")}
        />
        <ReferenceLine x={0} stroke="var(--muted-foreground)" />
        <ReferenceLine y={0} stroke="var(--muted-foreground)" />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={formatChartTooltipLabel}
              formatter={(value, name) => [
                typeof value === "number"
                  ? CHART_TOOLTIP_VALUE_FORMATTERS.percentagePoints(value)
                  : "—",
                safeTooltipName(name),
              ]}
            />
          }
        />
        <Scatter name="Control differences" data={data} fill="var(--color-performanceDelta)" />
      </ScatterChart>
    </AnalyticsChart>
  )
}

export { ControlDeltaChart, type ControlDeltaPoint }
