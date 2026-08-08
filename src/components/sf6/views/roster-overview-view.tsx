import { useNavigate } from "@tanstack/react-router"
import * as z from "zod"

import type { ReportingPeriod, PlayerControl } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { RankId } from "@/lib/sf6/ranks"
import type { RosterSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { PlayerControlField } from "@/components/sf6/filters/player-control-field"
import { RankField } from "@/components/sf6/filters/rank-field"
import { ReportingPeriodField } from "@/components/sf6/filters/reporting-period-field"
import { ModeTabs } from "@/components/sf6/mode-tabs"
import { ResultsContent, ResultsPending } from "@/components/sf6/results-state"
import { ControlResults } from "@/components/sf6/roster/control-results"
import { LandscapeResults } from "@/components/sf6/roster/landscape-results"
import { SnapshotResults } from "@/components/sf6/roster/snapshot-results"
import { useAnalyticsQuery } from "@/hooks/use-analytics-query"
import { getRosterModePlayerControl } from "@/lib/sf6/analysis-scope"
import { rosterOverviewQueryOptions } from "@/lib/sf6/query-options"
import { getPeriodsForRank, getRankComparisonPeriods } from "@/lib/sf6/rank-selection"
import { isMasterSubdivisionRank } from "@/lib/sf6/ranks"

type RosterOverviewViewProps = {
  period: ReportingPeriod
  search: RosterSearch
  meta: MetaData
}

const RosterOverviewView = ({ period, search, meta }: RosterOverviewViewProps) => {
  const navigate = useNavigate({ from: "/roster" })
  const change = (
    changes: Partial<{
      period: ReportingPeriod
      rank: RankId
      playerControl: PlayerControl
      mode: RosterSearch["mode"]
    }>,
  ) => {
    void navigate({
      search: (previous) => {
        return { ...previous, ...changes }
      },
      replace: true,
    })
  }
  const input = {
    period,
    rank: search.rank,
    playerControl: getRosterModePlayerControl(search.rank, search.mode, search.playerControl),
    mode: search.mode,
  }
  const playerControlDisabled = search.mode !== "snapshot" || isMasterSubdivisionRank(search.rank)
  const playerControlDescription = isMasterSubdivisionRank(search.rank)
    ? "Master subdivisions combine all control styles."
    : search.mode === "landscape"
      ? "Landscape uses combined controls for comparable rank and time summaries."
      : search.mode === "controls"
        ? "Control differences compare Classic and Modern populations."
        : undefined
  const { data, displayedInput, isUpdating } = useAnalyticsQuery(
    rosterOverviewQueryOptions(input),
    input,
  )
  const toolbar = (
    <AnalysisToolbar
      title="Roster overview"
      description="Use one context to compare performance, popularity, control styles, and environment shape."
    >
      <ReportingPeriodField
        value={period}
        periods={
          search.mode === "landscape"
            ? getRankComparisonPeriods(meta.periods, meta.subdivisionPeriods)
            : getPeriodsForRank(search.rank, meta.periods, meta.subdivisionPeriods)
        }
        onChange={(value) => {
          change({ period: value })
        }}
      />
      <RankField
        value={search.rank}
        ranks={meta.ranks}
        onChange={(value) => {
          change({ rank: value })
        }}
      />
      <PlayerControlField
        value={input.playerControl}
        controls={meta.playerControls}
        disabled={playerControlDisabled}
        description={playerControlDescription}
        onChange={(value) => {
          change({ playerControl: value })
        }}
      />
      <ModeTabs
        value={search.mode}
        options={[
          { value: "snapshot", label: "Snapshot" },
          { value: "controls", label: "Control differences" },
          { value: "landscape", label: "Landscape and stability" },
        ]}
        onChange={(value) => {
          change({ mode: z.enum(["snapshot", "controls", "landscape"]).parse(value) })
        }}
      />
    </AnalysisToolbar>
  )
  return (
    <AnalysisPage
      toolbar={toolbar}
      resetKey={`${period}|${search.rank}|${search.playerControl}|${search.mode}`}
    >
      {data === undefined ? (
        <ResultsPending />
      ) : (
        <ResultsContent isUpdating={isUpdating}>
          {displayedInput.mode === "snapshot" && data.mode === "snapshot" ? (
            <SnapshotResults
              data={data}
              meta={meta}
              period={displayedInput.period}
              rank={displayedInput.rank}
              playerControl={displayedInput.playerControl}
            />
          ) : displayedInput.mode === "controls" && data.mode === "controls" ? (
            <ControlResults data={data} meta={meta} />
          ) : data.mode === "landscape" ? (
            <LandscapeResults data={data} meta={meta} />
          ) : null}
        </ResultsContent>
      )}
    </AnalysisPage>
  )
}

export { RosterOverviewView }
