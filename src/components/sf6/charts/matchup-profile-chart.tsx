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

type MatchupProfilePoint = {
  name: string
  usage: number
  winRate: number
}
const MATCHUP_PROFILE_CONFIG = {
  winRate: { label: "Matchup win rate", color: "var(--chart-1)" },
} satisfies ChartConfig

const MatchupProfileChart = ({ data }: { data: readonly MatchupProfilePoint[] }) => (
  <AnalyticsChart config={MATCHUP_PROFILE_CONFIG} className="h-[360px]">
    <ScatterChart accessibilityLayer margin={ANALYTICS_CHART_MARGIN}>
      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
      <XAxis
        type="number"
        dataKey="usage"
        name="Opponent usage"
        tick={ANALYTICS_AXIS_TICK}
        tickFormatter={(value) => `${value}%`}
        label="Opponent usage share"
      />
      <YAxis
        type="number"
        dataKey="winRate"
        domain={[0, 100]}
        name="Win rate"
        tick={ANALYTICS_AXIS_TICK}
        tickFormatter={(value) => `${value}%`}
        label="Selected character win rate"
      />
      <ReferenceLine y={50} stroke="var(--muted-foreground)" strokeDasharray="2 2" />
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
      <Scatter name="Matchups" data={data} fill="var(--color-winRate)" />
    </ScatterChart>
  </AnalyticsChart>
)

export { MatchupProfileChart, type MatchupProfilePoint }
