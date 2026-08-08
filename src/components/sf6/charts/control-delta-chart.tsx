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
} from "@/components/ui/chart-tooltip"
import { collectRecordValues, computeAxisDomain } from "@/lib/sf6/charts/axis-domain"
import { CHART_TICK_FORMATTERS } from "@/lib/sf6/charts/format"

type ControlDeltaPoint = {
  name: string
  averageWinRateDelta: number
  usageDelta: number
}
const CONTROL_DELTA_CONFIG = {
  usageDelta: { label: "Usage difference" },
  averageWinRateDelta: { label: "Win rate change", color: "var(--chart-1)" },
} satisfies ChartConfig

const ControlDeltaChart = ({ data }: { data: readonly ControlDeltaPoint[] }) => {
  const xDomain = useMemo(
    () => computeAxisDomain(collectRecordValues(data, ["usageDelta"]), { anchors: [0] }),
    [data],
  )
  const yDomain = useMemo(
    () => computeAxisDomain(collectRecordValues(data, ["averageWinRateDelta"]), { anchors: [0] }),
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
          dataKey="averageWinRateDelta"
          domain={yDomain}
          width={ANALYTICS_Y_AXIS_WIDTH}
          tick={ANALYTICS_AXIS_TICK}
          tickFormatter={CHART_TICK_FORMATTERS.percentagePoints}
          tickMargin={4}
          label={analyticsYAxisLabel("Modern minus Classic win rate")}
        />
        <ReferenceLine x={0} stroke="var(--muted-foreground)" />
        <ReferenceLine y={0} stroke="var(--muted-foreground)" />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={formatChartTooltipLabel}
              valueFormat="percentagePoints"
            />
          }
        />
        <Scatter name="Control differences" data={data} fill="var(--color-averageWinRateDelta)" />
      </ScatterChart>
    </AnalyticsChart>
  )
}

export { ControlDeltaChart, type ControlDeltaPoint }
