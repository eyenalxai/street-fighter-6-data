import { useNavigate } from "@tanstack/react-router"

import type { RosterInput } from "@/lib/sf6/analysis-scope"
import type { ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData, RosterOverviewData } from "@/lib/sf6/query-options"
import type { RankId } from "@/lib/sf6/ranks"
import type { RosterSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { AnalysisViewTabs } from "@/components/sf6/analysis-view-tabs"
import { ControlComparisonResults } from "@/components/sf6/control-comparison-results"
import { PlayerControlField } from "@/components/sf6/filters/player-control-field"
import { RankField } from "@/components/sf6/filters/rank-field"
import { ReportingPeriodField } from "@/components/sf6/filters/reporting-period-field"
import { ResultsContent, ResultsPending } from "@/components/sf6/results-state"
import { RosterRankResults } from "@/components/sf6/roster/rank-results"
import { SnapshotResults } from "@/components/sf6/roster/snapshot-results"
import { RosterStabilityResults } from "@/components/sf6/roster/stability-results"
import { RosterTimeResults } from "@/components/sf6/roster/time-results"
import { useAnalyticsQuery } from "@/hooks/use-analytics-query"
import { getControlComparisonRanks, getRosterPeriodOptions } from "@/lib/sf6/analysis-dependencies"
import { buildRosterInput, getActiveInputKey } from "@/lib/sf6/analysis-scope"
import { rosterOverviewQueryOptions } from "@/lib/sf6/query-options"
import { isMasterSubdivisionRank } from "@/lib/sf6/ranks"

const viewOptions = [
  { value: "snapshot", label: "Snapshot" },
  { value: "controls", label: "Control styles" },
  { value: "ranks", label: "Across ranks" },
  { value: "time", label: "Over time" },
  { value: "stability", label: "Stability" },
] as const

type RosterOverviewViewProps = {
  period?: ReportingPeriod
  search: RosterSearch
  meta: MetaData
}
type RosterChange = (changes: Partial<RosterSearch>) => void

const RosterToolbar = ({
  period,
  search,
  meta,
  input,
  rankValue,
  periods,
  change,
}: RosterOverviewViewProps & {
  input: RosterInput
  rankValue: RankId
  periods: readonly ReportingPeriod[]
  change: RosterChange
}) => {
  const showPeriod = search.view !== "time"
  const showRank = search.view !== "ranks"
  const showPlayerControl = search.view === "snapshot" && !isMasterSubdivisionRank(search.rank)
  const ranks = search.view === "controls" ? getControlComparisonRanks(meta.ranks) : meta.ranks
  return (
    <AnalysisToolbar
      title="Roster overview"
      description="Compare ranked average win rate, popularity, controls, and environment shape."
      views={
        <AnalysisViewTabs
          value={search.view}
          options={viewOptions}
          aria-label="Roster views"
          onChange={(view) => {
            change({ view })
          }}
        />
      }
    >
      {showPeriod && period !== undefined ? (
        <ReportingPeriodField
          value={period}
          periods={periods}
          onChange={(value) => {
            change({ period: value })
          }}
        />
      ) : null}
      {showRank ? (
        <RankField
          value={rankValue}
          ranks={ranks}
          onChange={(value) => {
            change({ rank: value })
          }}
        />
      ) : null}
      {showPlayerControl && input.view === "snapshot" ? (
        <PlayerControlField
          value={input.playerControl}
          controls={meta.playerControls}
          onChange={(value) => {
            change({ playerControl: value })
          }}
        />
      ) : null}
    </AnalysisToolbar>
  )
}

const RosterResults = ({
  data,
  input,
  meta,
}: {
  data: RosterOverviewData
  input: RosterInput
  meta: MetaData
}) =>
  input.view === "snapshot" && data.view === "snapshot" ? (
    <SnapshotResults
      data={data}
      meta={meta}
      period={input.period}
      rank={input.rank}
      playerControl={input.playerControl}
    />
  ) : input.view === "controls" && data.view === "controls" ? (
    <ControlComparisonResults
      data={data}
      meta={meta}
      chartTitle="Modern minus Classic"
      chartDescription="Positive values mean the character's average win rate is higher with Modern controls."
      tableTitle="Control-style results"
      tableDescription="Average win rate combines both opponent control styles. Usage is each character's share among that control population."
      unsupportedDescription="Master subdivision snapshots combine all control styles. Choose All Master or a standard rank to compare Classic and Modern players."
    />
  ) : input.view === "ranks" && data.view === "ranks" ? (
    <RosterRankResults data={data} />
  ) : input.view === "time" && data.view === "time" ? (
    <RosterTimeResults data={data} />
  ) : input.view === "stability" && data.view === "stability" ? (
    <RosterStabilityResults data={data} meta={meta} />
  ) : null

const RosterOverviewView = ({ period, search, meta }: RosterOverviewViewProps) => {
  const navigate = useNavigate({ from: "/roster" })
  const change: RosterChange = (changes) => {
    void navigate({
      search: (previous) => {
        return { ...previous, ...changes }
      },
      replace: true,
    })
  }
  const input = buildRosterInput(search, period)
  const { data, isUpdating } = useAnalyticsQuery(rosterOverviewQueryOptions(input), input)
  const rankValue =
    search.view === "controls"
      ? (getControlComparisonRanks(meta.ranks).find((rank) => rank.id === search.rank)?.id ??
        "all-master")
      : search.rank
  const periods = getRosterPeriodOptions(
    search.view,
    rankValue,
    meta.periods,
    meta.subdivisionPeriods,
  )
  return (
    <AnalysisPage
      toolbar={
        <RosterToolbar
          period={period}
          search={search}
          meta={meta}
          input={input}
          rankValue={rankValue}
          periods={periods}
          change={change}
        />
      }
      resetKey={getActiveInputKey(input)}
    >
      {data === undefined ? (
        <ResultsPending />
      ) : (
        <ResultsContent isUpdating={isUpdating}>
          <RosterResults data={data} input={input} meta={meta} />
        </ResultsContent>
      )}
    </AnalysisPage>
  )
}

export { RosterOverviewView }
