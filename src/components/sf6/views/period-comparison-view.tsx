import { useNavigate } from "@tanstack/react-router"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/chart"
import type { ControlMatchup, ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { RankId } from "@/lib/sf6/ranks"
import type { PeriodComparisonSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import {
  AnalyticsChart,
  ANALYTICS_AXIS_TICK,
  ANALYTICS_CHART_MARGIN,
} from "@/components/sf6/charts/analytics-chart"
import { ControlMatchupField } from "@/components/sf6/filters/control-matchup-field"
import { RankField } from "@/components/sf6/filters/rank-field"
import { ReportingPeriodField } from "@/components/sf6/filters/reporting-period-field"
import { ResultsContent, ResultsPending } from "@/components/sf6/results-state"
import {
  DeltaValue,
  formatPercentagePoints,
  getDisplayedDelta,
  WinRate,
} from "@/components/sf6/win-rate"
import { Badge } from "@/components/ui/badge"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
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
import { periodComparisonQueryOptions } from "@/lib/sf6/query-options"
import { getEffectiveControls, getPeriodsForRank } from "@/lib/sf6/rank-selection"
import { getRank, isMasterSubdivisionRank } from "@/lib/sf6/ranks"

const chartConfig = {
  positiveDelta: {
    label: "Increase in average win rate",
    color: "var(--wr-strong)",
  },
  negativeDelta: {
    label: "Decrease in average win rate",
    color: "var(--wr-weak)",
  },
} satisfies ChartConfig

type PeriodComparisonViewProps = {
  fromPeriod: ReportingPeriod
  toPeriod: ReportingPeriod
  search: PeriodComparisonSearch
  meta: MetaData
}

const PeriodComparisonData = ({
  fromPeriod,
  toPeriod,
  search,
  meta,
}: PeriodComparisonViewProps) => {
  const input = {
    fromPeriod,
    toPeriod,
    rank: search.rank,
    controls: getEffectiveControls(search.rank, search.controls),
  }
  const { data, displayedInput, isUpdating } = useAnalyticsQuery(
    periodComparisonQueryOptions(input),
    input,
  )
  if (data === undefined) {
    return <ResultsPending />
  }
  const rows = data.rows.map((row) => {
    const displayedDelta = getDisplayedDelta(row.delta)
    return {
      ...row,
      short:
        meta.characters.find((character) => character.id === row.characterId)?.short ??
        row.characterId,
      positiveDelta: displayedDelta !== null && displayedDelta > 0 ? row.delta : null,
      negativeDelta: displayedDelta !== null && displayedDelta < 0 ? row.delta : null,
    }
  })
  const changedRows = data.rows.filter((row) => row.delta !== null)
  const biggest = changedRows.toSorted(
    (left, right) => Math.abs(right.delta ?? 0) - Math.abs(left.delta ?? 0),
  )[0]
  const improved = changedRows.filter((row) => (getDisplayedDelta(row.delta) ?? 0) > 0).length
  const declined = changedRows.filter((row) => (getDisplayedDelta(row.delta) ?? 0) < 0).length
  const rankLabel = getRank(displayedInput.rank)?.label ?? "Rank"
  const controlLabel =
    meta.controls.find((control) => control.id === displayedInput.controls)?.label ??
    displayedInput.controls

  return (
    <ResultsContent isUpdating={isUpdating}>
      <AnalyticsPanel
        title="Average win-rate change between periods"
        description={`${formatReportingPeriod(displayedInput.fromPeriod)} → ${formatReportingPeriod(displayedInput.toPeriod)} · ${rankLabel} · ${controlLabel}`}
        action={
          <div className="flex flex-wrap justify-end gap-1">
            <Badge variant="outline">{improved} improved</Badge>
            <Badge variant="outline">{declined} declined</Badge>
            <Badge variant="secondary">
              Largest change {biggest === undefined ? "—" : formatPercentagePoints(biggest.delta)}
            </Badge>
          </div>
        }
      >
        <AnalyticsChart config={chartConfig} className="h-[360px]">
          <BarChart accessibilityLayer data={rows} margin={ANALYTICS_CHART_MARGIN}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="short" tick={ANALYTICS_AXIS_TICK} />
            <YAxis
              domain={[-15, 15]}
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
        title="Every character's period comparison"
        description="Change equals the later period's average win rate minus the earlier period's. A dash means one period has no reported value."
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Character</TableHead>
              <TableHead scope="col" className="text-right">
                {formatReportingPeriod(displayedInput.fromPeriod)}
              </TableHead>
              <TableHead scope="col" className="text-right">
                {formatReportingPeriod(displayedInput.toPeriod)}
              </TableHead>
              <TableHead scope="col" className="text-right">
                Change (pp)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.characterId}>
                <TableCell>
                  {meta.characters.find((character) => character.id === row.characterId)?.name ??
                    row.characterId}
                </TableCell>
                <TableCell className="text-right">
                  <WinRate value={row.before} />
                </TableCell>
                <TableCell className="text-right">
                  <WinRate value={row.after} />
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

const PeriodComparisonResults = ({
  fromPeriod,
  toPeriod,
  search,
  meta,
}: PeriodComparisonViewProps) => {
  if (fromPeriod === toPeriod) {
    return (
      <Empty className="min-h-[360px] border border-dashed">
        <EmptyHeader>
          <EmptyTitle>Choose two different reporting periods</EmptyTitle>
          <EmptyDescription>
            Choose different From and To periods to calculate a change.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <PeriodComparisonData fromPeriod={fromPeriod} toPeriod={toPeriod} search={search} meta={meta} />
  )
}

const PeriodComparisonView = ({
  fromPeriod,
  toPeriod,
  search,
  meta,
}: PeriodComparisonViewProps) => {
  const navigate = useNavigate({ from: "/comparisons/periods" })
  const change = (
    changes: Partial<{
      fromPeriod: ReportingPeriod
      toPeriod: ReportingPeriod
      rank: RankId
      controls: ControlMatchup
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
      title="Period comparison"
      description="How did each character's average win rate change between two reporting periods?"
    >
      <ReportingPeriodField
        label="From period"
        value={fromPeriod}
        periods={getPeriodsForRank(search.rank, meta.periods, meta.subdivisionPeriods)}
        onChange={(value) => {
          change({ fromPeriod: value })
        }}
      />
      <ReportingPeriodField
        label="To period"
        value={toPeriod}
        periods={getPeriodsForRank(search.rank, meta.periods, meta.subdivisionPeriods)}
        onChange={(value) => {
          change({ toPeriod: value })
        }}
      />
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
    </AnalysisToolbar>
  )

  return (
    <AnalysisPage
      toolbar={toolbar}
      resetKey={`${fromPeriod}|${toPeriod}|${search.rank}|${search.controls}`}
    >
      <PeriodComparisonResults
        fromPeriod={fromPeriod}
        toPeriod={toPeriod}
        search={search}
        meta={meta}
      />
    </AnalysisPage>
  )
}

export { PeriodComparisonView }
