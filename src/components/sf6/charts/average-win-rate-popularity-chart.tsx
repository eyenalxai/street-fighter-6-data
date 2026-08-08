import { useMemo } from "react"
import { ReferenceLine, ZAxis } from "recharts"

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

type AverageWinRatePopularityPoint = {
  characterId: CharacterId
  name: string
  averageWinRate: number
  usage: number
  weightedAverageWinRate: number | null
  floor: number | null
}
const PERFORMANCE_POPULARITY_CONFIG = {
  averageWinRate: { label: "Average win rate" },
  usage: { label: "Usage share" },
} satisfies ChartConfig

const AverageWinRatePopularityChart = ({
  data,
  usageReference,
}: {
  data: readonly AverageWinRatePopularityPoint[]
  usageReference: number | null
}) => {
  const xDomain = useMemo(
    () => computeAxisDomain(collectRecordValues(data, ["averageWinRate"]), { anchors: [50] }),
    [data],
  )
  const yDomain = useMemo(
    () =>
      computeAxisDomain(collectRecordValues(data, ["usage"]), {
        anchors: usageReference === null ? [] : [usageReference],
      }),
    [data, usageReference],
  )

  return (
    <AnalyticsScatterChart
      config={PERFORMANCE_POPULARITY_CONFIG}
      valueFormat="percent"
      xDataKey="averageWinRate"
      xDomain={xDomain}
      xName="Average win rate"
      yDataKey="usage"
      yDomain={yDomain}
      yName="Usage share"
    >
      <ZAxis type="number" dataKey="usage" range={[48, 160]} />
      <ReferenceLine x={50} stroke="var(--muted-foreground)" strokeDasharray="2 2" />
      {usageReference === null ? null : (
        <ReferenceLine y={usageReference} stroke="var(--muted-foreground)" strokeDasharray="2 2" />
      )}
      <ChartTooltip
        content={
          <ChartTooltipContent labelFormatter={formatChartTooltipLabel} valueFormat="percent" />
        }
      />
      <CharacterScatter name="Characters" data={data} />
    </AnalyticsScatterChart>
  )
}

export { AverageWinRatePopularityChart, type AverageWinRatePopularityPoint }
