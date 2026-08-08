import { useMemo } from "react"
import { ReferenceLine } from "recharts"

import type { ChartConfig } from "@/components/ui/chart-container"
import type { CharacterId } from "@/lib/sf6/model"

import { AnalyticsScatterChart } from "@/components/sf6/charts/analytics-scatter-chart"
import { CharacterScatter } from "@/components/sf6/charts/character-scatter"
import {
  ChartTooltip,
  ChartTooltipContent,
  formatChartTooltipLabel,
} from "@/components/ui/chart-tooltip"
import { collectRecordValues, computeAxisDomain } from "@/lib/sf6/charts/axis-domain"

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
    <AnalyticsScatterChart
      config={MATCHUP_PROFILE_CONFIG}
      valueFormat="percent"
      xDataKey="usage"
      xDomain={xDomain}
      xName="Opponent usage"
      yDataKey="winRate"
      yDomain={yDomain}
      yName="Matchup win rate"
    >
      <ReferenceLine y={50} stroke="var(--muted-foreground)" strokeDasharray="2 2" />
      <ChartTooltip
        content={
          <ChartTooltipContent labelFormatter={formatChartTooltipLabel} valueFormat="percent" />
        }
      />
      <CharacterScatter name="Matchups" data={data} />
    </AnalyticsScatterChart>
  )
}

export { MatchupProfileChart, type MatchupProfilePoint }
