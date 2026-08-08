import { Link, useNavigate } from "@tanstack/react-router"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/chart"
import type { CharacterId, ControlMatchup, ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { RankComparisonSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import {
  AnalyticsChart,
  ANALYTICS_AXIS_TICK,
  ANALYTICS_CHART_MARGIN,
} from "@/components/sf6/charts/analytics-chart"
import { CharacterField } from "@/components/sf6/filters/character-field"
import { ControlMatchupField } from "@/components/sf6/filters/control-matchup-field"
import { ReportingPeriodField } from "@/components/sf6/filters/reporting-period-field"
import { ResultsContent, ResultsPending } from "@/components/sf6/results-state"
import { DeltaValue, formatWr, WinRate } from "@/components/sf6/win-rate"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAnalyticsQuery } from "@/hooks/use-analytics-query"
import { toRankSearch } from "@/lib/sf6/navigation"
import { rankProgressionQueryOptions } from "@/lib/sf6/query-options"

const chartConfig = {
  winRate: {
    label: "Average win rate",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

type RankComparisonViewProps = {
  period: ReportingPeriod
  search: RankComparisonSearch
  meta: MetaData
}

const RankComparisonResults = ({ period, search, meta }: RankComparisonViewProps) => {
  const input = {
    period,
    controls: search.controls,
    character: search.character,
  }
  const { data, displayedInput, isUpdating } = useAnalyticsQuery(
    rankProgressionQueryOptions(input),
    input,
  )
  if (data === undefined) {
    return <ResultsPending />
  }
  const rookie = data.points.find((point) => point.leagueId === "1")?.winRate ?? null
  const master = data.points.find((point) => point.leagueId === "8")?.winRate ?? null
  const selectedRange =
    data.heatmap.find((row) => row.characterId === displayedInput.character)?.range ?? null
  const characterName = meta.characters.find(
    (character) => character.id === displayedInput.character,
  )?.name

  return (
    <ResultsContent isUpdating={isUpdating}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
        <AnalyticsPanel
          title="Average win rate by rank"
          description={`${characterName ?? displayedInput.character} · each point is the average win rate against available opponents; unavailable ranks remain gaps`}
        >
          <AnalyticsChart config={chartConfig}>
            <AreaChart accessibilityLayer data={data.points} margin={ANALYTICS_CHART_MARGIN}>
              <defs>
                <linearGradient id="rank-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={ANALYTICS_AXIS_TICK} />
              <YAxis
                domain={[40, 60]}
                tick={ANALYTICS_AXIS_TICK}
                tickFormatter={(value) => `${value}%`}
              />
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
              <Area
                type="monotone"
                dataKey="winRate"
                stroke="var(--color-winRate)"
                fill="url(#rank-fill)"
              />
            </AreaChart>
          </AnalyticsChart>
        </AnalyticsPanel>
        <AnalyticsPanel
          title="Rank range"
          description="Difference between the Master and Rookie average win rates."
        >
          <dl className="flex flex-col gap-4">
            <div>
              <dt className="text-xs text-muted-foreground">Master minus Rookie</dt>
              <dd>
                <DeltaValue
                  value={rookie === null || master === null ? null : master - rookie}
                  className="text-lg"
                />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Selected character range across ranks
              </dt>
              <dd>
                <DeltaValue value={selectedRange} className="text-lg" />
              </dd>
            </div>
          </dl>
        </AnalyticsPanel>
      </div>
      <AnalyticsPanel
        title="Average win rate for every character and rank"
        description="Range across ranks is the highest minus lowest average win rate for that character."
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Character</TableHead>
              {data.heatmap[0]?.points.map((point) => (
                <TableHead key={point.leagueId} scope="col" className="text-right">
                  {point.label}
                </TableHead>
              ))}
              <TableHead scope="col" className="text-right">
                Range across ranks (pp)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.heatmap.map((row) => (
              <TableRow key={row.characterId}>
                <TableCell>
                  <Link
                    to="/comparisons/ranks"
                    search={toRankSearch({
                      period: displayedInput.period,
                      controls: displayedInput.controls,
                      character: row.characterId,
                    })}
                    className="inline-flex items-center gap-2 font-medium hover:underline"
                  >
                    <CharacterBadge characterId={row.characterId} size="small" />
                    <CharacterName characterId={row.characterId} />
                  </Link>
                </TableCell>
                {row.points.map((point) => (
                  <TableCell key={point.leagueId} className="text-right">
                    <WinRate value={point.winRate} />
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <DeltaValue value={row.range} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalyticsPanel>
    </ResultsContent>
  )
}

const RankComparisonView = ({ period, search, meta }: RankComparisonViewProps) => {
  const navigate = useNavigate({ from: "/comparisons/ranks" })
  const change = (
    changes: Partial<{
      period: ReportingPeriod
      controls: ControlMatchup
      character: CharacterId
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
      title="Rank comparison"
      description="How does this character's average win rate vary by rank?"
    >
      <ReportingPeriodField
        value={period}
        periods={meta.periods}
        onChange={(value) => {
          change({ period: value })
        }}
      />
      <ControlMatchupField
        value={search.controls}
        controls={meta.controls}
        onChange={(value) => {
          change({ controls: value })
        }}
      />
      <CharacterField
        label="Character"
        value={search.character}
        characters={meta.characters}
        onChange={(value) => {
          change({ character: value })
        }}
      />
    </AnalysisToolbar>
  )

  return (
    <AnalysisPage toolbar={toolbar} resetKey={`${period}|${search.controls}|${search.character}`}>
      <RankComparisonResults period={period} search={search} meta={meta} />
    </AnalysisPage>
  )
}

export { RankComparisonView }
