import { useNavigate } from "@tanstack/react-router"

import type { ChangeInput } from "@/lib/sf6/analysis-scope"
import type { ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { ChangeSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisSelectionEmpty } from "@/components/sf6/analysis-selection-empty"
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
import { hasSelectedCharacters } from "@/lib/sf6/analysis-dependencies"
import { buildChangeInput, getActiveInputKey } from "@/lib/sf6/analysis-scope"
import { VIEW_LABELS } from "@/lib/sf6/presentation"
import { changeExplorerQueryOptions } from "@/lib/sf6/query-options"
import { getPeriodsForRank } from "@/lib/sf6/rank-selection"
import { isMasterSubdivisionRank } from "@/lib/sf6/ranks"

const viewOptions = [
  { value: "overview", label: VIEW_LABELS.overview },
  { value: "trends", label: VIEW_LABELS.trends },
  { value: "matchups", label: VIEW_LABELS.matchups },
] as const

type ChangeExplorerViewProps = {
  fromPeriod: ReportingPeriod
  toPeriod: ReportingPeriod
  search: ChangeSearch
  meta: MetaData
}

const ChangeQueryView = ({ input }: { input: ChangeInput }) => {
  const { data, isUpdating } = useAnalyticsQuery(changeExplorerQueryOptions(input), input)
  return data === undefined ? (
    <ResultsPending />
  ) : (
    <ResultsContent isUpdating={isUpdating}>
      {data.view === "overview" ? (
        <ChangeOverviewResults data={data} />
      ) : data.view === "trends" ? (
        <ChangeTrendResults data={data} />
      ) : (
        <ChangeMatchupResults data={data} />
      )}
    </ResultsContent>
  )
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
  const periods = getPeriodsForRank(search.rank, meta.periods, meta.subdivisionPeriods)
  const showFocusCharacters = search.view === "trends"
  const showPlayerControl = !isMasterSubdivisionRank(search.rank)
  const toolbar = (
    <AnalysisToolbar
      title="Change explorer"
      description="Compare average win rate, usage share, matchups, and environment metrics between two reporting periods."
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
        label="Start period"
        value={fromPeriod}
        periods={periods}
        onChange={(value) => {
          change({ fromPeriod: value })
        }}
      />
      <ReportingPeriodField
        label="End period"
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
          onChange={(value) => {
            change({ focusCharacters: value })
          }}
          description="Select characters to compare across the reporting period range."
        />
      ) : null}
    </AnalysisToolbar>
  )
  return (
    <AnalysisPage toolbar={toolbar} resetKey={getActiveInputKey(input)}>
      {input.view === "trends" && !hasSelectedCharacters(input.focusCharacters) ? (
        <AnalysisSelectionEmpty
          title="Select focus characters"
          description="Select one or more characters to compare across the reporting period range."
        />
      ) : (
        <ChangeQueryView input={input} />
      )}
    </AnalysisPage>
  )
}

export { ChangeExplorerView }
