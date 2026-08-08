import { useNavigate } from "@tanstack/react-router"

import type { ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { ChangeSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { AnalysisViewTabs } from "@/components/sf6/analysis-view-tabs"
import { ChangeMatchupResults } from "@/components/sf6/changes/matchup-results"
import { ChangeOverviewResults } from "@/components/sf6/changes/overview-results"
import { ChangeTrendResults } from "@/components/sf6/changes/trend-results"
import { CharacterMultiField } from "@/components/sf6/filters/character-multi-field"
import { PlayerControlField } from "@/components/sf6/filters/player-control-field"
import { RankField } from "@/components/sf6/filters/rank-field"
import { ReportingPeriodField } from "@/components/sf6/filters/reporting-period-field"
import { ResultsContent, ResultsPending } from "@/components/sf6/results-state"
import { useAnalyticsQuery } from "@/hooks/use-analytics-query"
import { buildChangeInput, getActiveInputKey } from "@/lib/sf6/analysis-scope"
import { changeExplorerQueryOptions } from "@/lib/sf6/query-options"
import { getPeriodsForRank } from "@/lib/sf6/rank-selection"
import { isMasterSubdivisionRank } from "@/lib/sf6/ranks"

const viewOptions = [
  { value: "overview", label: "Overview" },
  { value: "trends", label: "Character trends" },
  { value: "matchups", label: "Matchup shifts" },
] as const

type ChangeExplorerViewProps = {
  fromPeriod: ReportingPeriod
  toPeriod: ReportingPeriod
  search: ChangeSearch
  meta: MetaData
}

const ChangeExplorerView = ({ fromPeriod, toPeriod, search, meta }: ChangeExplorerViewProps) => {
  const navigate = useNavigate({ from: "/changes" })
  const change = (changes: Partial<ChangeSearch>) => {
    void navigate({
      search: (previous) => {
        return { ...previous, ...changes }
      },
      replace: true,
    })
  }
  const input = buildChangeInput(search, fromPeriod, toPeriod)
  const { data, isUpdating } = useAnalyticsQuery(changeExplorerQueryOptions(input), input)
  const periods = getPeriodsForRank(search.rank, meta.periods, meta.subdivisionPeriods)
  const showFocusCharacters = search.view === "trends"
  const showPlayerControl = !isMasterSubdivisionRank(search.rank)
  const toolbar = (
    <AnalysisToolbar
      title="Change explorer"
      description="Compare performance, popularity, matchup, and environment movement."
      views={
        <AnalysisViewTabs
          value={search.view}
          options={viewOptions}
          aria-label="Change views"
          onChange={(view) => {
            change({ view })
          }}
        />
      }
    >
      <ReportingPeriodField
        label="From period"
        value={fromPeriod}
        periods={periods}
        onChange={(value) => {
          change({ fromPeriod: value })
        }}
      />
      <ReportingPeriodField
        label="To period"
        value={toPeriod}
        periods={periods}
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
      {showPlayerControl && input.playerControl !== undefined ? (
        <PlayerControlField
          value={input.playerControl}
          controls={meta.playerControls}
          onChange={(value) => {
            change({ playerControl: value })
          }}
        />
      ) : null}
      {showFocusCharacters ? (
        <CharacterMultiField
          label="Focus characters"
          value={search.focusCharacters}
          characters={meta.characters}
          className="sm:col-span-2"
          onChange={(value) => {
            change({ focusCharacters: value })
          }}
          description="Focus series show whether changes persist or revert across the selected interval."
        />
      ) : null}
    </AnalysisToolbar>
  )
  return (
    <AnalysisPage toolbar={toolbar} resetKey={getActiveInputKey(input)}>
      {data === undefined ? (
        <ResultsPending />
      ) : (
        <ResultsContent isUpdating={isUpdating}>
          {data.view === "overview" ? (
            <ChangeOverviewResults data={data} />
          ) : data.view === "trends" ? (
            <ChangeTrendResults data={data} meta={meta} />
          ) : (
            <ChangeMatchupResults data={data} meta={meta} />
          )}
        </ResultsContent>
      )}
    </AnalysisPage>
  )
}

export { ChangeExplorerView }
