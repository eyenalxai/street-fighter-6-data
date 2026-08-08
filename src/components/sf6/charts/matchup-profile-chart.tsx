import { useMemo } from "react"
import { CartesianGrid, ReferenceLine, ScatterChart, XAxis, YAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/chart-container"
import type { CharacterId } from "@/lib/sf6/model"

import {
  AnalyticsChart,
  ANALYTICS_AXIS_TICK,
  ANALYTICS_SCATTER_CHART_MARGIN,
  ANALYTICS_Y_AXIS_WIDTH,
  analyticsXAxisLabel,
  analyticsYAxisLabel,
} from "@/components/sf6/charts/analytics-chart"
import { CharacterScatter } from "@/components/sf6/charts/character-scatter"
import {
  ChartTooltip,
  ChartTooltipContent,
  formatChartTooltipLabel,
} from "@/components/ui/chart-tooltip"
import { collectRecordValues, computeAxisDomain } from "@/lib/sf6/charts/axis-domain"
import { CHART_TICK_FORMATTERS } from "@/lib/sf6/charts/format"

type MatchupProfilePoint = {
  characterId: CharacterId
  name: string
  usage: number
  winRate: number
}
const MATCHUP_PROFILE_CONFIG = {
  usage: { label: "Opponent usage" },
  winRate: { label: "Matchup win rate" },
} satisfies ChartConfig

const MatchupProfileChart = ({ data }: { data: readonly MatchupProfilePoint[] }) => {
  const xDomain = useMemo(() => computeAxisDomain(collectRecordValues(data, ["usage"])), [data])
  const yDomain = useMemo(
    () => computeAxisDomain(collectRecordValues(data, ["winRate"]), { anchors: [50] }),
    [data],
  )

  return (
    <AnalyticsChart config={MATCHUP_PROFILE_CONFIG} size="default">
      <ScatterChart accessibilityLayer margin={ANALYTICS_SCATTER_CHART_MARGIN}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="usage"
          domain={xDomain}
          name="Opponent usage"
          tick={ANALYTICS_AXIS_TICK}
          tickFormatter={CHART_TICK_FORMATTERS.percent}
          tickMargin={8}
          label={analyticsXAxisLabel("Opponent usage share")}
        />
        <YAxis
          type="number"
          dataKey="winRate"
          domain={yDomain}
          name="Win rate"
          width={ANALYTICS_Y_AXIS_WIDTH}
          tick={ANALYTICS_AXIS_TICK}
          tickFormatter={CHART_TICK_FORMATTERS.percent}
          tickMargin={4}
          label={analyticsYAxisLabel("Selected character win rate")}
        />
        <ReferenceLine y={50} stroke="var(--muted-foreground)" strokeDasharray="2 2" />
        <ChartTooltip
          content={
            <ChartTooltipContent labelFormatter={formatChartTooltipLabel} valueFormat="percent" />
          }
        />
        <CharacterScatter name="Matchups" data={data} />
      </ScatterChart>
    </AnalyticsChart>
  )
}

export { MatchupProfileChart, type MatchupProfilePoint }
