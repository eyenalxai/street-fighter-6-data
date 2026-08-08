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

type ChangeDeltaPoint = {
  name: string
  usageDelta: number
  averageWinRateDelta: number
  weightedAverageWinRateDelta: number | null
  debut: boolean
}
const CHANGE_DELTA_CONFIG = {
  usageDelta: { label: "Usage change" },
  averageWinRateDelta: { label: "Win rate change", color: "var(--chart-1)" },
} satisfies ChartConfig

const ChangeDeltaChart = ({ data }: { data: readonly ChangeDeltaPoint[] }) => {
  const xDomain = useMemo(
    () => computeAxisDomain(collectRecordValues(data, ["usageDelta"]), { anchors: [0] }),
    [data],
  )
  const yDomain = useMemo(
    () => computeAxisDomain(collectRecordValues(data, ["averageWinRateDelta"]), { anchors: [0] }),
    [data],
  )

  return (
    <AnalyticsChart config={CHANGE_DELTA_CONFIG} size="default">
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
          dataKey="averageWinRateDelta"
          domain={yDomain}
          width={ANALYTICS_Y_AXIS_WIDTH}
          tick={ANALYTICS_AXIS_TICK}
          tickFormatter={CHART_TICK_FORMATTERS.percentagePoints}
          tickMargin={4}
          label={analyticsYAxisLabel("Win rate change (percentage points)")}
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
        <Scatter name="Character changes" data={data} fill="var(--color-averageWinRateDelta)" />
      </ScatterChart>
    </AnalyticsChart>
  )
}

export { ChangeDeltaChart, type ChangeDeltaPoint }
