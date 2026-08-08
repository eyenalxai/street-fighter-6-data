import { useNavigate } from "@tanstack/react-router"

import type { CharacterId, PlayerControl, ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { RankId } from "@/lib/sf6/ranks"
import type { ChangeSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { ChangeResults } from "@/components/sf6/changes/change-results"
import { CharacterMultiField } from "@/components/sf6/filters/character-multi-field"
import { PlayerControlField } from "@/components/sf6/filters/player-control-field"
import { RankField } from "@/components/sf6/filters/rank-field"
import { ReportingPeriodField } from "@/components/sf6/filters/reporting-period-field"
import { ResultsContent, ResultsPending } from "@/components/sf6/results-state"
import { useAnalyticsQuery } from "@/hooks/use-analytics-query"
import { changeExplorerQueryOptions } from "@/lib/sf6/query-options"
import { getEffectivePlayerControl, getPeriodsForRank } from "@/lib/sf6/rank-selection"
import { isMasterSubdivisionRank } from "@/lib/sf6/ranks"

type ChangeExplorerViewProps = {
  fromPeriod: ReportingPeriod
  toPeriod: ReportingPeriod
  search: ChangeSearch
  meta: MetaData
}

const ChangeExplorerView = ({ fromPeriod, toPeriod, search, meta }: ChangeExplorerViewProps) => {
  const navigate = useNavigate({ from: "/changes" })
  const change = (
    changes: Partial<{
      fromPeriod: ReportingPeriod
      toPeriod: ReportingPeriod
      rank: RankId
      playerControl: PlayerControl
      focusCharacters: CharacterId[]
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
    fromPeriod,
    toPeriod,
    rank: search.rank,
    playerControl: getEffectivePlayerControl(search.rank, search.playerControl),
    focusCharacters: search.focusCharacters,
  }
  const { data, isUpdating } = useAnalyticsQuery(changeExplorerQueryOptions(input), input)
  const periods = getPeriodsForRank(search.rank, meta.periods, meta.subdivisionPeriods)
  const toolbar = (
    <AnalysisToolbar
      title="Change explorer"
      description="Compare performance, popularity, matchup, balance, and diversity movement between reporting periods."
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
      <PlayerControlField
        value={input.playerControl}
        controls={meta.playerControls}
        disabled={isMasterSubdivisionRank(search.rank)}
        onChange={(value) => {
          change({ playerControl: value })
        }}
      />
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
    </AnalysisToolbar>
  )
  return (
    <AnalysisPage
      toolbar={toolbar}
      resetKey={`${fromPeriod}|${toPeriod}|${search.rank}|${search.playerControl}|${search.focusCharacters.join(",")}`}
    >
      {data === undefined ? (
        <ResultsPending />
      ) : (
        <ResultsContent isUpdating={isUpdating}>
          <ChangeResults data={data} meta={meta} />
        </ResultsContent>
      )}
    </AnalysisPage>
  )
}

export { ChangeExplorerView }
