import { useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useMemo } from "react"
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/chart"
import type { CharacterId, ControlMatchup, LeagueId } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
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
import { ResultsStatus } from "@/components/sf6/results-status"
import { formatWr } from "@/components/sf6/win-rate"
import { ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatReportingPeriod } from "@/lib/sf6/model"
import { trendsQueryOptions } from "@/lib/sf6/query-options"

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
  const { data } = useSuspenseQuery(
    trendsQueryOptions({
      league: search.league,
      controls: search.controls,
      characters: search.characters,
    }),
  )
  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        data.series.map((series, index) => [
          series.characterId,
          {
            label: meta.characters.find((character) => character.id === series.characterId)?.name,
            color: SERIES_COLORS[index % SERIES_COLORS.length],
          },
        ]),
      ) satisfies ChartConfig,
    [data.series, meta.characters],
  )
  const chartData = useMemo(() => {
    const points = data.series[0]?.points ?? []
    return points.map((point, index) => {
      const row: Record<string, number | string | null> = {
        period: formatReportingPeriod(point.period),
      }
      for (const series of data.series) {
        row[series.characterId] = series.points[index]?.winRate ?? null
      }
      return row
    })
  }, [data.series])
  const leagueLabel = meta.leagues.find((league) => league.id === search.league)?.label ?? "Rank"
  const controlLabel =
    meta.controls.find((control) => control.id === search.controls)?.label ?? search.controls

  return (
    <>
      <ResultsStatus />
      <AnalyticsPanel
        title="Average win rate by reporting period"
        description={`${leagueLabel} · ${controlLabel} · each point is the average win rate against available opponents; gaps mean no reported value`}
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
            {data.series.map((series, index) => (
              <Line
                key={series.characterId}
                type="monotone"
                dataKey={series.characterId}
                stroke={`var(--color-${series.characterId})`}
                strokeWidth={2}
                dot={false}
                activeDot={ACTIVE_DOT}
                name={
                  meta.characters.find((character) => character.id === series.characterId)?.name
                }
                strokeOpacity={index < SERIES_COLORS.length ? 1 : 0.8}
              />
            ))}
          </LineChart>
        </AnalyticsChart>
      </AnalyticsPanel>
    </>
  )
}

const TrendComparisonView = ({ search, meta }: TrendComparisonViewProps) => {
  const navigate = useNavigate({ from: "/comparisons/trends" })
  const change = (
    changes: Partial<{
      league: LeagueId
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
        value={search.league}
        leagues={meta.leagues}
        onChange={(value) => {
          change({ league: value })
        }}
      />
      <ControlMatchupField
        value={search.controls}
        controls={meta.controls}
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
          if (value.length > 0) {
            change({ characters: value })
          }
        }}
        description="Select the characters whose average win rates you want to compare."
      />
    </AnalysisToolbar>
  )

  return (
    <AnalysisPage
      toolbar={toolbar}
      resetKey={`${search.league}|${search.controls}|${search.characters.join(",")}`}
      skeleton="chart"
    >
      <TrendResults search={search} meta={meta} />
    </AnalysisPage>
  )
}

export { TrendComparisonView }
