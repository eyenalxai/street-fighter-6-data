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

type CharacterDeltaPoint = {
  characterId: CharacterId
  name: string
  usageDelta: number
  averageWinRateDelta: number
}

type CharacterDeltaChartProps = {
  data: readonly CharacterDeltaPoint[]
  scatterName: string
}

const CHARACTER_DELTA_CONFIG = {
  usageDelta: { label: "Usage change" },
  averageWinRateDelta: { label: "Win rate change" },
} satisfies ChartConfig

const CharacterDeltaChart = ({ data, scatterName }: CharacterDeltaChartProps) => {
  const xDomain = useMemo(
    () => computeAxisDomain(collectRecordValues(data, ["usageDelta"]), { anchors: [0] }),
    [data],
  )
  const yDomain = useMemo(
    () => computeAxisDomain(collectRecordValues(data, ["averageWinRateDelta"]), { anchors: [0] }),
    [data],
  )

  return (
    <AnalyticsScatterChart
      config={CHARACTER_DELTA_CONFIG}
      valueFormat="percentagePoints"
      xDataKey="usageDelta"
      xDomain={xDomain}
      xName="Usage change"
      yDataKey="averageWinRateDelta"
      yDomain={yDomain}
      yName="Win rate change"
    >
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
      <CharacterScatter name={scatterName} data={data} />
    </AnalyticsScatterChart>
  )
}

export { CharacterDeltaChart }
