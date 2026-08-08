import { useNavigate } from "@tanstack/react-router"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/chart"
import type { LeagueId, ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { ControlComparisonSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import {
  AnalyticsChart,
  ANALYTICS_AXIS_TICK,
  ANALYTICS_CHART_MARGIN,
} from "@/components/sf6/charts/analytics-chart"
import { RankField } from "@/components/sf6/filters/rank-field"
import { ReportingPeriodField } from "@/components/sf6/filters/reporting-period-field"
import { ResultsContent, ResultsPending } from "@/components/sf6/results-state"
import { DeltaValue, formatPercentagePoints, WinRate } from "@/components/sf6/win-rate"
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
import { formatReportingPeriod } from "@/lib/sf6/model"
import { controlComparisonQueryOptions } from "@/lib/sf6/query-options"

const chartConfig = {
  positiveDelta: {
    label: "Modern controls − Classic controls",
    color: "var(--wr-strong)",
  },
  negativeDelta: {
    label: "Modern controls − Classic controls",
    color: "var(--wr-weak)",
  },
} satisfies ChartConfig

type ControlComparisonViewProps = {
  period: ReportingPeriod
  search: ControlComparisonSearch
  meta: MetaData
}

const ControlComparisonResults = ({ period, search, meta }: ControlComparisonViewProps) => {
  const input = {
    period,
    league: search.league,
  }
  const { data, displayedInput, isUpdating } = useAnalyticsQuery(
    controlComparisonQueryOptions(input),
    input,
  )
  if (data === undefined) {
    return <ResultsPending />
  }
  const leagueLabel =
    meta.leagues.find((league) => league.id === displayedInput.league)?.label ?? "Rank"
  const chartRows = data.rows.map((row) => {
    return {
      ...row,
      name:
        meta.characters.find((character) => character.id === row.characterId)?.short ??
        row.characterId,
      positiveDelta: row.delta !== null && row.delta > 0 ? row.delta : null,
      negativeDelta: row.delta !== null && row.delta < 0 ? row.delta : null,
    }
  })

  return (
    <ResultsContent isUpdating={isUpdating}>
      <AnalyticsPanel
        title="Modern vs Classic controls"
        description={`Modern controls minus Classic controls · ${leagueLabel} · ${formatReportingPeriod(displayedInput.period)}`}
      >
        <p className="mb-4 max-w-3xl text-xs text-muted-foreground">
          For each character, this compares its average win rate when the player uses Modern
          controls with its average win rate when the player uses Classic controls. Each average
          includes both opponent control styles. Positive values favor Modern controls.
        </p>
        <AnalyticsChart config={chartConfig} className="h-[360px]">
          <BarChart accessibilityLayer data={chartRows} margin={ANALYTICS_CHART_MARGIN}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={ANALYTICS_AXIS_TICK}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              domain={[-10, 10]}
              tick={ANALYTICS_AXIS_TICK}
              tickFormatter={(value) => `${value}pp`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    formatPercentagePoints(typeof value === "number" ? value : null),
                    name,
                  ]}
                />
              }
            />
            <Bar dataKey="positiveDelta" fill="var(--color-positiveDelta)" />
            <Bar dataKey="negativeDelta" fill="var(--color-negativeDelta)" />
          </BarChart>
        </AnalyticsChart>
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Character results"
        description="All available characters, ordered by Modern controls minus Classic controls."
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Character</TableHead>
              <TableHead scope="col" className="text-right">
                Classic player controls
              </TableHead>
              <TableHead scope="col" className="text-right">
                Modern player controls
              </TableHead>
              <TableHead scope="col" className="text-right">
                Modern minus Classic (pp)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.characterId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CharacterBadge characterId={row.characterId} size="small" />
                    <CharacterName characterId={row.characterId} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <WinRate value={row.classic} />
                </TableCell>
                <TableCell className="text-right">
                  <WinRate value={row.modern} />
                </TableCell>
                <TableCell className="text-right">
                  <DeltaValue value={row.delta} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalyticsPanel>
    </ResultsContent>
  )
}

const ControlComparisonView = ({ period, search, meta }: ControlComparisonViewProps) => {
  const navigate = useNavigate({ from: "/roster/controls" })
  const change = (changes: Partial<{ period: ReportingPeriod; league: LeagueId }>) => {
    void navigate({
      search: (previous) => {
        return { ...previous, ...changes }
      },
      replace: true,
    })
  }
  const toolbar = (
    <AnalysisToolbar
      title="Player control styles"
      description="Which control style has the higher average win rate for each character?"
    >
      <ReportingPeriodField
        value={period}
        periods={meta.periods}
        onChange={(value) => {
          change({ period: value })
        }}
      />
      <RankField
        value={search.league}
        leagues={meta.leagues}
        onChange={(value) => {
          change({ league: value })
        }}
      />
    </AnalysisToolbar>
  )

  return (
    <AnalysisPage toolbar={toolbar} resetKey={`${period}|${search.league}`}>
      <ControlComparisonResults period={period} search={search} meta={meta} />
    </AnalysisPage>
  )
}

export { ControlComparisonView }
