import { useNavigate } from "@tanstack/react-router"
import { useMemo } from "react"
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/chart"
import type { CharacterId, ControlMatchup } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { RankId } from "@/lib/sf6/ranks"
import type { TrendSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import {
  AnalyticsChart,
  ANALYTICS_AXIS_TICK,
  ANALYTICS_CHART_MARGIN,
  ANALYTICS_X_AXIS_TICK,
} from "@/components/sf6/charts/analytics-chart"
import { CharacterMultiField } from "@/components/sf6/filters/character-multi-field"
import { ControlMatchupField } from "@/components/sf6/filters/control-matchup-field"
import { RankField } from "@/components/sf6/filters/rank-field"
import { ResultsContent, ResultsPending } from "@/components/sf6/results-state"
import { ResultsStatus } from "@/components/sf6/results-status"
import { formatWr } from "@/components/sf6/win-rate"
import { ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { useAnalyticsQuery } from "@/hooks/use-analytics-query"
import { formatReportingPeriod } from "@/lib/sf6/model"
import { trendsQueryOptions } from "@/lib/sf6/query-options"
import { getEffectiveControls } from "@/lib/sf6/rank-selection"
import { isMasterSubdivisionRank, getRank } from "@/lib/sf6/ranks"

const SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]
const ACTIVE_DOT = { r: 4 }

type TrendComparisonViewProps = {
  search: TrendSearch
  meta: MetaData
}

const TrendResults = ({ search, meta }: TrendComparisonViewProps) => {
  const input = {
    rank: search.rank,
    controls: getEffectiveControls(search.rank, search.controls),
    characters: search.characters,
  }
  const { data, displayedInput, isUpdating } = useAnalyticsQuery(trendsQueryOptions(input), input)
  const series = data?.series
  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        (series ?? []).map((characterSeries, index) => [
          characterSeries.characterId,
          {
            label: meta.characters.find((character) => character.id === characterSeries.characterId)
              ?.name,
            color: SERIES_COLORS[index % SERIES_COLORS.length],
          },
        ]),
      ) satisfies ChartConfig,
    [series, meta.characters],
  )
  const chartData = useMemo(() => {
    const points = series?.[0]?.points ?? []
    return points.map((point, index) => {
      const row: Record<string, number | string | null> = {
        period: formatReportingPeriod(point.period),
      }
      for (const characterSeries of series ?? []) {
        row[characterSeries.characterId] = characterSeries.points[index]?.winRate ?? null
      }
      return row
    })
  }, [series])
  if (data === undefined) {
    return <ResultsPending />
  }
  const currentSeries = data.series
  const rankLabel = getRank(displayedInput.rank)?.label ?? "Rank"
  const controlLabel =
    meta.controls.find((control) => control.id === displayedInput.controls)?.label ??
    displayedInput.controls

  return (
    <ResultsContent isUpdating={isUpdating}>
      <AnalyticsPanel
        title="Average win rate by reporting period"
        description={`${rankLabel} · ${controlLabel} · each point is the average win rate against available opponents; gaps mean no reported value`}
      >
        <AnalyticsChart config={chartConfig} className="h-[380px]">
          <LineChart accessibilityLayer data={chartData} margin={ANALYTICS_CHART_MARGIN}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="period"
              tick={ANALYTICS_X_AXIS_TICK}
              angle={-40}
              textAnchor="end"
              height={50}
              interval={0}
            />
            <YAxis
              domain={[35, 65]}
              tick={ANALYTICS_AXIS_TICK}
              tickFormatter={(value) => `${value}%`}
            />
            <ReferenceLine y={50} stroke="var(--muted-foreground)" strokeDasharray="2 2" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    formatWr(typeof value === "number" ? value : null),
                    name,
                  ]}
                />
              }
            />
            <Legend content={<ChartLegendContent />} />
            {currentSeries.map((characterSeries, index) => (
              <Line
                key={characterSeries.characterId}
                type="monotone"
                dataKey={characterSeries.characterId}
                stroke={`var(--color-${characterSeries.characterId})`}
                strokeWidth={2}
                dot={false}
                activeDot={ACTIVE_DOT}
                name={
                  meta.characters.find((character) => character.id === characterSeries.characterId)
                    ?.name
                }
                strokeOpacity={index < SERIES_COLORS.length ? 1 : 0.8}
              />
            ))}
          </LineChart>
        </AnalyticsChart>
      </AnalyticsPanel>
    </ResultsContent>
  )
}

const TrendEmptyState = () => (
  <>
    <ResultsStatus message="No trend characters selected." />
    <Empty className="min-h-[360px] border border-dashed">
      <EmptyHeader>
        <EmptyTitle>Select characters to compare</EmptyTitle>
        <EmptyDescription>
          Choose one or more characters in the Characters field to see their average win rates by
          reporting period.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  </>
)

const TrendComparisonView = ({ search, meta }: TrendComparisonViewProps) => {
  const navigate = useNavigate({ from: "/comparisons/trends" })
  const change = (
    changes: Partial<{
      rank: RankId
      controls: ControlMatchup
      characters: CharacterId[]
    }>,
  ) => {
    void navigate({
      search: (previous) => {
        return { ...previous, ...changes }
      },
      replace: true,
    })
  }
  const toolbar = (
    <AnalysisToolbar
      title="Trends"
      description="How do selected characters' average win rates change across reporting periods?"
    >
      <RankField
        value={search.rank}
        ranks={meta.ranks}
        onChange={(value) => {
          change({ rank: value })
        }}
      />
      <ControlMatchupField
        value={getEffectiveControls(search.rank, search.controls)}
        controls={meta.controls}
        disabled={isMasterSubdivisionRank(search.rank)}
        onChange={(value) => {
          change({ controls: value })
        }}
      />
      <CharacterMultiField
        label="Characters"
        value={search.characters}
        characters={meta.characters}
        className="sm:col-span-2"
        onChange={(value) => {
          change({ characters: value })
        }}
        onClear={() => {
          change({ characters: [] })
        }}
        description="Select the characters whose average win rates you want to compare."
      />
    </AnalysisToolbar>
  )

  return (
    <AnalysisPage
      toolbar={toolbar}
      resetKey={`${search.rank}|${search.controls}|${search.characters.join(",")}`}
    >
      {search.characters.length === 0 ? (
        <TrendEmptyState />
      ) : (
        <TrendResults search={search} meta={meta} />
      )}
    </AnalysisPage>
  )
}

export { TrendComparisonView }
