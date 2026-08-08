import { useNavigate } from "@tanstack/react-router"
import { ArrowLeftRight } from "lucide-react"

import type { CharacterId, ControlMatchup, ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { RankId } from "@/lib/sf6/ranks"
import type { MatchupSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { CharacterField } from "@/components/sf6/filters/character-field"
import { ControlMatchupField } from "@/components/sf6/filters/control-matchup-field"
import { RankField } from "@/components/sf6/filters/rank-field"
import { ReportingPeriodField } from "@/components/sf6/filters/reporting-period-field"
import { MatchupProfileResults } from "@/components/sf6/matchups/profile-results"
import { ResultsContent, ResultsPending } from "@/components/sf6/results-state"
import { Button } from "@/components/ui/button"
import { useAnalyticsQuery } from "@/hooks/use-analytics-query"
import { matchupExplorerQueryOptions } from "@/lib/sf6/query-options"
import { getEffectiveControls, getPeriodsForRank } from "@/lib/sf6/rank-selection"
import { isMasterSubdivisionRank } from "@/lib/sf6/ranks"

type MatchupExplorerViewProps = {
  period: ReportingPeriod
  search: MatchupSearch
  meta: MetaData
}

const MatchupExplorerView = ({ period, search, meta }: MatchupExplorerViewProps) => {
  const navigate = useNavigate({ from: "/matchups" })
  const change = (
    changes: Partial<{
      period: ReportingPeriod
      rank: RankId
      controls: ControlMatchup
      character: CharacterId
      opponent: CharacterId
    }>,
  ) => {
    void navigate({
      search: (previous) => {
        return { ...previous, ...changes }
      },
      replace: true,
    })
  }
  const controls = getEffectiveControls(search.rank, search.controls)
  const input = {
    period,
    rank: search.rank,
    controls,
    character: search.character,
    opponent: search.opponent,
  }
  const { data, displayedInput, isUpdating } = useAnalyticsQuery(
    matchupExplorerQueryOptions(input),
    input,
  )
  const toolbar = (
    <AnalysisToolbar
      title="Matchup explorer"
      description="Inspect a complete matchup profile and follow one pair across ranks, controls, and time."
    >
      <ReportingPeriodField
        value={period}
        periods={getPeriodsForRank(search.rank, meta.periods, meta.subdivisionPeriods)}
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
      <ControlMatchupField
        value={controls}
        controls={meta.controls}
        disabled={isMasterSubdivisionRank(search.rank)}
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
      <CharacterField
        label="Opponent"
        value={search.opponent}
        characters={meta.characters}
        onChange={(value) => {
          change({ opponent: value })
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="self-end"
        onClick={() => {
          change({ character: search.opponent, opponent: search.character })
        }}
      >
        <ArrowLeftRight data-icon="inline-start" />
        Swap sides
      </Button>
    </AnalysisToolbar>
  )
  return (
    <AnalysisPage
      toolbar={toolbar}
      resetKey={`${period}|${search.rank}|${search.controls}|${search.character}|${search.opponent}`}
    >
      {data === undefined ? (
        <ResultsPending />
      ) : (
        <ResultsContent isUpdating={isUpdating}>
          <MatchupProfileResults
            data={data}
            meta={meta}
            period={displayedInput.period}
            controls={displayedInput.controls}
            character={displayedInput.character}
            opponent={displayedInput.opponent}
          />
        </ResultsContent>
      )}
    </AnalysisPage>
  )
}

export { MatchupExplorerView }
