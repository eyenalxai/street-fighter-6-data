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

const ChangeDeltaChart = ({ data }: { data: readonly ChangeDeltaPoint[] }) => {
  const xDomain = useMemo(
    () => computeAxisDomain(collectRecordValues(data, ["usageDelta"]), { anchors: [0] }),
    [data],
  )
  const yDomain = useMemo(
    () => computeAxisDomain(collectRecordValues(data, ["performanceDelta"]), { anchors: [0] }),
    [data],
  )

  return (
    <AnalyticsChart config={CHANGE_DELTA_CONFIG} className="h-[380px]">
      <ScatterChart accessibilityLayer margin={ANALYTICS_SCATTER_CHART_MARGIN}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="usageDelta"
          domain={xDomain}
          tick={ANALYTICS_AXIS_TICK}
          tickFormatter={CHART_TICK_FORMATTERS.percentagePoints}
          tickMargin={8}
          label={analyticsXAxisLabel("Usage change (percentage points)")}
        />
        <YAxis
          type="number"
          dataKey="performanceDelta"
          domain={yDomain}
          width={ANALYTICS_Y_AXIS_WIDTH}
          tick={ANALYTICS_AXIS_TICK}
          tickFormatter={CHART_TICK_FORMATTERS.percentagePoints}
          tickMargin={4}
          label={analyticsYAxisLabel("Performance change (percentage points)")}
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
        <Scatter name="Character changes" data={data} fill="var(--color-performanceDelta)" />
      </ScatterChart>
    </AnalyticsChart>
  )
}

export { ChangeDeltaChart, type ChangeDeltaPoint }
